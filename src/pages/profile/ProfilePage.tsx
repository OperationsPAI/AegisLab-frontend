import { useSearchParams } from 'react-router-dom';

import { FolderOutlined, UserOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Tabs } from 'antd';

import { authApi } from '@/api/auth';
import ProfileSidebar from '@/components/profile/ProfileSidebar';

import ProfileTab from './tabs/ProfileTab';
import ProjectsTab from './tabs/ProjectsTab';

import './ProfilePage.css';

const ProfilePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Get active tab from URL or default to 'profile'
  const activeTab = searchParams.get('tab') || 'profile';

  // Fetch user profile
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => authApi.getProfile(),
  });

  const handleTabChange = (key: string) => {
    setSearchParams({ tab: key });
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
  ];

  return (
    <div className='profile-page'>
      {/* Sidebar */}
      <ProfileSidebar
        user={userData || null}
        isLoading={userLoading}
        onEditProfile={() => {
          // Profile editing is read-only; managed by admin
        }}
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
    </div>
  );
};

export default ProfilePage;
