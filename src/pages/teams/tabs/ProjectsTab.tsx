import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  PlusOutlined,
  StarFilled,
  StarOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Button, Input, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { teamApi } from '@/api/teams';
import { useProfileStore } from '@/store/profile';
import type { ProjectWithStats, Team } from '@/types/api';

const { Text, Title } = Typography;
const { Search } = Input;

interface ProjectsTabProps {
  team: Team;
}

const ProjectsTab: React.FC<ProjectsTabProps> = ({ team }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { toggleStar, isStarred } = useProfileStore();

  // Fetch team projects
  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['team', 'projects', team.id, page, search],
    queryFn: () =>
      teamApi.getTeamProjects(team.id, {
        page,
        size: pageSize,
        search,
      }),
  });

  const handleCreateProject = () => {
    navigate('/projects/new');
  };

  const handleToggleStar = async (projectId: number) => {
    await toggleStar(projectId);
  };

  const columns: ColumnsType<ProjectWithStats> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <Text
          strong
          style={{ cursor: 'pointer', color: 'var(--color-primary)' }}
          onClick={() => navigate(`/${team.name}/${name}/workspace`)}
        >
          {name}
        </Text>
      ),
    },
    {
      title: 'Last Run',
      dataIndex: 'last_run_at',
      key: 'last_run_at',
      render: (date: string | undefined) => {
        if (!date) return '-';
        const d = new Date(date);
        return d.toLocaleDateString('en-CA'); // YYYY-MM-DD format
      },
    },
    {
      title: 'Project Visibility',
      dataIndex: 'visibility',
      key: 'visibility',
      render: (visibility: string) => (
        <Tag
          icon={<TeamOutlined />}
          color={
            visibility === 'team'
              ? 'blue'
              : visibility === 'public'
                ? 'green'
                : 'default'
          }
        >
          {visibility === 'team'
            ? 'Team'
            : visibility === 'public'
              ? 'Public'
              : 'Private'}
        </Tag>
      ),
    },
    {
      title: 'Runs',
      dataIndex: 'run_count',
      key: 'run_count',
      render: (count: number) => count || 0,
    },
    {
      title: '',
      key: 'star',
      width: 60,
      render: (_: unknown, record: ProjectWithStats) => {
        const starred = isStarred(record.id);
        return (
          <Button
            type='text'
            icon={
              starred ? (
                <StarFilled style={{ color: '#fadb14' }} />
              ) : (
                <StarOutlined style={{ color: '#d9d9d9' }} />
              )
            }
            onClick={(e) => {
              e.stopPropagation();
              handleToggleStar(record.id);
            }}
          />
        );
      },
    },
  ];

  return (
    <div className='projects-tab'>
      {/* Header */}
      <Title level={4} style={{ marginBottom: 16 }}>
        Projects
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
          placeholder='Search by project name'
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          style={{ width: 300 }}
          allowClear
        />
        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={handleCreateProject}
        >
          New project
        </Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={projectsData?.items || []}
        rowKey='id'
        loading={isLoading}
        pagination={{
          current: page,
          pageSize,
          total: projectsData?.total || 0,
          onChange: setPage,
          showSizeChanger: false,
          showTotal: (total) => `showing ${total}`,
        }}
      />
    </div>
  );
};

export default ProjectsTab;
