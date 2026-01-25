import { useOutletContext } from 'react-router-dom';

import { CodeOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Card, Empty, Typography } from 'antd';

import type { ProjectOutletContext } from '@/hooks/useProjectContext';

const { Title, Text, Paragraph } = Typography;

/**
 * Project Workspace Page
 * Central workspace for project-related operations
 */
const ProjectWorkspace: React.FC = () => {
  // Get project context (will be used when workspace features are implemented)
  useOutletContext<ProjectOutletContext>();

  return (
    <div className='project-workspace'>
      <Title level={4}>
        <CodeOutlined style={{ marginRight: 8 }} />
        Workspace
      </Title>

      <Paragraph type='secondary'>
        Central workspace for managing your project experiments and
        configurations.
      </Paragraph>

      <Card style={{ marginTop: 24 }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span>
              <InfoCircleOutlined style={{ marginRight: 4 }} />
              Workspace features coming soon
            </span>
          }
        >
          <Text type='secondary'>
            The workspace will provide tools for managing experiment
            configurations, viewing logs, and monitoring project resources.
          </Text>
        </Empty>
      </Card>
    </div>
  );
};

export default ProjectWorkspace;
