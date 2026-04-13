import { StarFilled } from '@ant-design/icons';
import { Col, Empty, Row, Typography } from 'antd';

import ProjectCard from '@/components/profile/ProjectCard';
import type { ProjectWithStats } from '@/types/api';

const { Title, Text } = Typography;

const StarsTab = () => {
  // Star functionality stub (profile store/API removed)
  const toggleStar = async (_id: number) => {
    /* TODO: implement star toggle */
  };
  const starredProjects: ProjectWithStats[] = [];
  const isLoading = false;

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
