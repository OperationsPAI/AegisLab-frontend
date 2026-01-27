import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  AppstoreOutlined,
  BulbOutlined,
  CodeOutlined,
  FileOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { Menu, type MenuProps } from 'antd';

import './WorkspaceSidebar.css';

interface WorkspaceSidebarProps {
  teamName: string;
  projectName: string;
  collapsed?: boolean;
}

/**
 * Workspace-specific sidebar navigation
 * Shows menu items for project workspace sub-pages with organized sections
 */
const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({
  teamName,
  projectName,
  collapsed = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedKey, setSelectedKey] = useState<string>('overview');

  // Menu items for workspace navigation
  const menuItems: MenuProps['items'] = [
    {
      key: 'overview',
      icon: <AppstoreOutlined />,
      label: 'Project',
    },
    {
      key: 'workspace',
      icon: <CodeOutlined />,
      label: 'Workspace',
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
      key: 'evaluations',
      icon: <SafetyCertificateOutlined />,
      label: 'Evaluations',
    },
    {
      key: 'reports',
      icon: <FileTextOutlined />,
      label: 'Reports',
    },
    {
      key: 'artifacts',
      icon: <FileOutlined />,
      label: 'Artifacts',
    },
  ];

  // Handle menu click
  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'overview') {
      navigate(`/${teamName}/${projectName}`);
    } else {
      navigate(`/${teamName}/${projectName}/${key}`);
    }
  };

  // Update selected key based on current path
  useEffect(() => {
    const path = location.pathname;
    const projectBasePath = `/${teamName}/${projectName}`;

    if (path === projectBasePath || path === `${projectBasePath}/`) {
      setSelectedKey('overview');
    } else {
      // Extract the sub-path after project name
      const subPath = path.replace(projectBasePath, '').split('/')[1];
      if (subPath) {
        setSelectedKey(subPath);
      }
    }
  }, [location.pathname, teamName, projectName]);

  return (
    <div className='workspace-sidebar'>
      <Menu
        mode='inline'
        selectedKeys={[selectedKey]}
        items={menuItems}
        onClick={handleMenuClick}
        inlineCollapsed={collapsed}
        className='workspace-sidebar-menu'
      />
    </div>
  );
};

export default WorkspaceSidebar;
