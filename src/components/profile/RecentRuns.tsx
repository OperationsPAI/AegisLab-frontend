import { useNavigate } from 'react-router-dom';

import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import type { ExecutionResp } from '@rcabench/client';
import { Empty, List, Skeleton, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import './RecentRuns.css';

dayjs.extend(relativeTime);

const { Text } = Typography;

interface RecentRunsProps {
  runs: ExecutionResp[];
  isLoading?: boolean;
}

/**
 * Get status icon and color based on execution state/status
 */
function getStatusConfig(state?: string, status?: string) {
  // Check status first (more specific)
  if (status === 'running') {
    return {
      icon: <LoadingOutlined spin />,
      color: 'processing',
      text: 'Running',
    };
  }

  // Check state
  switch (state) {
    case '2': // Success
      return {
        icon: <CheckCircleOutlined />,
        color: 'success',
        text: 'Success',
      };
    case '1': // Failed
      return { icon: <CloseCircleOutlined />, color: 'error', text: 'Failed' };
    case '0': // Initial/Pending
    default:
      return {
        icon: <ClockCircleOutlined />,
        color: 'default',
        text: 'Pending',
      };
  }
}

const RecentRuns = ({ runs, isLoading }: RecentRunsProps) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className='recent-runs'>
        <div className='recent-runs-header'>
          <PlayCircleOutlined />
          <Text strong>Recent Runs</Text>
        </div>
        <Skeleton active paragraph={{ rows: 3 }} />
      </div>
    );
  }

  if (!runs.length) {
    return (
      <div className='recent-runs'>
        <div className='recent-runs-header'>
          <PlayCircleOutlined />
          <Text strong>Recent Runs</Text>
        </div>
        <Empty description='No runs yet' image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </div>
    );
  }

  const handleRunClick = (run: ExecutionResp) => {
    if (run.id) {
      // Navigate to execution detail - needs project context
      navigate(`/admin/executions`);
    }
  };

  return (
    <div className='recent-runs'>
      <div className='recent-runs-header'>
        <PlayCircleOutlined />
        <Text strong>Recent Runs</Text>
      </div>

      <List
        className='recent-runs-list'
        dataSource={runs}
        renderItem={(run) => {
          const statusConfig = getStatusConfig(run.state, run.status);
          const timeAgo = run.created_at
            ? dayjs(run.created_at).fromNow()
            : 'Unknown';

          return (
            <List.Item
              className='recent-run-item'
              onClick={() => handleRunClick(run)}
            >
              <div className='run-info'>
                <Text strong className='run-algorithm'>
                  {run.algorithm_name || 'Unknown Algorithm'}
                </Text>
                {run.algorithm_version && (
                  <Text type='secondary' className='run-version'>
                    v{run.algorithm_version}
                  </Text>
                )}
              </div>
              <div className='run-meta'>
                <Text type='secondary' className='run-time'>
                  {timeAgo}
                </Text>
                <Tag
                  icon={statusConfig.icon}
                  color={statusConfig.color}
                  className='run-status'
                >
                  {statusConfig.text}
                </Tag>
              </div>
            </List.Item>
          );
        }}
      />
    </div>
  );
};

export default RecentRuns;
