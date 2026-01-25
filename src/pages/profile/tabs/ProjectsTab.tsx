import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  GlobalOutlined,
  LockOutlined,
  PlusOutlined,
  SearchOutlined,
  StarFilled,
  StarOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  Col,
  Empty,
  Input,
  Row,
  Space,
  Table,
  type TablePaginationConfig,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { profileApi } from '@/api/profile';
import ProjectCard from '@/components/profile/ProjectCard';
import { useProfileStore } from '@/store/profile';
import type { ProjectWithStats } from '@/types/api';

import './ProjectsTab.css';

dayjs.extend(relativeTime);

const { Text, Title } = Typography;
const { Search } = Input;

const ProjectsTab = () => {
  const navigate = useNavigate();
  const { toggleStar, isStarred } = useProfileStore();
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  // Fetch starred projects
  const { data: starredProjects, isLoading: starredLoading } = useQuery({
    queryKey: ['profile', 'starred-projects'],
    queryFn: () => profileApi.getStarredProjects(),
  });

  // Fetch user projects
  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: [
      'profile',
      'projects',
      pagination.current,
      pagination.pageSize,
      searchText,
    ],
    queryFn: () =>
      profileApi.getUserProjects({
        page: pagination.current,
        size: pagination.pageSize,
        search: searchText,
      }),
  });

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    setPagination({
      current: newPagination.current || 1,
      pageSize: newPagination.pageSize || 10,
    });
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination({ ...pagination, current: 1 });
  };

  const handleCreateProject = () => {
    navigate('/projects/new');
  };

  const handleRowClick = (record: ProjectWithStats) => {
    navigate(`/${record.name}`);
  };

  const columns: ColumnsType<ProjectWithStats> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <Text strong style={{ cursor: 'pointer' }}>
          {name}
        </Text>
      ),
    },
    {
      title: 'Last Run',
      dataIndex: 'last_run_at',
      key: 'last_run_at',
      width: 150,
      render: (date: string | undefined) =>
        date ? dayjs(date).fromNow() : <Text type='secondary'>-</Text>,
    },
    {
      title: 'Visibility',
      dataIndex: 'visibility',
      key: 'visibility',
      width: 130,
      render: (_: string, record: ProjectWithStats) => {
        if (record.is_public) {
          return (
            <Space>
              <GlobalOutlined />
              <Text>Public</Text>
            </Space>
          );
        }
        return (
          <Space>
            <LockOutlined />
            <Text>Private</Text>
          </Space>
        );
      },
    },
    {
      title: 'Runs',
      dataIndex: 'run_count',
      key: 'run_count',
      width: 100,
      render: (count: number) => (
        <Space>
          <SyncOutlined />
          <Text>{count || 0}</Text>
        </Space>
      ),
    },
    {
      title: '',
      key: 'star',
      width: 60,
      render: (_: unknown, record: ProjectWithStats) => {
        const starred = isStarred(record.id);
        return (
          <span
            className={`star-btn ${starred ? 'starred' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleStar(record.id);
            }}
          >
            {starred ? <StarFilled /> : <StarOutlined />}
          </span>
        );
      },
    },
  ];

  return (
    <div className='projects-tab'>
      {/* Starred Projects Section */}
      <div className='projects-section'>
        <Title level={5}>Your starred projects</Title>
        {starredLoading ? (
          <Text type='secondary'>Loading starred projects...</Text>
        ) : starredProjects?.length ? (
          <Row gutter={[16, 16]}>
            {starredProjects.map((project) => (
              <Col key={project.id} xs={24} sm={12} lg={8} xl={6}>
                <ProjectCard
                  project={project}
                  isStarred
                  onToggleStar={toggleStar}
                />
              </Col>
            ))}
          </Row>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description='No starred projects yet. Star projects to pin them here.'
          />
        )}
      </div>

      {/* Your Projects Section */}
      <div className='projects-section'>
        <div className='projects-header'>
          <Title level={5}>Your projects</Title>
          <Button
            type='primary'
            icon={<PlusOutlined />}
            onClick={handleCreateProject}
          >
            New project
          </Button>
        </div>

        <div className='projects-toolbar'>
          <Search
            placeholder='Search by project name'
            allowClear
            onSearch={handleSearch}
            style={{ maxWidth: 400 }}
            prefix={<SearchOutlined />}
          />
          <Text type='secondary'>
            showing {projectsData?.items.length || 0}
          </Text>
        </div>

        <Table
          columns={columns}
          dataSource={projectsData?.items || []}
          loading={projectsLoading}
          pagination={{
            ...pagination,
            total: projectsData?.total || 0,
            showSizeChanger: true,
            size: 'small',
          }}
          onChange={handleTableChange}
          rowKey='id'
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            style: { cursor: 'pointer' },
          })}
          size='middle'
        />
      </div>
    </div>
  );
};

export default ProjectsTab;
