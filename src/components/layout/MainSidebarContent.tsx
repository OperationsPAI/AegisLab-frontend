import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  FolderOutlined,
  HomeOutlined,
  PlusOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { type ProjectResp } from '@rcabench/client';
import { Button, Menu, type MenuProps } from 'antd';

import { useProjects } from '@/hooks/useProjects';
import { useTeams } from '@/hooks/useTeams';
import type { Team } from '@/types/api';

import './MainSidebarContent.css';

interface MainSidebarContentProps {
  onNavigate?: () => void;
}

/**
 * Main sidebar content component
 * Reusable sidebar content for both MainLayout and WorkspaceLayout drawer
 */
const MainSidebarContent: React.FC<MainSidebarContentProps> = ({
  onNavigate,
}) => {
  const navigate = useNavigate();

  // Fetch recent projects
  const { data: projectsData } = useProjects({
    page: 1,
    size: 5,
    queryKey: ['projects', 'sidebar'],
  });

  // Fetch teams
  const { data: teamsData } = useTeams({
    queryKey: ['teams', 'sidebar'],
  });

  const recentProjects = useMemo(
    () => projectsData?.items || [],
    [projectsData?.items]
  );

  const teams = useMemo(() => teamsData?.items || [], [teamsData?.items]);

  // Menu items
  const menuItems: MenuProps['items'] = [
    {
      key: '/home',
      icon: <HomeOutlined />,
      label: 'Home',
    },
    {
      type: 'divider',
      style: { margin: '12px 0 8px' },
    },
    // Projects section header
    {
      key: 'projects-header',
      type: 'group',
      label: (
        <span
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            padding: '0 8px',
          }}
        >
          <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
            Projects
          </span>
          <Button
            type='link'
            size='small'
            onClick={(e) => {
              e.stopPropagation();
              navigate('/profile?tab=projects');
              onNavigate?.();
            }}
            style={{ padding: 0, fontSize: 12, height: 'auto' }}
          >
            View all
          </Button>
        </span>
      ),
    },
    ...recentProjects.map((project: ProjectResp) => ({
      key: `/${project.name}`,
      icon: <FolderOutlined />,
      label: project.name,
    })),
    {
      type: 'divider',
      style: { margin: '12px 0 8px' },
    },
    // Teams section header
    {
      key: 'teams-header',
      type: 'group',
      label: (
        <span
          style={{
            fontWeight: 500,
            color: 'var(--color-text-primary)',
            padding: '0 8px',
          }}
        >
          Teams
        </span>
      ),
    },
    // Teams list
    ...teams.map((team: Team) => ({
      key: `/${team.name}`,
      icon: <TeamOutlined />,
      label: team.name,
    })),
    {
      key: 'action:create-team',
      icon: <PlusOutlined />,
      label: 'Create a team to collaborate',
      disabled: true,
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key.startsWith('action:')) {
      return;
    }
    if (key.startsWith('/')) {
      navigate(key);
      onNavigate?.();
    }
  };

  return (
    <div className='main-sidebar-content'>
      <Menu
        mode='inline'
        items={menuItems}
        onClick={handleMenuClick}
        className='main-sidebar-menu'
      />
      <div className='main-sidebar-footer'>
        <div className='system-status'>
          <div className='status-indicator' />
          <span className='status-text'>System Online</span>
        </div>
      </div>
    </div>
  );
};

export default MainSidebarContent;
