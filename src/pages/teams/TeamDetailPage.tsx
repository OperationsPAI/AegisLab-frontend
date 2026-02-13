import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import {
  AppstoreOutlined,
  FolderOutlined,
  SettingOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Button, Modal, Result, Spin, Tabs } from 'antd';

import TeamSidebar from '@/components/teams/TeamSidebar';
import { useTeamContext } from '@/hooks/useTeamContext';

import OverviewTab from './tabs/OverviewTab';
import ProjectsTab from './tabs/ProjectsTab';
import SettingsTab from './tabs/SettingsTab';
import UsersTab from './tabs/UsersTab';

import './TeamDetailPage.css';

const TeamDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { teamName } = useParams<{ teamName: string }>();
  const [inviteModalVisible, setInviteModalVisible] = useState(false);

  const { team, isLoading, error } = useTeamContext();

  // Get active tab from URL path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const activeTab = pathParts[1] || 'overview'; // /:teamName/:tab

  const handleTabChange = (key: string) => {
    navigate(`/${teamName}/${key}`);
  };

  const handleInvite = () => {
    // Navigate to users tab
    navigate(`/${teamName}/users`);
    setInviteModalVisible(true);
  };

  const handleNavigateToSettings = () => {
    navigate(`/${teamName}/settings`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className='team-detail-page'>
        <div className='team-detail-loading'>
          <Spin size='large' />
        </div>
      </div>
    );
  }

  // Error or not found state
  if (error || !team) {
    return (
      <div className='team-detail-page'>
        <div className='team-not-found'>
          <Result
            status='404'
            title='Team not found'
            subTitle="The team you are looking for does not exist or you don't have access to it."
            extra={
              <Button type='primary' onClick={() => navigate('/home')}>
                Go Home
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  const tabItems = [
    {
      key: 'overview',
      label: (
        <span>
          <AppstoreOutlined />
          Overview
        </span>
      ),
      children: <OverviewTab team={team} />,
    },
    {
      key: 'projects',
      label: (
        <span>
          <FolderOutlined />
          Projects
        </span>
      ),
      children: <ProjectsTab team={team} />,
    },
    {
      key: 'users',
      label: (
        <span>
          <TeamOutlined />
          Users
        </span>
      ),
      children: <UsersTab team={team} onInvite={handleInvite} />,
    },
    {
      key: 'settings',
      label: (
        <span>
          <SettingOutlined />
          Settings
        </span>
      ),
      children: <SettingsTab team={team} />,
    },
  ];

  return (
    <div className='team-detail-page'>
      {/* Sidebar */}
      <TeamSidebar
        team={team}
        onInvite={handleInvite}
        onNavigateToSettings={handleNavigateToSettings}
      />

      {/* Main Content */}
      <div className='team-detail-content'>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
          className='team-detail-tabs'
        />
      </div>

      {/* Invite Modal */}
      <Modal
        title='Invite Team Members'
        open={inviteModalVisible}
        onCancel={() => setInviteModalVisible(false)}
        footer={null}
      >
        <p>Team member invitation coming soon...</p>
      </Modal>
    </div>
  );
};

export default TeamDetailPage;
