import { useState } from 'react';

import {
  CheckCircleFilled,
  MoreOutlined,
  PlusOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { PageSize, type TeamMemberResp } from '@rcabench/client';
import { useQuery } from '@tanstack/react-query';
import {
  Avatar,
  Button,
  Dropdown,
  Input,
  Select,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { teamApi } from '@/api/teams';
import { useAuthStore } from '@/store/auth';
import type { Team } from '@/types/api';

const { Text, Title } = Typography;
const { Search } = Input;

interface UsersTabProps {
  team: Team;
  onInvite?: () => void;
}

const UsersTab: React.FC<UsersTabProps> = ({ team, onInvite }) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { user: currentUser } = useAuthStore();

  // Fetch team members with pagination
  const { data: membersData, isLoading } = useQuery({
    queryKey: ['team', 'members', team.id, page, search],
    queryFn: () =>
      teamApi.getTeamMembers(team.id, {
        page,
        size: PageSize.Small,
      }),
  });

  const members = membersData?.items || [];

  // Check if current user is admin or owner
  const currentMember = members.find(
    (m) => m.username === currentUser?.username
  );
  const isAdmin = currentMember?.role_name === 'Team Admin';

  const handleRoleChange = async (userId: number, roleName: string) => {
    // TODO: Update API to accept role_name
    // await teamApi.updateMemberRole(team.id, userId, roleName);
    void userId;
    void roleName;
  };

  const handleRemoveMember = async (userId: number) => {
    // TODO: Update API to accept user_id
    // await teamApi.removeMember(team.id, userId);
    void userId;
  };

  const columns: ColumnsType<TeamMemberResp> = [
    {
      title: 'PROFILE',
      key: 'profile',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar size={40} icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>
              {record.full_name || record.username}
            </div>
            <Text type='secondary' style={{ fontSize: 13 }}>
              @{record.username}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'EMAIL',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'TEAM ROLE',
      dataIndex: 'role_name',
      key: 'role_name',
      render: (_roleName: string, record) => (
        <Select
          value={record.role_name}
          onChange={(value) => handleRoleChange(record.user_id || 0, value)}
          style={{ width: 100 }}
          disabled={!isAdmin}
          options={[
            { value: 'Team Admin', label: 'Admin' },
            { value: 'Team Member', label: 'Member' },
          ]}
        />
      ),
    },
    {
      title: 'STATUS',
      key: 'status',
      render: () => (
        <Tag color='success' icon={<CheckCircleFilled />}>
          Full
        </Tag>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_, record) => {
        // Only admins can remove members, and cannot remove themselves
        const isSelf = record.username === currentUser?.username;
        const canRemove = isAdmin && !isSelf;

        if (!canRemove) return null;

        return (
          <Dropdown
            menu={{
              items: [
                {
                  key: 'remove',
                  label: 'Remove from team',
                  danger: true,
                  onClick: () => handleRemoveMember(record.user_id || 0),
                },
              ],
            }}
            trigger={['click']}
          >
            <Button type='text' icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className='users-tab'>
      {/* Header */}
      <Title level={5} style={{ marginBottom: 16 }}>
        Users
      </Title>

      {/* Search and Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Search
          placeholder='Search by name, email...'
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          style={{ width: 300 }}
          allowClear
        />
        <Button type='primary' icon={<PlusOutlined />} onClick={onInvite}>
          Invite new user
        </Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={members}
        rowKey='id'
        loading={isLoading}
        pagination={{
          current: page,
          pageSize: PageSize.Small,
          total: membersData?.total || 0,
          onChange: setPage,
          showSizeChanger: false,
          showTotal: (total) => `showing ${total}`,
        }}
      />
    </div>
  );
};

export default UsersTab;
