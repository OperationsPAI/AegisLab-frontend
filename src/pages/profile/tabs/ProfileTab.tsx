import { useNavigate } from 'react-router-dom';

import { FolderOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Row,
  Skeleton,
  Typography,
} from 'antd';
import dayjs from 'dayjs';

import { authApi } from '@/api/auth';
import { useProjects } from '@/hooks/useProjects';

const { Text, Title } = Typography;

const ProfileTab = () => {
  const navigate = useNavigate();

  // Fetch profile data
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => authApi.getProfile(),
  });

  // Fetch user projects
  const { data: projectsData, isLoading: projectsLoading } = useProjects({
    page: 1,
    size: 6,
    queryKey: ['projects', 'profile'],
  });

  const handleCreateProject = () => {
    navigate('/projects/new');
  };

  if (profileLoading) {
    return <Skeleton active paragraph={{ rows: 8 }} />;
  }

  return (
    <div className='profile-tab'>
      {/* Profile Info Section */}
      <Card className='profile-section' style={{ marginBottom: 24 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <Title level={5} style={{ margin: 0 }}>
            Profile
          </Title>
        </div>
        {profile ? (
          <>
            <Alert
              message='Profile information is read-only'
              description='Contact your administrator to update profile details.'
              type='info'
              showIcon
              style={{ marginTop: 16, marginBottom: 16 }}
            />
            <Descriptions bordered column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label='Username'>
                @{profile.username}
              </Descriptions.Item>
              <Descriptions.Item label='Full Name'>
                {profile.full_name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label='Email'>
                {profile.email}
              </Descriptions.Item>
              <Descriptions.Item label='Phone'>
                {profile.phone || '-'}
              </Descriptions.Item>
              <Descriptions.Item label='Member Since'>
                {profile.created_at
                  ? dayjs(profile.created_at).format('MMMM D, YYYY')
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label='Last Login'>
                {profile.last_login_at
                  ? dayjs(profile.last_login_at).format('MMMM D, YYYY HH:mm')
                  : 'Never'}
              </Descriptions.Item>
            </Descriptions>
          </>
        ) : (
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
              Unable to load profile
            </Text>
          </div>
        )}
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
          <Skeleton active paragraph={{ rows: 3 }} />
        ) : projectsData?.items?.length ? (
          <Row gutter={[16, 16]}>
            {projectsData.items.map((project) => (
              <Col key={project.id} xs={24} sm={12} lg={8}>
                <Card
                  size='small'
                  hoverable
                  onClick={() => navigate(`/${project.name}`)}
                >
                  <Text strong>{project.name}</Text>
                  <br />
                  <Text type='secondary' style={{ fontSize: 12 }}>
                    {project.created_at
                      ? dayjs(project.created_at).fromNow()
                      : ''}
                  </Text>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                <Text strong>No projects yet</Text>
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
    </div>
  );
};

export default ProfileTab;
