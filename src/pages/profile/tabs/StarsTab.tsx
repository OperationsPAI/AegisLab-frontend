import { StarFilled } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Col, Empty, Row, Typography } from 'antd';

import { profileApi } from '@/api/profile';
import ProjectCard from '@/components/profile/ProjectCard';
import { useProfileStore } from '@/store/profile';

const { Title, Text } = Typography;

const StarsTab = () => {
  const { toggleStar } = useProfileStore();

  // Fetch starred projects
  const { data: starredProjects, isLoading } = useQuery({
    queryKey: ['profile', 'starred-projects'],
    queryFn: () => profileApi.getStarredProjects(),
  });

  if (isLoading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Text type='secondary'>Loading starred projects...</Text>
      </div>
    );
  }

  if (!starredProjects?.length) {
    return (
      <div
        style={{
          background: 'var(--component-bg, #fff)',
          borderRadius: 8,
          padding: 40,
          border: '1px solid var(--border-color, #f0f0f0)',
          textAlign: 'center',
        }}
      >
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span>
              <Text strong>No starred projects</Text>
              <br />
              <Text type='secondary'>
                Star projects to bookmark them and access them quickly here.
              </Text>
            </span>
          }
        />
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'var(--component-bg, #fff)',
        borderRadius: 8,
        padding: 20,
        border: '1px solid var(--border-color, #f0f0f0)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 20,
        }}
      >
        <StarFilled style={{ color: '#f59e0b' }} />
        <Title level={5} style={{ margin: 0 }}>
          Starred Projects ({starredProjects.length})
        </Title>
      </div>

      <Row gutter={[16, 16]}>
        {starredProjects.map((project) => (
          <Col key={project.id} xs={24} sm={12} lg={8} xl={6}>
            <ProjectCard
              project={project}
              isStarred
              onToggleStar={toggleStar}
            />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default StarsTab;
