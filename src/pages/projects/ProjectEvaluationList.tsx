import { useOutletContext } from 'react-router-dom';

import {
  BarChartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Empty,
  Row,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import type { ProjectOutletContext } from '@/hooks/useProjectContext';

const { Title, Text, Paragraph } = Typography;

// Mock evaluation data for the project
interface ProjectEvaluation {
  id: string;
  name: string;
  execution_id: string;
  execution_name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  metrics: {
    precision?: number;
    recall?: number;
    f1_score?: number;
  };
  created_at: string;
  completed_at?: string;
}

const mockEvaluations: ProjectEvaluation[] = [
  {
    id: '1',
    name: 'Evaluation #1',
    execution_id: 'exec_001',
    execution_name: 'exec_001',
    status: 'completed',
    metrics: { precision: 0.85, recall: 0.78, f1_score: 0.81 },
    created_at: '2025-01-20T10:00:00Z',
    completed_at: '2025-01-20T10:30:00Z',
  },
  {
    id: '2',
    name: 'Evaluation #2',
    execution_id: 'exec_002',
    execution_name: 'exec_002',
    status: 'running',
    metrics: {},
    created_at: '2025-01-25T14:00:00Z',
  },
];

/**
 * Project-scoped Evaluations List Page
 * Shows evaluations specific to the current project
 */
const ProjectEvaluationList: React.FC = () => {
  const { projectName } = useOutletContext<ProjectOutletContext>();

  // Status color mapping
  const statusColors: Record<string, string> = {
    pending: 'default',
    running: 'processing',
    completed: 'success',
    failed: 'error',
  };

  const columns: ColumnsType<ProjectEvaluation> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: 'Execution',
      dataIndex: 'execution_name',
      key: 'execution_name',
      render: (name: string) => (
        <a href={`/${projectName}/executions`}>{name}</a>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColors[status]}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Precision',
      key: 'precision',
      render: (_, record) =>
        record.metrics.precision !== undefined
          ? `${(record.metrics.precision * 100).toFixed(1)}%`
          : '-',
    },
    {
      title: 'Recall',
      key: 'recall',
      render: (_, record) =>
        record.metrics.recall !== undefined
          ? `${(record.metrics.recall * 100).toFixed(1)}%`
          : '-',
    },
    {
      title: 'F1 Score',
      key: 'f1_score',
      render: (_, record) =>
        record.metrics.f1_score !== undefined
          ? `${(record.metrics.f1_score * 100).toFixed(1)}%`
          : '-',
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
  ];

  // Calculate stats
  const totalEvaluations = mockEvaluations.length;
  const completedEvaluations = mockEvaluations.filter(
    (e) => e.status === 'completed'
  ).length;
  const runningEvaluations = mockEvaluations.filter(
    (e) => e.status === 'running'
  ).length;

  // Calculate average metrics
  const completedWithMetrics = mockEvaluations.filter(
    (e) => e.metrics.f1_score !== undefined
  );
  const avgF1 =
    completedWithMetrics.length > 0
      ? completedWithMetrics.reduce(
          (sum, e) => sum + (e.metrics.f1_score || 0),
          0
        ) / completedWithMetrics.length
      : 0;

  return (
    <div className='project-evaluations'>
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 16,
          }}
        >
          <div>
            <Title level={4} style={{ marginBottom: 8 }}>
              Evaluations
            </Title>
            <Paragraph type='secondary'>
              Evaluate execution results against ground truth data
            </Paragraph>
          </div>
          <Button type='primary' icon={<PlusOutlined />}>
            New Evaluation
          </Button>
        </div>

        {/* Stats */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card size='small'>
              <Statistic
                title='Total Evaluations'
                value={totalEvaluations}
                prefix={<BarChartOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size='small'>
              <Statistic
                title='Completed'
                value={completedEvaluations}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size='small'>
              <Statistic
                title='Running'
                value={runningEvaluations}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size='small'>
              <Statistic
                title='Avg F1 Score'
                value={avgF1 * 100}
                precision={1}
                suffix='%'
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Table */}
      {mockEvaluations.length > 0 ? (
        <Card>
          <Table
            columns={columns}
            dataSource={mockEvaluations}
            rowKey='id'
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} evaluations`,
            }}
          />
        </Card>
      ) : (
        <Card>
          <Empty
            description='No evaluations yet'
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type='primary' icon={<PlusOutlined />}>
              Create First Evaluation
            </Button>
          </Empty>
        </Card>
      )}
    </div>
  );
};

export default ProjectEvaluationList;
