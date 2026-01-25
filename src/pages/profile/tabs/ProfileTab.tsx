import { useNavigate } from 'react-router-dom';

import { FolderOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Col, Empty, Row, Typography } from 'antd';

import { profileApi } from '@/api/profile';
import ActivityGraph from '@/components/profile/ActivityGraph';
import ProjectCard from '@/components/profile/ProjectCard';
import RecentRuns from '@/components/profile/RecentRuns';
import { useProfileStore } from '@/store/profile';

const { Text, Title } = Typography;

const ProfileTab = () => {
  const navigate = useNavigate();
  const { toggleStar, isStarred } = useProfileStore();

  // Fetch activity data
  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ['profile', 'activity'],
    queryFn: () => profileApi.getActivity(),
  });

  // Fetch recent runs
  const { data: recentRuns, isLoading: runsLoading } = useQuery({
    queryKey: ['profile', 'recent-runs'],
    queryFn: () => profileApi.getRecentRuns(5),
  });

  // Fetch user projects (top 6)
  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['profile', 'projects'],
    queryFn: () => profileApi.getUserProjects({ size: 6 }),
  });

  const handleCreateProject = () => {
    navigate('/projects/new');
  };

  return (
    <div className='profile-tab'>
      {/* Intro Section */}
      <Card className='profile-section' style={{ marginBottom: 24 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <Title level={5} style={{ margin: 0 }}>
            Intro
          </Title>
          <Button type='link' size='small'>
            Edit
          </Button>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '40px 0',
            color: '#666',
          }}
        >
          <UserOutlined
            style={{ fontSize: 48, marginBottom: 16, color: '#ccc' }}
          />
          <Text strong style={{ fontSize: 16 }}>
            Introduce yourself to the world
          </Text>
          <Text type='secondary'>
            Let others know a little bit about who you are and what you do.
          </Text>
          <Button type='link' style={{ marginTop: 8 }}>
            Add an intro
          </Button>
        </div>
      </Card>

      {/* Projects Section */}
      <Card className='profile-section' style={{ marginBottom: 24 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FolderOutlined />
            <Title level={5} style={{ margin: 0 }}>
              Projects
            </Title>
          </div>
          <Button
            type='primary'
            icon={<PlusOutlined />}
            onClick={handleCreateProject}
          >
            New Project
          </Button>
        </div>

        {projectsLoading ? (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <Text type='secondary'>Loading projects...</Text>
          </div>
        ) : projectsData?.items.length ? (
          <Row gutter={[16, 16]}>
            {projectsData.items.map((project) => (
              <Col key={project.id} xs={24} sm={12} lg={8}>
                <ProjectCard
                  project={project}
                  isStarred={isStarred(project.id)}
                  onToggleStar={toggleStar}
                />
              </Col>
            ))}
          </Row>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                <Text strong>Highlight your latest projects</Text>
                <br />
                <Text type='secondary'>
                  Get started by creating your first project.
                </Text>
              </span>
            }
          >
            <Button type='primary' onClick={handleCreateProject}>
              Create a project
            </Button>
          </Empty>
        )}
      </Card>

      {/* Activity Section */}
      <Card className='profile-section' style={{ marginBottom: 24 }}>
        <Title level={5} style={{ marginBottom: 16 }}>
          Activity
        </Title>
        <ActivityGraph
          contributions={activityData?.contributions || []}
          isLoading={activityLoading}
        />
      </Card>

      {/* Recent Runs Section */}
      <RecentRuns runs={recentRuns || []} isLoading={runsLoading} />
    </div>
  );
};

export default ProfileTab;
