import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

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
  const [searchParams, setSearchParams] = useSearchParams();
  const [inviteModalVisible, setInviteModalVisible] = useState(false);

  const { team, members, isLoading, error } = useTeamContext();

  // Get active tab from URL or default to 'overview'
  const activeTab = searchParams.get('tab') || 'overview';

  const handleTabChange = (key: string) => {
    setSearchParams({ tab: key });
  };

  const handleInvite = () => {
    // Navigate to users tab
    setSearchParams({ tab: 'users' });
    setInviteModalVisible(true);
  };

  const handleNavigateToSettings = () => {
    setSearchParams({ tab: 'settings' });
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
      children: (
        <UsersTab team={team} members={members} onInvite={handleInvite} />
      ),
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
        members={members}
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
