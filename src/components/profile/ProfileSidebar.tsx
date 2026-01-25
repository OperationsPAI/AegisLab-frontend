import {
  EditOutlined,
  MailOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { UserDetailResp } from '@rcabench/client';
import { Avatar, Button, Divider, Skeleton, Typography } from 'antd';

import './ProfileSidebar.css';

const { Text, Title } = Typography;

interface ProfileSidebarProps {
  user: UserDetailResp | null;
  isLoading?: boolean;
  onEditProfile?: () => void;
}

const ProfileSidebar = ({
  user,
  isLoading,
  onEditProfile,
}: ProfileSidebarProps) => {
  if (isLoading) {
    return (
      <div className='profile-sidebar'>
        <Skeleton avatar={{ size: 180 }} active paragraph={{ rows: 4 }} />
      </div>
    );
  }

  // Mock teams data - replace with actual API when available
  const teams = [{ id: 1, name: 'Personal Capital' }];

  return (
    <div className='profile-sidebar'>
      {/* Avatar */}
      <div className='profile-avatar-section'>
        <Avatar
          size={180}
          icon={<UserOutlined />}
          src={user?.avatar}
          className='profile-avatar'
        />
      </div>

      {/* User Info */}
      <div className='profile-info'>
        <Title level={3} className='profile-name'>
          {user?.full_name || user?.username || 'User'}
        </Title>
        <Text type='secondary' className='profile-username'>
          {user?.username}
        </Text>
        {user?.email && (
          <div className='profile-email'>
            <MailOutlined />
            <Text type='secondary'>{user.email}</Text>
          </div>
        )}
      </div>

      {/* Edit Button */}
      <Button
        block
        icon={<EditOutlined />}
        onClick={onEditProfile}
        className='profile-edit-btn'
      >
        Edit profile
      </Button>

      <Divider />

      {/* Teams Section */}
      <div className='profile-teams'>
        <div className='teams-header'>
          <TeamOutlined />
          <Text strong>Teams</Text>
        </div>
        <div className='teams-list'>
          {teams.map((team) => (
            <div key={team.id} className='team-item'>
              <TeamOutlined />
              <Text>{team.name}</Text>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;
