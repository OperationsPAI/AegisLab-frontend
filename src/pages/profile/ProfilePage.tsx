import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { FolderOutlined, StarOutlined, UserOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Modal, Tabs } from 'antd';

import { authApi } from '@/api/auth';
import ProfileSidebar from '@/components/profile/ProfileSidebar';
import { useProfileStore } from '@/store/profile';

import ProfileTab from './tabs/ProfileTab';
import ProjectsTab from './tabs/ProjectsTab';
import StarsTab from './tabs/StarsTab';

import './ProfilePage.css';

const ProfilePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const { loadStarredProjects } = useProfileStore();

  // Get active tab from URL or default to 'profile'
  const activeTab = searchParams.get('tab') || 'profile';

  // Fetch user profile
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => authApi.getProfile(),
  });

  // Load starred projects on mount
  useEffect(() => {
    loadStarredProjects();
  }, [loadStarredProjects]);

  const handleTabChange = (key: string) => {
    setSearchParams({ tab: key });
  };

  const handleEditProfile = () => {
    setEditModalVisible(true);
  };

  const tabItems = [
    {
      key: 'profile',
      label: (
        <span>
          <UserOutlined />
          Profile
        </span>
      ),
      children: <ProfileTab />,
    },
    {
      key: 'projects',
      label: (
        <span>
          <FolderOutlined />
          Projects
        </span>
      ),
      children: <ProjectsTab />,
    },
    {
      key: 'stars',
      label: (
        <span>
          <StarOutlined />
          Stars
        </span>
      ),
      children: <StarsTab />,
    },
  ];

  return (
    <div className='profile-page'>
      {/* Sidebar */}
      <ProfileSidebar
        user={userData || null}
        isLoading={userLoading}
        onEditProfile={handleEditProfile}
      />

      {/* Main Content */}
      <div className='profile-content'>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
          className='profile-tabs'
        />
      </div>

      {/* Edit Profile Modal */}
      <Modal
        title='Edit Profile'
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        <p>Profile editing coming soon...</p>
      </Modal>
    </div>
  );
};

export default ProfilePage;
