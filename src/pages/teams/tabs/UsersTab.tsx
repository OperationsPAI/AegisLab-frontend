import { useMemo, useState } from 'react';

import {
  CheckCircleFilled,
  MoreOutlined,
  PlusOutlined,
  UserOutlined,
} from '@ant-design/icons';
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
import type { Team, TeamMember, TeamRole } from '@/types/api';

const { Text, Title } = Typography;
const { Search } = Input;

interface UsersTabProps {
  team: Team;
  members: TeamMember[];
  onInvite?: () => void;
}

const UsersTab: React.FC<UsersTabProps> = ({ team, members, onInvite }) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { user: currentUser } = useAuthStore();

  // Sort members: current user first, then by role
  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      // Current user first
      if (a.user.username === currentUser?.username) return -1;
      if (b.user.username === currentUser?.username) return 1;
      // Then sort by role priority
      const rolePriority: Record<TeamRole, number> = {
        owner: 0,
        admin: 1,
        member: 2,
      };
      return (rolePriority[a.role] ?? 3) - (rolePriority[b.role] ?? 3);
    });
  }, [members, currentUser?.username]);

  // Check if current user is admin or owner
  const currentMember = members.find(
    (m) => m.user.username === currentUser?.username
  );
  const isAdmin =
    currentMember?.role === 'admin' || currentMember?.role === 'owner';

  // Filter members by search
  const filteredMembers = sortedMembers.filter((m) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      m.user.display_name.toLowerCase().includes(searchLower) ||
      m.user.username.toLowerCase().includes(searchLower) ||
      m.user.email.toLowerCase().includes(searchLower) ||
      m.role.toLowerCase().includes(searchLower)
    );
  });

  // Paginate
  const paginatedMembers = filteredMembers.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const handleRoleChange = async (memberId: number, role: TeamRole) => {
    await teamApi.updateMemberRole(team.id, memberId, role);
  };

  const handleRemoveMember = async (memberId: number) => {
    await teamApi.removeMember(team.id, memberId);
  };

  const columns: ColumnsType<TeamMember> = [
    {
      title: 'PROFILE',
      key: 'profile',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar
            size={40}
            src={record.user.avatar_url}
            icon={!record.user.avatar_url && <UserOutlined />}
          />
          <div>
            <div style={{ fontWeight: 500 }}>{record.user.display_name}</div>
            <Text type='secondary' style={{ fontSize: 13 }}>
              @{record.user.username}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'EMAIL',
      dataIndex: ['user', 'email'],
      key: 'email',
    },
    {
      title: 'TEAM ROLE',
      dataIndex: 'role',
      key: 'role',
      render: (role: TeamRole, record) => (
        <Select
          value={role}
          onChange={(value) => handleRoleChange(record.id, value)}
          style={{ width: 100 }}
          disabled={!isAdmin}
          options={[
            { value: 'owner', label: 'Owner' },
            { value: 'admin', label: 'Admin' },
            { value: 'member', label: 'Member' },
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
        const isSelf = record.user.username === currentUser?.username;
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
                  onClick: () => handleRemoveMember(record.id),
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
        {members.length} users. {Math.max(0, 100 - members.length)} seats
        available.
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
          placeholder='Search by name, roles, teams...'
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
        dataSource={paginatedMembers}
        rowKey='id'
        pagination={{
          current: page,
          pageSize,
          total: filteredMembers.length,
          onChange: setPage,
          showSizeChanger: false,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
        }}
      />
    </div>
  );
};

export default UsersTab;
