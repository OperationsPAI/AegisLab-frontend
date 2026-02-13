import { useMemo } from 'react';
import {
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
} from 'react-router-dom';

import {
  AreaChartOutlined,
  DeleteOutlined,
  EditOutlined,
  FileOutlined,
  FileTextOutlined,
  ProfileOutlined,
} from '@ant-design/icons';
import type { LabelItem } from '@rcabench/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { message, Tag } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { injectionApi, type InjectionDetailResp } from '@/api/injections';
import {
  ChartsTab,
  DetailView,
  type DetailViewAction,
  type DetailViewTab,
  FilesTab,
  type GroundTruthItem,
  type LogEntry,
  LogsTab,
  type OverviewField,
  OverviewTab,
} from '@/components/workspace/DetailView';
import type { ProjectOutletContext } from '@/hooks/useProjectContext';
import { useAuthStore } from '@/store/auth';
import { getColor } from '@/utils/colors';

dayjs.extend(relativeTime);

// Mock ground truth data for testing
const MOCK_GROUND_TRUTH_DATA: GroundTruthItem[] = [
  {
    service: ['ts-admin-basic-info-service'],
    container: ['ts-admin-basic-info-service'],
    pod: null,
    metric: null,
    function: null,
    span: null,
  },
  {
    service: ['ts-order-service', 'ts-travel-service'],
    container: ['ts-order-service'],
    pod: null,
    metric: null,
    function: null,
    span: null,
  },
];

/**
 * Project Injection Detail Page
 * Wrapper component that uses DetailView for injection data
 */
const ProjectInjectionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    project: _project,
    teamName,
    projectName,
    projectId,
  } = useOutletContext<ProjectOutletContext>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Workspace name for header
  const workspaceName = `${user?.username || 'User'}'s workspace`;

  // Get injection data from location state (passed from list page for instant display)
  const injectionFromState = location.state?.injection as
    | { name?: string; state?: string }
    | undefined;

  // Fetch injection data
  const { data: injection, isLoading } = useQuery({
    queryKey: ['injection', id, projectId],
    queryFn: () => injectionApi.getInjection(Number(id)),
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  // Calculate runtime
  const runtime = useMemo(() => {
    if (!injection?.start_time) return undefined;
    const start = dayjs(injection.start_time);
    const end = injection.end_time ? dayjs(injection.end_time) : dayjs();
    const diff = end.diff(start, 'second');
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ${diff % 60}s`;
    return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`;
  }, [injection]);

  // Navigation handlers
  const handleBack = () => {
    navigate(`/${teamName}/${projectName}/injections`);
  };

  // Action handlers
  const handleExportData = () => {
    message.info('Export data functionality coming soon');
  };

  const handleViewCode = () => {
    message.info('View code functionality coming soon');
  };

  const handleEditRunName = () => {
    message.info('Edit run name functionality coming soon');
  };

  const handleDelete = () => {
    message.warning('Delete run functionality coming soon');
  };

  // Label handlers
  const handleAddLabel = async (key: string, value: string) => {
    try {
      // Create label object
      const newLabel: LabelItem = { key, value };

      // Add to backend
      await injectionApi.manageLabels(Number(id), [newLabel], []);

      // Update cache
      queryClient.setQueryData<InjectionDetailResp>(
        ['injection', id, projectId],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            labels: [...(old.labels || []), newLabel],
          };
        }
      );
    } catch (error) {
      message.error('Failed to add label');
      throw error;
    }
  };

  const handleRemoveLabel = async (label: LabelItem) => {
    try {
      // Remove from backend
      await injectionApi.manageLabels(Number(id), [], [label]);
      queryClient.setQueryData<InjectionDetailResp>(
        ['injection', id, projectId],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            labels:
              old.labels?.filter(
                (l: LabelItem) => l.key !== label.key || l.value !== label.value
              ) || [],
          };
        }
      );
    } catch (error) {
      message.error('Failed to remove label');
    }
  };

  // Define actions for dropdown menu (wandb style)
  const actions: DetailViewAction[] = [
    {
      key: 'export',
      label: 'Export data',
      icon: <AreaChartOutlined />,
      onClick: handleExportData,
    },
    {
      key: 'viewCode',
      label: 'View code',
      icon: <FileTextOutlined />,
      onClick: handleViewCode,
    },
    {
      key: 'editName',
      label: 'Edit run name',
      icon: <EditOutlined />,
      onClick: handleEditRunName,
    },
    {
      key: 'delete',
      label: 'Delete run',
      icon: <DeleteOutlined />,
      onClick: handleDelete,
      danger: true,
    },
  ];

  // Overview additional fields for injection
  const additionalFields: OverviewField[] = useMemo(() => {
    if (!injection) return [];
    return [
      {
        label: 'Pre Duration',
        value: `${injection.pre_duration || 0}m 0s`,
      },
      {
        label: 'Fault Type',
        value: injection.fault_type,
      },
      {
        label: 'Category',
        value: <Tag>{injection.category}</Tag>,
      },
      {
        label: 'Benchmark',
        value: injection.benchmark_name || '-',
      },
      {
        label: 'Pedestal',
        value: injection.pedestal_name || '-',
      },
    ];
  }, [injection]);

  // Build config object for display (use mock if no real data)
  const configData = useMemo(() => {
    if (!injection) return undefined;
    // Use display_config if available, otherwise build from engine_config
    if (
      injection.display_config &&
      Object.keys(injection.display_config).length > 0
    ) {
      return injection.display_config as Record<string, unknown>;
    }
    if (injection.engine_config && injection.engine_config.length > 0) {
      return { engine_config: injection.engine_config };
    }
    return undefined;
  }, [injection]);

  // Transform ground_truth data for OverviewTab (use mock if no real data)
  const groundTruthData: GroundTruthItem[] = useMemo(() => {
    if (!injection?.ground_truth || injection.ground_truth.length === 0) {
      return MOCK_GROUND_TRUTH_DATA;
    }
    // Return as-is since API format matches GroundTruthItem
    return injection.ground_truth.map((gt) => ({
      service: gt.service,
      container: gt.container,
      pod: gt.pod,
      metric: gt.metric,
      function: gt.function,
      span: gt.span,
    }));
  }, [injection]);

  // Mock logs for demo
  const mockLogs: LogEntry[] = useMemo(() => {
    if (!injection) return [];
    const baseTime = dayjs(injection.created_at);
    return [
      {
        timestamp: baseTime.toISOString(),
        level: 'info',
        message: `Injection ${injection.name} started`,
      },
      {
        timestamp: baseTime.add(1, 'second').toISOString(),
        level: 'info',
        message: `Fault type: ${injection.fault_type}`,
      },
      {
        timestamp: baseTime.add(2, 'second').toISOString(),
        level: 'info',
        message: `Target benchmark ID: ${injection.benchmark_id || 'N/A'}`,
      },
      {
        timestamp: baseTime.add(5, 'second').toISOString(),
        level: 'info',
        message: 'Preparing fault injection...',
      },
      {
        timestamp: baseTime.add(10, 'second').toISOString(),
        level: 'info',
        message: 'Fault injection executed',
      },
      {
        timestamp: baseTime.add(15, 'second').toISOString(),
        level: injection.state === 'failed' ? 'error' : 'info',
        message: `Injection completed with state: ${injection.state}`,
      },
    ];
  }, [injection]);

  // Define tabs
  const tabs: DetailViewTab[] = [
    {
      key: 'charts',
      label: 'Charts',
      icon: <AreaChartOutlined />,
      content: <ChartsTab charts={[]} loading={isLoading} />,
    },
    {
      key: 'overview',
      label: 'Overview',
      icon: <ProfileOutlined />,
      content: (
        <OverviewTab
          notes={injection?.description}
          labels={injection?.labels || []}
          author={user?.username || 'Unknown'}
          state={injection?.state}
          startTime={injection?.start_time}
          runtime={runtime}
          taskID={injection?.task_id}
          createdAt={injection?.created_at || new Date().toISOString()}
          updatedAt={injection?.updated_at}
          additionalFields={additionalFields}
          config={configData}
          groundTruth={groundTruthData}
          onAddLabel={handleAddLabel}
          onRemoveLabel={handleRemoveLabel}
        />
      ),
    },
    {
      key: 'logs',
      label: 'Logs',
      icon: <FileTextOutlined />,
      content: <LogsTab logs={mockLogs} />,
    },
    {
      key: 'files',
      label: 'Files',
      icon: <FileOutlined />,
      content: id ? <FilesTab injectionId={Number(id)} /> : null,
    },
  ];

  return (
    <DetailView
      entityType='injection'
      title={injection?.name || injectionFromState?.name || ''}
      titleDotColor={getColor(injection?.id || 0)}
      loading={isLoading}
      workspaceName={workspaceName}
      workspaceType='personal'
      onBack={handleBack}
      backLabel='Back'
      actions={actions}
      tabs={tabs}
      defaultActiveTab='overview'
    />
  );
};

export default ProjectInjectionDetail;
