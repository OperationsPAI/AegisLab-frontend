import { Link, useParams } from 'react-router-dom';

import { BarChartOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Breadcrumb, Card, Empty, Skeleton, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { evaluationApi } from '@/api/evaluations';
import { projectApi } from '@/api/projects';

import ProjectSubNav from './ProjectSubNav';

const { Title, Text } = Typography;

interface EvaluationRow {
  id?: number;
  datapack_id?: number;
  algorithm_names?: string[];
  status?: string;
  created_at?: string;
}

/**
 * Evaluations page for a project — comparison of algorithm results.
 * Route: /projects/:id/evaluations
 */
const ProjectEvaluations: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectApi.getProjectDetail(projectId),
    enabled: !!projectId && !Number.isNaN(projectId),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['evaluations'],
    queryFn: () => evaluationApi.getEvaluations({ page: 1, size: 20 }),
  });

  if (projectLoading) {
    return (
      <div style={{ padding: 24 }}>
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  }

  const columns: ColumnsType<EvaluationRow> = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Datapack', dataIndex: 'datapack_id', key: 'datapack_id' },
    {
      title: 'Algorithms',
      dataIndex: 'algorithm_names',
      key: 'algorithm_names',
      render: (names: string[] | undefined) => names?.join(', ') ?? '-',
    },
  ];

  const items = (data?.items ?? []) as EvaluationRow[];

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
          { title: 'Evaluations' },
        ]}
      />
      <Title level={3} style={{ marginBottom: 0 }}>
        Evaluations
      </Title>

      <ProjectSubNav projectId={projectId} activeKey='evaluations' />

      <Card style={{ marginBottom: 24, textAlign: 'center' }}>
        <Empty
          image={
            <BarChartOutlined
              style={{ fontSize: 48, color: 'var(--color-secondary-300)' }}
            />
          }
          description={
            <div>
              <Text strong>Select datapacks and algorithms to compare</Text>
              <br />
              <Text type='secondary'>
                Evaluation comparison will be available here once you have
                datapacks and algorithm results to compare.
              </Text>
            </div>
          }
        />
      </Card>

      {items.length > 0 && (
        <Card title='Existing Evaluations'>
          <Table
            columns={columns}
            dataSource={items}
            rowKey='id'
            loading={isLoading}
            pagination={false}
          />
        </Card>
      )}
    </div>
  );
};

export default ProjectEvaluations;
