import { Outlet, useNavigate } from 'react-router-dom';

import { FolderOutlined } from '@ant-design/icons';
import { Layout, Result, Skeleton, Typography } from 'antd';

import {
  type ProjectOutletContext,
  useProjectContext,
} from '@/hooks/useProjectContext';
import { useThemeStore } from '@/store/theme';

import Breadcrumb from './Breadcrumb';
import ProjectSidebar from './ProjectSidebar';

import './ProjectLayout.css';

const { Sider, Content } = Layout;
const { Text } = Typography;

/**
 * Layout wrapper for project-specific pages
 * Provides project context to child routes via Outlet context
 */
const ProjectLayout: React.FC = () => {
  const navigate = useNavigate();
  const { sidebarCollapsed } = useThemeStore();
  const { project, projectName, teamName, isLoading, error } =
    useProjectContext();

  // Loading state
  if (isLoading) {
    return (
      <div className='project-layout-loading'>
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    );
  }

  // Error state - project not found
  if (error || !project) {
    return (
      <Result
        status='404'
        title='Project Not Found'
        subTitle={`The project "${projectName}" could not be found.`}
        extra={<a onClick={() => navigate('/projects')}>Back to Projects</a>}
      />
    );
  }

  // Prepare outlet context for child routes
  // At this point project is guaranteed to exist due to the check above
  const outletContext: ProjectOutletContext = {
    project,
    projectId: project.id ?? 0,
    projectName: projectName ?? '',
    teamName: teamName ?? '',
  };

  return (
    <Layout className='project-layout'>
      {/* Project Header */}
      <div className='project-layout-header'>
        <Breadcrumb projectName={project.name} teamName={teamName ?? ''} />
        <div className='project-title-row'>
          <FolderOutlined className='project-icon' />
          <div className='project-title-info'>
            <Text strong className='project-name'>
              {project.name}
            </Text>
            {project.description && (
              <Text type='secondary' className='project-description'>
                {project.description}
              </Text>
            )}
          </div>
        </div>
      </div>

      <Layout className='project-layout-body'>
        {/* Project Sidebar */}
        <Sider
          width={200}
          collapsedWidth={64}
          collapsed={sidebarCollapsed}
          className='project-sidebar-wrapper'
        >
          <ProjectSidebar
            projectName={projectName ?? ''}
            teamName={teamName ?? ''}
            collapsed={sidebarCollapsed}
          />
        </Sider>

        {/* Project Content */}
        <Content className='project-content'>
          <Outlet context={outletContext} />
        </Content>
      </Layout>
    </Layout>
  );
};

export default ProjectLayout;
