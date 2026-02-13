import { useMemo } from 'react';
import {
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
} from 'react-router-dom';

import {
  AreaChartOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  EditOutlined,
  ExperimentOutlined,
  FileOutlined,
  FileTextOutlined,
  FunctionOutlined,
  ProfileOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { message, Space, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { executionApi } from '@/api/executions';
import {
  ArtifactsTab,
  ChartsTab,
  DetailView,
  type DetailViewAction,
  type DetailViewTab,
  type DetectorResult,
  type FileItem,
  FilesTab,
  type GranularityResult,
  type LogEntry,
  LogsTab,
  type OverviewField,
  OverviewTab,
} from '@/components/workspace/DetailView';
import type { ProjectOutletContext } from '@/hooks/useProjectContext';
import { useAuthStore } from '@/store/auth';
import { STATE_COLORS } from '@/types/workspace';

const { Text } = Typography;

dayjs.extend(relativeTime);

/**
 * Project Execution Detail Page
 * Wrapper component that uses DetailView for execution data
 */
const ProjectExecutionDetail: React.FC = () => {
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

  // Get execution data from location state (passed from list page for instant display)
  const executionFromState = location.state?.execution as
    | { id?: number; name?: string; state?: string }
    | undefined;

  // Fetch execution data
  const { data: execution, isLoading } = useQuery({
    queryKey: ['execution', id],
    queryFn: () => executionApi.getExecution(Number(id)),
    enabled: !!id,
  });

  // Get status color
  const getStatusColor = (state?: string): string => {
    if (!state) return '#8c8c8c';
    const normalizedState = state.toLowerCase();
    if (normalizedState in STATE_COLORS) {
      return STATE_COLORS[normalizedState as keyof typeof STATE_COLORS];
    }
    if (normalizedState === 'crashed') {
      return STATE_COLORS.failed;
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
    if (!execution?.duration) return undefined;
    const seconds = execution.duration;
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  }, [execution]);

  // Navigation handlers
  const handleBack = () => {
    navigate(`/${teamName}/${projectName}/executions`);
  };

  // Action handlers
  const handleEdit = () => {
    message.info('Edit functionality coming soon');
  };

  const handleDelete = () => {
    message.warning('Delete functionality coming soon');
  };

  const handleStop = () => {
    message.info('Stop functionality coming soon');
  };

  const handleDownloadResults = () => {
    if (!execution) {
      message.error('No execution data available');
      return;
    }

    const exportData = {
      id: execution.id,
      algorithm: execution.algorithm_name,
      algorithm_version: execution.algorithm_version,
      datapack_id: execution.datapack_id,
      state: execution.state,
      duration: execution.duration,
      created_at: execution.created_at,
      updated_at: execution.updated_at,
      detector_results: execution.detector_results,
      granularity_results: execution.granularity_results,
      labels: execution.labels,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `execution-${execution.id}-${dayjs().format('YYYY-MM-DD')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success('Results downloaded successfully');
  };

  // Define actions
  const actions: DetailViewAction[] = [
    {
      key: 'edit',
      label: 'Edit',
      icon: <EditOutlined />,
      onClick: handleEdit,
    },
    {
      key: 'stop',
      label: 'Stop',
      icon: <StopOutlined />,
      onClick: handleStop,
      disabled: execution?.state !== 'running',
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: <DeleteOutlined />,
      onClick: handleDelete,
      danger: true,
    },
  ];

  // Overview additional fields for execution
  const additionalFields: OverviewField[] = useMemo(() => {
    if (!execution) return [];
    return [
      {
        label: 'Algorithm',
        value: (
          <Space>
            <FunctionOutlined style={{ color: '#f59e0b' }} />
            <Text strong>{execution.algorithm_name}</Text>
          </Space>
        ),
      },
      {
        label: 'Algorithm Version',
        value: <Tag color='blue'>v{execution.algorithm_version}</Tag>,
      },
      {
        label: 'Datapack ID',
        value: (
          <Space>
            <DatabaseOutlined style={{ color: '#3b82f6' }} />
            <Text code>
              {execution.datapack_id
                ? String(execution.datapack_id).substring(0, 16)
                : 'N/A'}
            </Text>
          </Space>
        ),
      },
      {
        label: 'Duration',
        value: runtime || '-',
      },
    ];
  }, [execution, runtime]);

  // Mock logs for demo
  const mockLogs: LogEntry[] = useMemo(() => {
    if (!execution) return [];
    const baseTime = dayjs(execution.created_at);
    return [
      {
        timestamp: baseTime.toISOString(),
        level: 'info',
        message: 'Execution started...',
      },
      {
        timestamp: baseTime.add(1, 'second').toISOString(),
        level: 'info',
        message: `Loading algorithm: ${execution.algorithm_name}`,
      },
      {
        timestamp: baseTime.add(2, 'second').toISOString(),
        level: 'info',
        message: `Loading datapack: ${execution.datapack_id || 'N/A'}`,
      },
      {
        timestamp: baseTime.add(5, 'second').toISOString(),
        level: 'info',
        message: 'Running RCA algorithm...',
      },
      {
        timestamp: baseTime.add(30, 'second').toISOString(),
        level: 'info',
        message: 'Generating results...',
      },
      {
        timestamp: baseTime.add(60, 'second').toISOString(),
        level: execution.state === 'failed' ? 'error' : 'info',
        message:
          execution.state === 'success'
            ? 'Execution completed successfully'
            : `Execution ended with state: ${execution.state}`,
      },
    ];
  }, [execution]);

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
      name: 'wandb-metadata.json',
      path: '/wandb-metadata.json',
      type: 'file',
      size: 3600,
      modifiedAt: dayjs().subtract(3, 'month').toISOString(),
    },
  ];

  // Define tabs (including Artifacts for executions)
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
          notes={(execution as { description?: string })?.description}
          tags={
            execution?.labels?.map(
              (l: { key?: string; value?: string }) => `${l.key}: ${l.value}`
            ) || []
          }
          author='admin'
          state={execution?.state || 'unknown'}
          startTime={execution?.created_at}
          runtime={runtime}
          createdAt={execution?.created_at || new Date().toISOString()}
          updatedAt={execution?.updated_at}
          additionalFields={additionalFields}
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
    {
      key: 'artifacts',
      label: 'Artifacts',
      icon: <ExperimentOutlined />,
      content: (
        <ArtifactsTab
          detectorResults={
            execution?.detector_results as DetectorResult[] | undefined
          }
          granularityResults={
            execution?.granularity_results as GranularityResult[] | undefined
          }
          loading={isLoading}
          onDownload={handleDownloadResults}
        />
      ),
    },
  ];

  return (
    <DetailView
      entityType='execution'
      title={
        execution
          ? `exec_${String(execution.id).padStart(3, '0')}`
          : executionFromState?.name ||
            (executionFromState?.id
              ? `exec_${String(executionFromState.id).padStart(3, '0')}`
              : 'Loading...')
      }
      status={formatStatus(execution?.state || executionFromState?.state)}
      statusColor={getStatusColor(
        execution?.state || executionFromState?.state
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

export default ProjectExecutionDetail;
