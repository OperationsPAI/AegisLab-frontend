import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  AppstoreOutlined,
  BulbOutlined,
  CodeOutlined,
  FileOutlined,
  PlayCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Menu, type MenuProps } from 'antd';

import './ProjectSidebar.css';

interface ProjectSidebarProps {
  projectName: string;
  collapsed?: boolean;
}

/**
 * Project-specific sidebar navigation
 * Shows menu items for project sub-pages: Overview, Workspace, Injections, etc.
 */
const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  projectName,
  collapsed = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedKey, setSelectedKey] = useState<string>('overview');

  // Menu items for project navigation
  const menuItems: MenuProps['items'] = [
    {
      key: 'overview',
      icon: <AppstoreOutlined />,
      label: 'Overview',
    },
    {
      key: 'workspace',
      icon: <CodeOutlined />,
      label: 'Workspace',
    },
    {
      type: 'divider',
    },
    {
      key: 'injections',
      icon: <BulbOutlined />,
      label: 'Injections',
    },
    {
      key: 'executions',
      icon: <PlayCircleOutlined />,
      label: 'Executions',
    },
    {
      key: 'artifacts',
      icon: <FileOutlined />,
      label: 'Artifacts',
    },
    {
      type: 'divider',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  // Handle menu click
  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'overview') {
      navigate(`/${projectName}`);
    } else {
      navigate(`/${projectName}/${key}`);
    }
  };

  // Update selected key based on current path
  useEffect(() => {
    const path = location.pathname;
    const projectBasePath = `/${projectName}`;

    if (path === projectBasePath || path === `${projectBasePath}/`) {
      setSelectedKey('overview');
    } else {
      // Extract the sub-path after project name
      const subPath = path.replace(projectBasePath, '').split('/')[1];
      if (subPath) {
        setSelectedKey(subPath);
      }
    }
  }, [location.pathname, projectName]);

  return (
    <div className='project-sidebar'>
      <Menu
        mode='inline'
        selectedKeys={[selectedKey]}
        items={menuItems}
        onClick={handleMenuClick}
        inlineCollapsed={collapsed}
        className='project-sidebar-menu'
      />
    </div>
  );
};

export default ProjectSidebar;
