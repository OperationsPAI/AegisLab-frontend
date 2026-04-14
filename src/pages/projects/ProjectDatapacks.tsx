import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import type { InjectionResp } from '@rcabench/client';
import { useQuery } from '@tanstack/react-query';
import {
  Breadcrumb,
  Button,
  Skeleton,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import { projectApi } from '@/api/projects';

import ProjectSubNav from './ProjectSubNav';

const { Title } = Typography;

const injectionStateMap: Record<number, { label: string; color: string }> = {
  0: { label: 'Initial', color: 'default' },
  1: { label: 'Inject Failed', color: 'red' },
  2: { label: 'Inject Success', color: 'blue' },
  3: { label: 'Build Failed', color: 'red' },
  4: { label: 'Build Success', color: 'green' },
  5: { label: 'Detector Failed', color: 'red' },
  6: { label: 'Detector Success', color: 'green' },
};

/**
 * Full datapacks listing page for a project.
 * Route: /projects/:id/datapacks
 */
const ProjectDatapacks: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectApi.getProjectDetail(projectId),
    enabled: !!projectId && !Number.isNaN(projectId),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['project', projectId, 'injections', page, pageSize],
    queryFn: () =>
      projectApi.listProjectInjections(projectId, { page, size: pageSize }),
    enabled: !!projectId && !Number.isNaN(projectId),
  });

  if (projectLoading) {
    return (
      <div style={{ padding: 24 }}>
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  }

  const columns: ColumnsType<InjectionResp> = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    {
      title: 'Fault Type',
      dataIndex: 'fault_type',
      key: 'fault_type',
    },
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      render: (state: number) => {
        const mapping = injectionStateMap[state] ?? {
          label: 'Unknown',
          color: 'default',
        };
        return <Tag color={mapping.color}>{mapping.label}</Tag>;
      },
    },
    { title: 'Benchmark', dataIndex: 'benchmark_name', key: 'benchmark_name' },
    { title: 'Pedestal', dataIndex: 'pedestal_name', key: 'pedestal_name' },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) =>
        date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-',
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Breadcrumb
        style={{ marginBottom: 8 }}
        items={[
          { title: <Link to='/projects'>Projects</Link> },
          {
            title: (
              <Link to={`/projects/${projectId}`}>
                {project?.name ?? '...'}
              </Link>
            ),
          },
          { title: 'Datapacks' },
        ]}
      />
      <Title level={3} style={{ marginBottom: 0 }}>
        Datapacks
      </Title>

      <ProjectSubNav projectId={projectId} activeKey='datapacks' />

      <Space style={{ marginBottom: 16 }}>
        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={() => navigate(`/projects/${projectId}/inject`)}
        >
          New Injection
        </Button>
        <Button
          icon={<UploadOutlined />}
          onClick={() => navigate(`/projects/${projectId}/upload`)}
        >
          Upload Datapack
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={data?.items ?? []}
        rowKey='id'
        loading={isLoading}
        onRow={(record) => ({
          onClick: () => navigate(`/datapacks/${record.id}`),
          style: { cursor: 'pointer' },
        })}
        pagination={{
          current: page,
          pageSize,
          total: data?.total ?? 0,
          onChange: (p, s) => {
            setPage(p);
            setPageSize(s);
          },
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
        }}
      />
    </div>
  );
};

export default ProjectDatapacks;
