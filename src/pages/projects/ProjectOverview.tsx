import { useNavigate, useOutletContext } from 'react-router-dom';

import {
  BulbOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Empty, Row, Space, Typography } from 'antd';
import dayjs from 'dayjs';

import StatCard from '@/components/ui/StatCard';
import type { ProjectOutletContext } from '@/hooks/useProjectContext';

const { Text } = Typography;

/**
 * Project Overview Page
 * Shows project summary, statistics, and quick actions
 */
const ProjectOverview: React.FC = () => {
  const navigate = useNavigate();
  const { project, teamName, projectName } =
    useOutletContext<ProjectOutletContext>();

  // Mock statistics - in real app these would come from API
  const stats = {
    injections: 0,
    executions: 0,
    artifacts: 0,
    completedRuns: 0,
  };

  return (
    <div className='project-overview'>
      {/* Quick Actions */}
      <Card className='quick-actions-card' style={{ marginBottom: 24 }}>
        <Space size='middle'>
          <Button
            type='primary'
            icon={<BulbOutlined />}
            onClick={() =>
              navigate(`/${teamName}/${projectName}/injections/create`)
            }
          >
            New Injection
          </Button>
          <Button
            icon={<PlayCircleOutlined />}
            onClick={() =>
              navigate(`/${teamName}/${projectName}/executions/new`)
            }
          >
            New Execution
          </Button>
        </Space>
      </Card>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={12} lg={6}>
          <StatCard
            title='Injections'
            value={stats.injections}
            prefix={<BulbOutlined />}
            color='primary'
          />
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <StatCard
            title='Executions'
            value={stats.executions}
            prefix={<PlayCircleOutlined />}
            color='info'
          />
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <StatCard
            title='Artifacts'
            value={stats.artifacts}
            prefix={<PlusOutlined />}
            color='warning'
          />
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <StatCard
            title='Completed'
            value={stats.completedRuns}
            prefix={<CheckCircleOutlined />}
            color='success'
          />
        </Col>
      </Row>

      {/* Project Info */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title='Project Details'>
            <Space direction='vertical' size='small' style={{ width: '100%' }}>
              <div>
                <Text type='secondary'>Created:</Text>
                <Text style={{ marginLeft: 8 }}>
                  <CalendarOutlined style={{ marginRight: 4 }} />
                  {project.created_at
                    ? dayjs(project.created_at).format('MMMM D, YYYY')
                    : 'Unknown'}
                </Text>
              </div>
              <div>
                <Text type='secondary'>Status:</Text>
                <Text style={{ marginLeft: 8 }}>
                  {project.is_public ? 'Public' : 'Private'}
                </Text>
              </div>
              {project.description && (
                <div>
                  <Text type='secondary'>Description:</Text>
                  <Text style={{ marginLeft: 8 }}>{project.description}</Text>
                </div>
              )}
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title='Recent Activity'>
            <Empty
              description='No recent activity'
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProjectOverview;
