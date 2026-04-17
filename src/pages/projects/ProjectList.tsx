import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  DeleteOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { ProjectResp } from '@rcabench/client';
import {
  Button,
  Card,
  message,
  Modal,
  Row,
  Space,
  Table,
  type TablePaginationConfig,
  Tag,
  Typography,
} from 'antd';
import dayjs from 'dayjs';

import { projectApi } from '@/api/projects';
import { useProjects } from '@/hooks/useProjects';

import CreateProjectModal from './CreateProjectModal';

import './ProjectList.css';

const { Title, Text } = Typography;

const ProjectList = () => {
  const navigate = useNavigate();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProjectResp | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [batchDeleting, setBatchDeleting] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const {
    data: projectsData,
    isLoading,
    refetch,
  } = useProjects({
    page: pagination.current,
    size: pagination.pageSize,
  });

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    setPagination({
      ...pagination,
      current: newPagination.current || 1,
      pageSize: newPagination.pageSize || 10,
    });
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination({ ...pagination, current: 1 });
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    try {
      await projectApi.deleteProject(deleteTarget.id);
      message.success('Project deleted');
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      setDeleteConfirmText('');
      void refetch();
    } catch {
      message.error('Failed to delete project');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) return;
    setBatchDeleting(true);
    try {
      await Promise.all(
        selectedRowKeys.map((id) => projectApi.deleteProject(id as number))
      );
      message.success(`Deleted ${selectedRowKeys.length} project(s)`);
      setSelectedRowKeys([]);
      void refetch();
    } catch {
      message.error('Failed to delete some projects');
    } finally {
      setBatchDeleting(false);
    }
  };

  const handleCreateSuccess = (project: ProjectResp) => {
    setCreateModalOpen(false);
    if (project.id) {
      navigate(`/projects/${project.id}`);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: ProjectResp) => (
        <Button
          type='link'
          style={{ padding: 0 }}
          onClick={() => navigate(`/projects/${record.id}`)}
        >
          <Text strong>{name}</Text>
        </Button>
      ),
    },
    {
      title: 'Visibility',
      dataIndex: 'is_public',
      key: 'is_public',
      width: 120,
      render: (isPublic: boolean) =>
        isPublic ? (
          <Tag icon={<EyeOutlined />} color='blue'>
            Public
          </Tag>
        ) : (
          <Tag icon={<EyeInvisibleOutlined />}>Private</Tag>
        ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (date: string) => (
        <Text>{date ? dayjs(date).format('MMM D, YYYY') : '-'}</Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: unknown, record: ProjectResp) => (
        <Space>
          <Button
            type='text'
            icon={<EditOutlined />}
            onClick={() => navigate(`/projects/${record.id}/settings`)}
            title='Edit Project'
          />
          <Button
            type='text'
            danger
            icon={<DeleteOutlined />}
            title='Delete Project'
            onClick={() => {
              setDeleteTarget(record);
              setDeleteConfirmText('');
              setDeleteModalOpen(true);
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className='project-list'>
      {/* Page Header */}
      <div className='page-header'>
        <div className='page-header-left'>
          <Title level={4} className='page-title'>
            Projects
          </Title>
          <Text type='secondary'>Manage your RCA benchmarking projects</Text>
        </div>
        <Button
          type='primary'
          size='large'
          icon={<PlusOutlined />}
          onClick={() => setCreateModalOpen(true)}
          className='create-button'
        >
          New Project
        </Button>
      </div>

      {/* Search */}
      <Card className='search-card'>
        <Row align='middle'>
          <Col flex='auto'>
            <Search
              placeholder='Search projects by name...'
              allowClear
              enterButton={<SearchOutlined />}
              size='large'
              onSearch={handleSearch}
              style={{ maxWidth: 400 }}
            />
          </Col>
        </Row>
      </Card>

      {/* Batch Operations */}
      {selectedRowKeys.length > 0 && (
        <Card size='small' style={{ marginBottom: 16 }}>
          <Space>
            <Text>{selectedRowKeys.length} selected</Text>
            <Button
              danger
              icon={<DeleteOutlined />}
              loading={batchDeleting}
              onClick={handleBatchDelete}
            >
              Delete Selected
            </Button>
          </Space>
        </Card>
      )}

      {/* Projects Table */}
      <Card className='table-card'>
        <Table
          columns={columns}
          dataSource={projectsData?.items || []}
          loading={isLoading}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          pagination={{
            ...pagination,
            total: projectsData?.pagination?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} projects`,
          }}
          onChange={handleTableChange}
          rowKey='id'
          className='projects-table'
          rowClassName='project-row'
        />
      </Card>

      {/* Create Project Modal */}
      <CreateProjectModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        title={`Delete "${deleteTarget?.name}" project?`}
        open={deleteModalOpen}
        onCancel={() => {
          setDeleteModalOpen(false);
          setDeleteTarget(null);
          setDeleteConfirmText('');
        }}
        footer={[
          <Button
            key='cancel'
            onClick={() => {
              setDeleteModalOpen(false);
              setDeleteTarget(null);
              setDeleteConfirmText('');
            }}
          >
            Cancel
          </Button>,
          <Button
            key='delete'
            danger
            type='primary'
            disabled={deleteConfirmText !== deleteTarget?.name}
            onClick={handleDelete}
          >
            Delete
          </Button>,
        ]}
      >
        <div>
          <Text>
            This will permanently delete {deleteTarget?.name} and all associated
            data. <Text strong>This action cannot be undone.</Text>
          </Text>
          <div style={{ marginTop: 12, marginBottom: 8 }}>
            <Text>
              Please type <Text strong>{deleteTarget?.name}</Text> to confirm.
            </Text>
          </div>
          <Input
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder={deleteTarget?.name}
          />
        </div>
      </Modal>
    </div>
  );
};

export default ProjectList;
