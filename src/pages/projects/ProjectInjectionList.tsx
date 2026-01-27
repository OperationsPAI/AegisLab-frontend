/**
 * ProjectInjectionList - W&B-style injection list page for workspace
 *
 * Displays injections in a W&B Table format with:
 * - Row visibility toggles
 * - Status color dots
 * - Column management
 * - Search and filtering
 * - Shared filter/group/sort/columns state with workspace sidebar
 * - Mock data fallback when API returns no data
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import { TagOutlined } from '@ant-design/icons';
import type { InjectionDetailResp } from '@rcabench/client';
import { useQuery } from '@tanstack/react-query';
import { message, Modal, Space, Tag, Typography } from 'antd';

import { injectionApi } from '@/api/injections';
import WorkspacePageHeader from '@/components/workspace/WorkspacePageHeader';
import WorkspaceTable from '@/components/workspace/WorkspaceTable';
import type { ProjectOutletContext } from '@/hooks/useProjectContext';
import { useAuthStore } from '@/store/auth';
import { useWorkspaceStore } from '@/store/workspace';
import type { ColumnConfig, SortField } from '@/types/workspace';
import { getVisibleIdsFromMap } from '@/utils/idUtils';

import './ProjectInjectionList.css';

const { Text } = Typography;

// Table row data type
interface InjectionTableData {
  id: number;
  name: string;
  notes: string;
  fault_type: string;
  state: string;
  benchmark_name: string;
  pedestal_name: string;
  created_at: string;
  updated_at: string | undefined;
  labels: Array<string | undefined>;
  description: string;
  pre_duration: number;
}

// Status mapping for display
const statusDisplayMap: Record<string, { text: string; color: string }> = {
  initial: { text: 'Initial', color: '#d9d9d9' },
  pending: { text: 'Pending', color: '#faad14' },
  running: { text: 'Running', color: '#1890ff' },
  inject_success: { text: 'Success', color: '#52c41a' },
  build_success: { text: 'Built', color: '#52c41a' },
  failed: { text: 'Failed', color: '#f5222d' },
  stopped: { text: 'Stopped', color: '#8c8c8c' },
  finished: { text: 'Finished', color: '#52c41a' },
  crashed: { text: 'Crashed', color: '#faad14' },
};

// Fault types for mock data
const FAULT_TYPES = [
  'network',
  'cpu',
  'memory',
  'disk',
  'process',
  'kubernetes',
];
const INJECTION_STATUSES = [
  'running',
  'finished',
  'failed',
  'crashed',
  'initial',
];
const BENCHMARK_NAMES = [
  'SockShop',
  'TrainTicket',
  'OnlineBoutique',
  'HipsterShop',
  'TeaStore',
];

// Generate mock injections data
const generateMockInjections = (count: number): InjectionTableData[] => {
  return Array.from({ length: count }, (_, i) => {
    const faultType =
      FAULT_TYPES[Math.floor(Math.random() * FAULT_TYPES.length)];
    const status =
      INJECTION_STATUSES[Math.floor(Math.random() * INJECTION_STATUSES.length)];
    const benchmark =
      BENCHMARK_NAMES[Math.floor(Math.random() * BENCHMARK_NAMES.length)];
    return {
      id: i + 1,
      name: `${faultType}_delay_${String(i + 1).padStart(3, '0')}`,
      notes: `Fault injection test #${i + 1}`,
      fault_type: faultType,
      state: status,
      benchmark_name: benchmark,
      pedestal_name: `pedestal-${Math.floor(Math.random() * 5) + 1}`,
      created_at: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000
      ).toISOString(),
      labels: [
        `env:${['dev', 'staging', 'prod'][Math.floor(Math.random() * 3)]}`,
      ],
      description: `Testing ${faultType} fault injection on ${benchmark}`,
      pre_duration: Math.floor(Math.random() * 300) + 60,
    };
  });
};

// Pre-generated mock data
const MOCK_INJECTIONS = generateMockInjections(33);

const ProjectInjectionList: React.FC = () => {
  const navigate = useNavigate();
  const { teamName, projectName } = useOutletContext<ProjectOutletContext>();
  const { user } = useAuthStore();

  // Handle back to workspace
  const handleBackToWorkspace = () => {
    navigate(`/${teamName}/${projectName}/workspace`);
  };

  // Get shared table settings and visibility state from workspace store
  const {
    injectionsTableSettings,
    setInjectionsTableSettings,
    runsPanelCollapsed,
    setRunsPanelCollapsed,
    // Visibility management
    visibleRuns,
    setItemsVisible,
    initializeVisibility,
  } = useWorkspaceStore();

  // Workspace info
  const workspaceName = `${user?.username || 'User'}'s workspace`;

  // Handle workspace panel toggle
  const handleToggleRunsPanel = useCallback(() => {
    setRunsPanelCollapsed(!runsPanelCollapsed);
  }, [runsPanelCollapsed, setRunsPanelCollapsed]);

  // Extract values from shared settings
  const {
    sortFields,
    groupBy,
    pageSize,
    currentPage,
    columns: sharedColumns,
  } = injectionsTableSettings;

  // Callbacks to update shared settings
  const setSortFields = useCallback(
    (fields: SortField[]) => setInjectionsTableSettings({ sortFields: fields }),
    [setInjectionsTableSettings]
  );

  const setGroupBy = useCallback(
    (field: string | null) => setInjectionsTableSettings({ groupBy: field }),
    [setInjectionsTableSettings]
  );

  const setCurrentPage = useCallback(
    (page: number) => setInjectionsTableSettings({ currentPage: page }),
    [setInjectionsTableSettings]
  );

  const setPageSize = useCallback(
    (size: number) =>
      setInjectionsTableSettings({ pageSize: size, currentPage: 1 }),
    [setInjectionsTableSettings]
  );

  const setColumns = useCallback(
    (cols: ColumnConfig[]) => setInjectionsTableSettings({ columns: cols }),
    [setInjectionsTableSettings]
  );

  // Use shared columns from store, or use enhanced default if shared columns are basic
  const columns = useMemo(() => {
    // If shared columns have more than 5 columns, they've been customized - use them
    if (sharedColumns.length > 5) {
      return sharedColumns;
    }
    // Otherwise, use enhanced columns for the full page view
    const enhancedColumns: ColumnConfig[] = [
      {
        key: 'name',
        title: 'Name',
        dataIndex: 'name',
        type: 'text',
        width: 200,
        visible: true,
        pinned: true,
        locked: true,
        order: 0,
        sortable: true,
      },
      {
        key: 'notes',
        title: 'Notes',
        dataIndex: 'notes',
        type: 'text',
        width: 150,
        visible: true,
        pinned: false,
        order: 1,
      },
      {
        key: 'fault_type',
        title: 'Fault Type',
        dataIndex: 'fault_type',
        type: 'text',
        width: 120,
        visible: true,
        pinned: false,
        order: 2,
        filterable: true,
      },
      {
        key: 'state',
        title: 'Status',
        dataIndex: 'state',
        type: 'status',
        width: 100,
        visible: true,
        pinned: false,
        order: 3,
        filterable: true,
      },
      {
        key: 'benchmark_name',
        title: 'Benchmark',
        dataIndex: 'benchmark_name',
        type: 'text',
        width: 120,
        visible: true,
        pinned: false,
        order: 4,
      },
      {
        key: 'pedestal_name',
        title: 'Pedestal',
        dataIndex: 'pedestal_name',
        type: 'text',
        width: 120,
        visible: true,
        pinned: false,
        order: 5,
      },
      {
        key: 'created_at',
        title: 'Created',
        dataIndex: 'created_at',
        type: 'date',
        width: 120,
        visible: true,
        pinned: false,
        order: 6,
        sortable: true,
      },
      {
        key: 'labels',
        title: 'Labels',
        dataIndex: 'labels',
        type: 'tags',
        width: 150,
        visible: true,
        pinned: false,
        order: 7,
      },
      {
        key: 'id',
        title: 'ID',
        dataIndex: 'id',
        type: 'number',
        width: 80,
        visible: false,
        pinned: false,
        order: 100,
      },
      {
        key: 'description',
        title: 'Description',
        dataIndex: 'description',
        type: 'text',
        width: 200,
        visible: false,
        pinned: false,
        order: 101,
      },
      {
        key: 'updated_at',
        title: 'Updated',
        dataIndex: 'updated_at',
        type: 'date',
        width: 120,
        visible: false,
        pinned: false,
        order: 102,
      },
      {
        key: 'pre_duration',
        title: 'Duration',
        dataIndex: 'pre_duration',
        type: 'duration',
        width: 100,
        visible: false,
        pinned: false,
        order: 103,
      },
    ];
    return enhancedColumns;
  }, [sharedColumns]);

  // Search and selection state (local state since they don't need to sync)
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // Get visualized row keys from store (converted from string run IDs to numbers)
  const visualizedRowKeys = useMemo(() => {
    return getVisibleIdsFromMap(visibleRuns, 'injections');
  }, [visibleRuns]);

  // Handle visibility change from table - sync to store
  const handleVisualizeChange = useCallback(
    (keys: React.Key[]) => {
      const newIds = new Set(keys.map((k) => Number(k)));
      const oldIds = new Set(visualizedRowKeys);

      // Find items to show (added)
      const toShow = [...newIds].filter((id) => !oldIds.has(id));
      // Find items to hide (removed)
      const toHide = [...oldIds].filter((id) => !newIds.has(id));

      if (toShow.length > 0) {
        setItemsVisible('injections', toShow, true);
      }
      if (toHide.length > 0) {
        setItemsVisible('injections', toHide, false);
      }
    },
    [visualizedRowKeys, setItemsVisible]
  );

  // Fetch injections data
  const { data: injectionsData, isLoading } = useQuery({
    queryKey: ['injections', projectName, currentPage, pageSize, searchText],
    queryFn: () =>
      injectionApi.getInjections({
        page: currentPage,
        size: pageSize,
        // Add search filter when backend supports it
      }),
  });

  // Transform API data to table format, with mock data fallback
  const tableData = useMemo(() => {
    // If API returns data, use it
    if (injectionsData?.items && injectionsData.items.length > 0) {
      return injectionsData.items.map((item: InjectionDetailResp) => ({
        id: item.id ?? 0,
        name: item.name ?? `Injection #${item.id}`,
        notes: '',
        fault_type: item.fault_type ?? 'unknown',
        state: item.state ?? 'initial',
        benchmark_name: item.benchmark_name ?? '-',
        pedestal_name: item.pedestal_name ?? '-',
        created_at: item.created_at ?? new Date().toISOString(),
        updated_at: item.updated_at ?? item.created_at,
        labels: item.labels?.map((l) => l.key) ?? [],
        description: item.description ?? '',
        pre_duration: item.pre_duration ?? 0,
      }));
    }

    // Use mock data as fallback
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    let filtered = MOCK_INJECTIONS;

    // Apply search filter
    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      filtered = MOCK_INJECTIONS.filter(
        (item) =>
          item.name.toLowerCase().includes(lowerSearch) ||
          item.fault_type.toLowerCase().includes(lowerSearch) ||
          item.benchmark_name.toLowerCase().includes(lowerSearch)
      );
    }

    return filtered.slice(start, end);
  }, [injectionsData, currentPage, pageSize, searchText]);

  // Total count (API or mock)
  const totalCount = useMemo(() => {
    if (injectionsData?.pagination?.total) {
      return injectionsData.pagination.total;
    }
    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      return MOCK_INJECTIONS.filter(
        (item) =>
          item.name.toLowerCase().includes(lowerSearch) ||
          item.fault_type.toLowerCase().includes(lowerSearch) ||
          item.benchmark_name.toLowerCase().includes(lowerSearch)
      ).length;
    }
    return MOCK_INJECTIONS.length;
  }, [injectionsData, searchText]);

  // Initialize visibility for items when data loads
  useEffect(() => {
    if (tableData.length > 0) {
      // Initialize visibility in store (will only set if not already initialized)
      initializeVisibility(
        'injections',
        tableData.map((d) => d.id),
        5 // Default: first 5 visible
      );
    }
  }, [tableData, initializeVisibility]);

  // Handle pagination change
  const handlePaginationChange = (page: number, size: number) => {
    setCurrentPage(page);
    if (size !== pageSize) {
      setPageSize(size);
    }
  };

  // Handle row click - navigate to detail with state for instant display
  const handleRowClick = (record: InjectionTableData) => {
    navigate(`/${teamName}/${projectName}/injections/${record.id}`, {
      state: { injection: { name: record.name, state: record.state } },
    });
  };

  // Handle new injection
  const handleNewClick = () => {
    navigate(`/${teamName}/${projectName}/injections/create`);
  };

  // Handle filter click (placeholder for now)
  const handleFilterClick = () => {
    // TODO: Implement filter modal/drawer
  };

  // Handle export to CSV
  const handleExportClick = () => {
    if (tableData.length === 0) return;

    // Generate CSV content
    const headers = columns
      .filter((col) => col.visible)
      .map((col) => col.title);
    const rows = tableData.map((row) =>
      columns
        .filter((col) => col.visible)
        .map((col) => {
          const value = row[col.dataIndex as keyof InjectionTableData];
          if (Array.isArray(value)) return value.join('; ');
          return String(value ?? '');
        })
    );

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `injections-${projectName}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // Bulk action handlers
  const handleBulkDelete = useCallback(() => {
    Modal.confirm({
      title: 'Delete Injections',
      content: `Are you sure you want to delete ${selectedRowKeys.length} injection(s)?`,
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: async () => {
        // TODO: Implement bulk delete API call
        message.success(`Deleted ${selectedRowKeys.length} injection(s)`);
        setSelectedRowKeys([]);
      },
    });
  }, [selectedRowKeys]);

  const handleBulkAddTags = useCallback(() => {
    // TODO: Implement tag modal
    message.info('Add tags feature coming soon');
  }, []);

  const handleBulkMoveToProject = useCallback(() => {
    // TODO: Implement move to project modal
    message.info('Move to project feature coming soon');
  }, []);

  // Custom name renderer - simplified to show only name
  const renderName = (record: { name: string }) => (
    <Text strong>{record.name}</Text>
  );

  // Custom status renderer
  const renderStatus = (record: { state: string }) => {
    const status = statusDisplayMap[record.state] || {
      text: record.state,
      color: '#6b7280',
    };
    return (
      <Tag color={status.color} style={{ fontSize: '11px' }}>
        {status.text}
      </Tag>
    );
  };

  // Custom cell renderer for labels
  const renderCell = (
    _key: string,
    _value: unknown,
    record: InjectionTableData
  ): React.ReactNode => {
    if (_key === 'labels') {
      const labels = (record.labels || []).filter(Boolean) as string[];
      if (labels.length === 0) return <Text type='secondary'>-</Text>;
      return (
        <Space size='small' wrap>
          {labels.slice(0, 2).map((label, i) => (
            <Tag key={i} icon={<TagOutlined />} style={{ fontSize: '10px' }}>
              {label}
            </Tag>
          ))}
          {labels.length > 2 && (
            <Tag style={{ fontSize: '10px' }}>+{labels.length - 2}</Tag>
          )}
        </Space>
      );
    }
    return undefined;
  };

  return (
    <div className='project-injection-list'>
      {/* Workspace header */}
      <WorkspacePageHeader
        workspaceName={workspaceName}
        workspaceType='personal'
        lastSaved={new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()}
        runsPanelCollapsed={runsPanelCollapsed}
        onToggleRunsPanel={handleToggleRunsPanel}
      />

      <WorkspaceTable
        dataSource={tableData}
        loading={isLoading}
        total={totalCount}
        title='Injections'
        storageKey={`injections-${projectName}`}
        columns={columns}
        onColumnsChange={setColumns}
        selectedRowKeys={selectedRowKeys}
        onSelectChange={setSelectedRowKeys}
        visualizedRowKeys={visualizedRowKeys}
        onVisualizeChange={handleVisualizeChange}
        searchText={searchText}
        onSearchChange={setSearchText}
        searchPlaceholder='Search injections...'
        currentPage={currentPage}
        pageSize={pageSize}
        onPaginationChange={handlePaginationChange}
        sortFields={sortFields}
        onSortFieldsChange={setSortFields}
        defaultSortField='created_at'
        defaultSortOrder='desc'
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
        onRowClick={handleRowClick}
        onNewClick={handleNewClick}
        onFilterClick={handleFilterClick}
        onExportClick={handleExportClick}
        newButtonText='New Injection'
        renderName={renderName}
        renderStatus={renderStatus}
        renderCell={renderCell}
        statusField='state'
        onBackClick={handleBackToWorkspace}
        backTooltip='Back to Workspace'
        onBulkDelete={handleBulkDelete}
        onBulkAddTags={handleBulkAddTags}
        onBulkMoveToProject={handleBulkMoveToProject}
      />
    </div>
  );
};

export default ProjectInjectionList;
