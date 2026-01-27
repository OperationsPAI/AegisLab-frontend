/**
 * WorkspaceTable - W&B-style data table for workspace pages
 *
 * A comprehensive table component with:
 * - Row visibility toggles (eye icon)
 * - Status color dots
 * - Column management with header dropdowns
 * - Search and filtering
 * - Pagination
 * - Row selection
 * - Multi-field sorting
 * - Grouping
 * - Synchronized display settings (cropMode, sortOrder, colors)
 */
import {
  type Key,
  type ReactNode,
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  CheckSquareOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import {
  Button,
  Checkbox,
  type MenuProps,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import useColumnResize from '@/hooks/useColumnResize';
import { useRunListSettings } from '@/hooks/useRunListSettings';
import {
  type ColumnConfig,
  type RunsDataSource,
  type SortField,
  STATUS_COLORS,
  type StatusColorKey,
} from '@/types/workspace';
import { cropText, needsJsCropping } from '@/utils/textCrop';

import ColumnHeaderDropdown from './ColumnHeaderDropdown';
import ColumnManager from './ColumnManager';
import RunListDropdown from './RunListDropdown';
import TableToolbar from './TableToolbar';

import './WorkspaceTable.css';

dayjs.extend(relativeTime);

const { Text } = Typography;

export interface WorkspaceTableProps<T extends { id: number | string }> {
  // Data
  dataSource: T[];
  loading?: boolean;
  total: number;

  // Title and identity
  title: string;
  storageKey: string;

  // Data source type for shared settings (injections/executions)
  runsDataSource?: RunsDataSource;

  // Column configuration
  columns: ColumnConfig[];
  onColumnsChange: (columns: ColumnConfig[]) => void;

  // Row selection
  selectedRowKeys?: Key[];
  onSelectChange?: (keys: Key[]) => void;

  // Row visibility (for visualization)
  visualizedRowKeys?: Key[];
  onVisualizeChange?: (keys: Key[]) => void;

  // Search
  searchText?: string;
  onSearchChange?: (text: string) => void;
  searchPlaceholder?: string;

  // Pagination
  currentPage: number;
  pageSize: number;
  onPaginationChange: (page: number, size: number) => void;

  // Sorting (multi-field)
  sortFields?: SortField[];
  onSortFieldsChange?: (fields: SortField[]) => void;
  defaultSortField?: string;
  defaultSortOrder?: 'asc' | 'desc';

  // Grouping
  groupBy?: string | null;
  onGroupByChange?: (field: string | null) => void;

  // Actions
  onRowClick?: (record: T) => void;
  onNewClick?: () => void;
  newButtonText?: string;
  onExportClick?: () => void;
  onFilterClick?: () => void;
  onBackClick?: () => void;
  backTooltip?: string;

  // Custom renderers
  renderStatus?: (record: T) => ReactNode;
  renderName?: (record: T) => ReactNode;
  renderCell?: (key: string, value: unknown, record: T) => ReactNode;

  // Status field
  statusField?: keyof T;

  // Extra toolbar content
  toolbarExtra?: ReactNode;

  // Bulk actions
  onBulkDelete?: () => void;
  onBulkAddTags?: () => void;
  onBulkMoveToProject?: () => void;
}

// Generate unique key for sort field
const generateSortKey = () =>
  `sort-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

function WorkspaceTable<T extends { id: number | string }>({
  dataSource,
  loading = false,
  total,
  title,
  runsDataSource = 'injections',
  columns,
  onColumnsChange,
  selectedRowKeys = [],
  onSelectChange,
  visualizedRowKeys,
  onVisualizeChange,
  searchText = '',
  onSearchChange,
  searchPlaceholder,
  currentPage,
  pageSize,
  onPaginationChange,
  sortFields = [],
  onSortFieldsChange,
  defaultSortField,
  defaultSortOrder,
  groupBy,
  onGroupByChange,
  onRowClick,
  onNewClick,
  newButtonText,
  onExportClick,
  onFilterClick,
  onBackClick,
  backTooltip,
  renderStatus,
  renderName,
  renderCell,
  statusField = 'state' as keyof T,
  toolbarExtra,
  onBulkDelete,
  onBulkAddTags,
  onBulkMoveToProject,
}: WorkspaceTableProps<T>) {
  const [columnManagerOpen, setColumnManagerOpen] = useState(false);
  const [showOnlyVisualized, setShowOnlyVisualized] = useState(false);
  const [hoveredColumnKey, setHoveredColumnKey] = useState<string | null>(null);

  // Get shared display settings (cropMode, sortOrder, colors) from hook
  const { cropMode, sortOrder, setCropMode, setSortOrder, randomizeColors } =
    useRunListSettings({ dataSource: runsDataSource });

  // Column resize hook
  const { getResizeHandleProps } = useColumnResize({
    columns,
    onColumnsChange,
  });

  // Filter data when showOnlyVisualized is enabled
  const filteredDataSource = useMemo(() => {
    if (
      showOnlyVisualized &&
      visualizedRowKeys &&
      visualizedRowKeys.length > 0
    ) {
      return dataSource.filter((d) => visualizedRowKeys.includes(d.id));
    }
    return dataSource;
  }, [dataSource, showOnlyVisualized, visualizedRowKeys]);

  // Get visible columns sorted by order
  const visibleColumns = useMemo(
    () =>
      columns.filter((col) => col.visible).sort((a, b) => a.order - b.order),
    [columns]
  );

  // Count visualized rows
  const visualizedCount = visualizedRowKeys?.length ?? 0;

  // Get current sort field and order (first in list for column header highlight)
  const currentSortField = sortFields[0]?.field;
  const currentSortOrder = sortFields[0]?.order;

  // Toggle row visibility
  const handleToggleVisibility = useCallback(
    (id: Key) => {
      if (!onVisualizeChange || !visualizedRowKeys) return;
      const newKeys = visualizedRowKeys.includes(id)
        ? visualizedRowKeys.filter((k) => k !== id)
        : [...visualizedRowKeys, id];
      onVisualizeChange(newKeys);
    },
    [visualizedRowKeys, onVisualizeChange]
  );

  // Handle column pin toggle
  const handlePinColumn = useCallback(
    (columnKey: string) => {
      const updatedColumns = columns.map((col) =>
        col.key === columnKey ? { ...col, pinned: !col.pinned } : col
      );
      onColumnsChange(updatedColumns);
    },
    [columns, onColumnsChange]
  );

  // Handle column hide
  const handleHideColumn = useCallback(
    (columnKey: string) => {
      const updatedColumns = columns.map((col) =>
        col.key === columnKey ? { ...col, visible: false } : col
      );
      onColumnsChange(updatedColumns);
    },
    [columns, onColumnsChange]
  );

  // Handle column sort from header dropdown
  const handleColumnSort = useCallback(
    (columnKey: string, order: 'asc' | 'desc') => {
      if (!onSortFieldsChange) return;
      // Find column to get dataIndex
      const col = columns.find((c) => c.key === columnKey);
      if (!col) return;

      // Replace all sort fields with this one
      onSortFieldsChange([
        {
          key: generateSortKey(),
          field: col.dataIndex,
          order,
        },
      ]);
    },
    [columns, onSortFieldsChange]
  );

  // Get status color
  const getStatusColor = (status: unknown): string => {
    const statusStr = String(status).toLowerCase();
    return STATUS_COLORS[statusStr as StatusColorKey] || STATUS_COLORS.pending;
  };

  // Default cell renderer based on column type
  const defaultCellRenderer = useCallback(
    (col: ColumnConfig, value: unknown, record: T): ReactNode => {
      // Allow custom renderer override
      if (renderCell) {
        const custom = renderCell(col.key, value, record);
        if (custom !== undefined) return custom;
      }

      switch (col.type) {
        case 'date':
          return value ? (
            <Text type='secondary'>{dayjs(value as string).fromNow()}</Text>
          ) : (
            '-'
          );

        case 'duration':
          return value ? <Text code>{value as string}</Text> : '-';

        case 'tags': {
          const tags = value as string[] | undefined;
          if (!tags?.length) return '-';
          return (
            <Space size='small' wrap>
              {tags.slice(0, 2).map((tag, i) => (
                <Tag key={i} style={{ fontSize: '11px' }}>
                  {tag}
                </Tag>
              ))}
              {tags.length > 2 && (
                <Tooltip title={tags.slice(2).join(', ')}>
                  <Tag style={{ fontSize: '11px' }}>+{tags.length - 2}</Tag>
                </Tooltip>
              )}
            </Space>
          );
        }

        case 'user':
          return <Text>{value as string}</Text>;

        case 'status':
          if (renderStatus) return renderStatus(record);
          return (
            <Tag color={getStatusColor(value)}>
              {String(value).toUpperCase()}
            </Tag>
          );

        case 'number':
          return <Text>{value as number}</Text>;

        case 'progress':
          return <Text>{String(value)}%</Text>;

        default:
          return <Text>{value as string}</Text>;
      }
    },
    [renderCell, renderStatus]
  );

  // Build Ant Design columns from config
  const antColumns: ColumnsType<T> = useMemo(() => {
    const result: ColumnsType<T> = [];

    // Checkbox column (if selection enabled)
    if (onSelectChange) {
      result.push({
        title: () => (
          <Checkbox
            checked={
              selectedRowKeys.length > 0 &&
              selectedRowKeys.length === dataSource.length
            }
            indeterminate={
              selectedRowKeys.length > 0 &&
              selectedRowKeys.length < dataSource.length
            }
            onChange={(e) => {
              if (e.target.checked) {
                onSelectChange(dataSource.map((d) => d.id));
              } else {
                onSelectChange([]);
              }
            }}
          />
        ),
        dataIndex: 'checkbox',
        key: 'checkbox',
        width: 40,
        fixed: 'left' as const,
        render: (_: unknown, record: T) => (
          <Checkbox
            checked={selectedRowKeys.includes(record.id)}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              if (e.target.checked) {
                onSelectChange([...selectedRowKeys, record.id]);
              } else {
                onSelectChange(selectedRowKeys.filter((k) => k !== record.id));
              }
            }}
          />
        ),
      });
    }

    // Add visible columns from config with header dropdowns
    // Note: Eye icon and status dot are now rendered inside the Name column
    visibleColumns.forEach((col) => {
      // Determine the title component
      let titleElement: React.ReactNode;

      if (col.key === 'name' && onVisualizeChange) {
        // Name column gets RunListDropdown with visibility controls as extra menu items
        const visibilityMenuItems: MenuProps['items'] = [
          {
            key: 'make-all-visible',
            icon: <EyeOutlined />,
            label: 'Make all visible',
            onClick: () => onVisualizeChange(dataSource.map((d) => d.id)),
          },
          {
            key: 'make-all-hidden',
            icon: <EyeInvisibleOutlined />,
            label: 'Make all hidden',
            onClick: () => onVisualizeChange([]),
          },
          { type: 'divider' as const },
          {
            key: 'only-show-visualized',
            label: (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  minWidth: 180,
                  gap: 12,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <span>Only show visualized</span>
                <Switch
                  size='small'
                  checked={showOnlyVisualized}
                  onChange={(checked) => setShowOnlyVisualized(checked)}
                />
              </div>
            ),
          },
          { type: 'divider' as const },
          {
            key: 'select-visible',
            icon: <CheckSquareOutlined />,
            label: 'Select visible runs',
            onClick: () => onSelectChange?.(visualizedRowKeys || []),
            disabled: !onSelectChange,
          },
        ];

        titleElement = (
          <RunListDropdown
            visualizedCount={visualizedCount}
            sortOrder={sortOrder}
            cropMode={cropMode}
            onSortOrderChange={setSortOrder}
            onCropModeChange={setCropMode}
            onRandomizeColors={randomizeColors}
            extraMenuItems={visibilityMenuItems}
            headerLabel={col.title}
          />
        );
      } else if (onSortFieldsChange) {
        // Other columns get the sort/pin/hide dropdown
        titleElement = (
          <ColumnHeaderDropdown
            column={col}
            currentSortField={currentSortField}
            currentSortOrder={currentSortOrder}
            onPin={handlePinColumn}
            onHide={handleHideColumn}
            onSort={handleColumnSort}
          >
            {col.title}
          </ColumnHeaderDropdown>
        );
      } else {
        titleElement = col.title;
      }

      const column: ColumnsType<T>[number] = {
        title: (
          <div className='column-header-wrapper'>
            {titleElement}
            {!col.pinned && <div {...getResizeHandleProps(col.key)} />}
          </div>
        ),
        dataIndex: col.dataIndex,
        key: col.key,
        width: col.width,
        fixed: col.pinned ? ('left' as const) : undefined,
        className: hoveredColumnKey === col.key ? 'column-hovered' : '',
        onHeaderCell: () => ({
          onMouseEnter: () => setHoveredColumnKey(col.key),
          onMouseLeave: () => setHoveredColumnKey(null),
        }),
        onCell: () => ({
          onMouseEnter: () => setHoveredColumnKey(col.key),
          onMouseLeave: () => setHoveredColumnKey(null),
        }),
        render: (value: unknown, record: T) => {
          // Name column: render with eye icon and status dot
          if (col.key === 'name') {
            const isVisible = visualizedRowKeys?.includes(record.id);
            const status = record[statusField];
            const nameValue = value as string;

            // Apply crop mode for non-'end' modes (CSS handles 'end' mode)
            const displayName = needsJsCropping(cropMode)
              ? cropText(nameValue, 30, cropMode)
              : nameValue;
            const isNameCropped = displayName !== nameValue;

            return (
              <div className='name-cell-content'>
                {onVisualizeChange && (
                  <Button
                    type='text'
                    size='small'
                    icon={
                      isVisible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleVisibility(record.id);
                    }}
                    className={`visibility-button ${isVisible ? 'visible' : ''}`}
                  />
                )}
                <span
                  className='status-dot'
                  style={{ backgroundColor: getStatusColor(status) }}
                />
                {renderName ? (
                  renderName(record)
                ) : isNameCropped ? (
                  <Tooltip title={nameValue} placement='topLeft'>
                    <span
                      className='name-text'
                      style={{ textOverflow: 'clip' }}
                    >
                      {displayName}
                    </span>
                  </Tooltip>
                ) : (
                  <span className='name-text'>{nameValue}</span>
                )}
              </div>
            );
          }
          return defaultCellRenderer(col, value, record);
        },
      };
      result.push(column);
    });

    return result;
  }, [
    visibleColumns,
    selectedRowKeys,
    visualizedRowKeys,
    dataSource,
    onSelectChange,
    onVisualizeChange,
    onSortFieldsChange,
    handleToggleVisibility,
    handlePinColumn,
    handleHideColumn,
    handleColumnSort,
    currentSortField,
    currentSortOrder,
    statusField,
    renderName,
    defaultCellRenderer,
    showOnlyVisualized,
    visualizedCount,
    getResizeHandleProps,
    hoveredColumnKey,
    cropMode,
    sortOrder,
    setCropMode,
    setSortOrder,
    randomizeColors,
  ]);

  return (
    <div className='workspace-table'>
      {/* Toolbar */}
      <TableToolbar
        title={title}
        total={total}
        searchPlaceholder={searchPlaceholder}
        searchValue={searchText}
        onSearchChange={onSearchChange}
        onBackClick={onBackClick}
        backTooltip={backTooltip}
        onFilterClick={onFilterClick}
        columns={columns}
        groupBy={groupBy}
        onGroupChange={onGroupByChange}
        sortFields={sortFields}
        onSortFieldsChange={onSortFieldsChange}
        defaultSortField={defaultSortField}
        defaultSortOrder={defaultSortOrder}
        onColumnsClick={() => setColumnManagerOpen(true)}
        onExportClick={onExportClick}
        onNewClick={onNewClick}
        newButtonText={newButtonText}
        extra={toolbarExtra}
        selectedCount={selectedRowKeys.length}
        onBulkTag={onBulkAddTags}
        onBulkMoveToProject={onBulkMoveToProject}
        onBulkDelete={onBulkDelete}
      />

      {/* Table */}
      <div className='table-container'>
        <Table
          dataSource={filteredDataSource}
          columns={antColumns}
          loading={loading}
          rowKey='id'
          pagination={false}
          scroll={{ x: 'max-content' }}
          onRow={(record) => ({
            onClick: () => onRowClick?.(record),
            className: 'table-row',
          })}
          className='data-table'
        />
      </div>

      {/* Pagination */}
      <div className='table-pagination'>
        <div className='pagination-info'>
          <span>
            {Math.min((currentPage - 1) * pageSize + 1, total)}-
            {Math.min(currentPage * pageSize, total)}
          </span>
          <Select
            value={pageSize}
            onChange={(value) => onPaginationChange(1, value)}
            size='small'
            options={[
              { value: 10, label: '10' },
              { value: 20, label: '20' },
              { value: 50, label: '50' },
              { value: 100, label: '100' },
            ]}
            className='page-size-select'
          />
          <span>of {total}</span>
        </div>
        <div className='pagination-buttons'>
          <Button
            size='small'
            disabled={currentPage <= 1}
            onClick={() => onPaginationChange(currentPage - 1, pageSize)}
          >
            {'<'}
          </Button>
          <Button
            size='small'
            disabled={currentPage * pageSize >= total}
            onClick={() => onPaginationChange(currentPage + 1, pageSize)}
          >
            {'>'}
          </Button>
        </div>
      </div>

      {/* Column Manager Modal */}
      <ColumnManager
        open={columnManagerOpen}
        onClose={() => setColumnManagerOpen(false)}
        columns={columns}
        onColumnsChange={onColumnsChange}
      />
    </div>
  );
}

export default WorkspaceTable;
