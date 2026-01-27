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
import { useQuery } from '@tanstack/react-query';
import { message, Tag } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { injectionApi } from '@/api/injections';
import {
  ChartsTab,
  DetailView,
  type DetailViewAction,
  type DetailViewTab,
  type FileItem,
  FilesTab,
  type GroundTruthItem,
  type LogEntry,
  LogsTab,
  type OverviewField,
  OverviewTab,
} from '@/components/workspace/DetailView';
import type { ProjectOutletContext } from '@/hooks/useProjectContext';
import { useAuthStore } from '@/store/auth';
import { STATUS_COLORS } from '@/types/workspace';

dayjs.extend(relativeTime);

// Mock config data for testing
const MOCK_CONFIG_DATA: Record<string, unknown> = {
  data: {
    datagen: {
      name: null,
      path: null,
    },
    sampler: {
      class_name: null,
      class_path: null,
    },
    shuffle: true,
    use_shm: false,
    image_key: 'images',
    tokenizer: null,
    val_files: '~/data/rlhf/gsm8k/test.parquet',
    video_key: 'videos',
    custom_cls: {
      name: null,
      path: null,
    },
    prompt_key: 'prompt',
    truncation: 'error',
    train_files: '~/data/rlhf/gsm8k/train.parquet',
    reward_fn_key: 'data_source',
    val_batch_size: null,
  },
  model: {
    path: 'Qwen/Qwen2.5-0.5B-Instruct',
    dtype: 'bfloat16',
    trust_remote_code: false,
    use_remove_padding: false,
    external_lib: null,
  },
  trainer: {
    total_epochs: 2,
    default_hdfs_dir: null,
    default_local_dir: 'checkpoints/gsm8k/qwen2.5-0.5b_function_rm',
  },
};

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
  } = useOutletContext<ProjectOutletContext>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  // Workspace name for header
  const workspaceName = `${user?.username || 'User'}'s workspace`;

  // Get injection data from location state (passed from list page for instant display)
  const injectionFromState = location.state?.injection as
    | { name?: string; state?: string }
    | undefined;

  // Fetch injection data
  const { data: injection, isLoading } = useQuery({
    queryKey: ['injection', id],
    queryFn: () => injectionApi.getInjection(Number(id)),
    enabled: !!id,
  });

  // Get status color
  const getStatusColor = (state?: string): string => {
    if (!state) return '#8c8c8c';
    const normalizedState = state.toLowerCase();
    if (normalizedState in STATUS_COLORS) {
      return STATUS_COLORS[normalizedState as keyof typeof STATUS_COLORS];
    }
    // Handle special cases
    if (
      normalizedState === 'inject_success' ||
      normalizedState === 'build_success' ||
      normalizedState === 'finished'
    ) {
      return STATUS_COLORS.success;
    }
    if (normalizedState === 'crashed') {
      return STATUS_COLORS.failed;
    }
    return '#8c8c8c';
  };

  // Format status display
  const formatStatus = (state?: string): string => {
    if (!state) return 'Unknown';
    return state
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

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
        label: 'Fault Type',
        value: <Tag color='orange'>{injection.fault_type}</Tag>,
      },
      {
        label: 'Category',
        value: <Tag>{injection.category}</Tag>,
      },
      {
        label: 'Benchmark ID',
        value: injection.benchmark_id || '-',
      },
      {
        label: 'Pedestal ID',
        value: injection.pedestal_id || '-',
      },
      {
        label: 'Pre Duration',
        value: `${injection.pre_duration || 0}s`,
      },
      {
        label: 'Task ID',
        value: injection.task_id || '-',
      },
    ];
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

  // Build config object for display (use mock if no real data)
  const configData = useMemo(() => {
    if (!injection) return MOCK_CONFIG_DATA;
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
    // Use mock data if no config available
    return MOCK_CONFIG_DATA;
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

  // Mock files for demo
  const mockFiles: FileItem[] = [
    {
      name: 'requirements.txt',
      path: '/requirements.txt',
      type: 'file',
      size: 5800,
      modifiedAt: dayjs().subtract(3, 'month').toISOString(),
    },
    {
      name: 'injection-config.json',
      path: '/injection-config.json',
      type: 'file',
      size: 3600,
      modifiedAt: dayjs().subtract(3, 'month').toISOString(),
    },
  ];

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
          tags={injection?.labels?.map((l) => `${l.key}: ${l.value}`) || []}
          author='admin'
          state={injection?.state || 'unknown'}
          startTime={injection?.start_time}
          runtime={runtime}
          createdAt={injection?.created_at || new Date().toISOString()}
          updatedAt={injection?.updated_at}
          additionalFields={additionalFields}
          config={configData}
          groundTruth={groundTruthData}
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
      content: <FilesTab files={mockFiles} />,
    },
  ];

  return (
    <DetailView
      entityType='injection'
      title={injection?.name || injectionFromState?.name || ''}
      status={formatStatus(injection?.state || injectionFromState?.state)}
      statusColor={getStatusColor(
        injection?.state || injectionFromState?.state
      )}
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
