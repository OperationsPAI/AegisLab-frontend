import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  FileTextOutlined,
  FolderOutlined,
  LinkOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Empty, Input, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { teamApi } from '@/api/teams';
import type { ExecutionResp, Team } from '@/types/api';

const { Text, Title, Paragraph } = Typography;
const { Search } = Input;

interface OverviewTabProps {
  team: Team;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ team }) => {
  const navigate = useNavigate();
  const [runsSearch, setRunsSearch] = useState('');
  const [runsPage, setRunsPage] = useState(1);
  const pageSize = 10;

  // Fetch team runs
  const { data: runsData, isLoading: runsLoading } = useQuery({
    queryKey: ['team', 'runs', team.id, runsPage, runsSearch],
    queryFn: () =>
      teamApi.getTeamRuns(team.id, {
        page: runsPage,
        size: pageSize,
        search: runsSearch,
      }),
  });

  // Fetch team links
  const { data: links = [] } = useQuery({
    queryKey: ['team', 'links', team.id],
    queryFn: () => [],
  });

  const runsColumns: ColumnsType<ExecutionResp> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: 'Project',
      dataIndex: 'project_name',
      key: 'project_name',
      render: (projectName: string) => (
        <Text
          style={{ cursor: 'pointer', color: 'var(--color-primary)' }}
          onClick={() => navigate(`/${team.name}/${projectName}`)}
        >
          {projectName}
        </Text>
      ),
    },
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      render: (state: string) => {
        const stateConfig: Record<string, { color: string; label: string }> = {
          completed: { color: '#52c41a', label: 'Finished' },
          running: { color: '#1890ff', label: 'Running' },
          failed: { color: '#ff4d4f', label: 'Failed' },
          pending: { color: '#faad14', label: 'Pending' },
        };
        const config = stateConfig[state] || { color: '#999', label: state };
        return <span style={{ color: config.color }}>{config.label}</span>;
      },
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => {
        const d = new Date(date);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const months = Math.floor(days / 30);
        if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        return 'Today';
      },
    },
    {
      title: 'User',
      dataIndex: 'user_name',
      key: 'user_name',
    },
  ];

  return (
    <div className='overview-tab'>
      {/* About Section */}
      <Card style={{ marginBottom: 24 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 16,
          }}
        >
          <Title level={5} style={{ margin: 0 }}>
            About
          </Title>
          <Button type='link' size='small'>
            Edit
          </Button>
        </div>
        <Card
          style={{
            background: 'var(--color-bg-secondary, #fafafa)',
            border: 'none',
          }}
        >
          {team.description ? (
            <div className='markdown-content'>
              <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                {team.description}
              </Paragraph>
            </div>
          ) : (
            <Empty
              image={
                <FileTextOutlined style={{ fontSize: 48, color: '#ccc' }} />
              }
              description={
                <span>
                  <Text strong>Add a team description</Text>
                  <br />
                  <Text type='secondary'>
                    Describe what your team works on and its mission.
                  </Text>
                </span>
              }
            >
              <Button type='link'>Add description</Button>
            </Empty>
          )}
        </Card>
      </Card>

      {/* Projects Section */}
      <Card style={{ marginBottom: 24 }}>
        <Title level={5} style={{ marginBottom: 16 }}>
          <FolderOutlined style={{ marginRight: 8 }} />
          Projects
        </Title>
        <Empty
          image={<FolderOutlined style={{ fontSize: 48, color: '#ccc' }} />}
          description={
            <span>
              <Text strong>Highlight your latest projects</Text>
              <br />
              <Text type='secondary'>
                Make a project public to showcase here!
              </Text>
            </span>
          }
        >
          <Button
            type='link'
            onClick={() => navigate(`/${team.name}/projects`)}
          >
            View my projects
          </Button>
        </Empty>
      </Card>

      {/* Links Section */}
      <Card style={{ marginBottom: 24 }}>
        <Title level={5} style={{ marginBottom: 16 }}>
          <LinkOutlined style={{ marginRight: 8 }} />
          Links
        </Title>
        {links.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target='_blank'
                rel='noopener noreferrer'
              >
                {link.title}
              </a>
            ))}
          </div>
        ) : (
          <Empty
            image={<LinkOutlined style={{ fontSize: 48, color: '#ccc' }} />}
            description={
              <span>
                <Text strong>Add links to your profile</Text>
                <br />
                <Text type='secondary'>Share a little bit about yourself</Text>
              </span>
            }
          >
            <Button type='link' icon={<PlusOutlined />}>
              Add a link
            </Button>
          </Empty>
        )}
      </Card>

      {/* Runs Section */}
      <Card>
        <Title level={5} style={{ marginBottom: 16 }}>
          Runs
        </Title>
        <div style={{ marginBottom: 16 }}>
          <Search
            placeholder='Search'
            value={runsSearch}
            onChange={(e) => setRunsSearch(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
        </div>
        <Table
          columns={runsColumns}
          dataSource={runsData?.items || []}
          rowKey='id'
          loading={runsLoading}
          pagination={{
            current: runsPage,
            pageSize,
            total: runsData?.total || 0,
            onChange: setRunsPage,
            showSizeChanger: false,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
          }}
        />
      </Card>
    </div>
  );
};

export default OverviewTab;
