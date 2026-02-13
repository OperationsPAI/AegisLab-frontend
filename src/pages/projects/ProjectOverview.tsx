import { useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import {
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  GlobalOutlined,
  LockOutlined,
  StarFilled,
  StarOutlined,
  TeamOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Badge,
  Button,
  Card,
  Drawer,
  Dropdown,
  Empty,
  Form,
  Input,
  List,
  message,
  Modal,
  Select,
  Space,
  Tabs,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { projectApi } from '@/api/projects';
import type { ProjectOutletContext } from '@/hooks/useProjectContext';
import { useProfileStore } from '@/store/profile';

import './ProjectOverview.css';

dayjs.extend(relativeTime);

const { Text, Paragraph } = Typography;

interface ListItem {
  key: string;
  label: string;
  value: React.ReactNode;
}

/**
 * Project Overview Page - W&B Style
 * Shows project details in a high-density key-value list with tabs
 */
const ProjectOverview: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { project, teamName, projectName, projectId } =
    useOutletContext<ProjectOutletContext>();

  // State
  const [activeTab, setActiveTab] = useState('details');
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Form
  const [form] = Form.useForm();

  // Star functionality
  const { toggleStar, isStarred } = useProfileStore();
  const starred = isStarred(projectId);

  // Update project mutation
  const updateMutation = useMutation({
    mutationFn: (data: {
      name?: string;
      description?: string;
      is_public?: boolean;
    }) => projectApi.updateProject(projectId, data),
    onSuccess: () => {
      message.success('Project updated successfully');
      queryClient.invalidateQueries({ queryKey: ['project', projectName] });
      setEditDrawerOpen(false);
    },
    onError: () => {
      message.error('Failed to update project');
    },
  });

  // Delete project mutation
  const deleteMutation = useMutation({
    mutationFn: () => projectApi.deleteProject(projectId),
    onSuccess: () => {
      message.success('Project deleted successfully');
      navigate(`/${teamName}`);
    },
    onError: () => {
      message.error('Failed to delete project');
    },
  });

  // Handlers
  const handleToggleStar = () => {
    toggleStar(projectId);
  };

  const handleSaveProject = (values: {
    name: string;
    visibility: string;
    description?: string;
  }) => {
    updateMutation.mutate({
      name: values.name,
      description: values.description,
      is_public: values.visibility === 'public',
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const handleOpenEditDrawer = () => {
    form.setFieldsValue({
      name: project.name,
      visibility: project.is_public ? 'public' : 'team',
    });
    setEditDrawerOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeleteConfirmText('');
  };

  // Details list data
  const detailsListData: ListItem[] = useMemo(
    () => [
      {
        key: 'visibility',
        label: 'Project visibility',
        value: (
          <Space size={8}>
            {project.is_public ? (
              <>
                <GlobalOutlined style={{ color: '#8c8c8c' }} />
                <Text>Public</Text>
              </>
            ) : (
              <>
                <TeamOutlined style={{ color: '#8c8c8c' }} />
                <Text>Team</Text>
              </>
            )}
          </Space>
        ),
      },
      {
        key: 'lastActive',
        label: 'Last active',
        value: (
          <Text>
            {project.updated_at
              ? dayjs(project.updated_at).format('YYYY/M/D HH:mm:ss')
              : '-'}
          </Text>
        ),
      },
      {
        key: 'contributors',
        label: 'Contributors',
        value: <Text>{project.user_count ?? 1} user</Text>,
      },
      {
        key: 'totalRuns',
        label: 'Total runs',
        value: <Text>{project.datapacks?.length ?? 0}</Text>,
      },
      {
        key: 'totalCompute',
        label: 'Total compute',
        value: <Text>-</Text>,
      },
    ],
    [project]
  );

  // More actions menu
  const moreMenuItems = [
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Delete project',
      danger: true,
      onClick: () => setDeleteModalOpen(true),
    },
    {
      key: 'undelete',
      icon: <UndoOutlined />,
      label: 'Undelete recently deleted runs',
      disabled: true,
    },
  ];

  // Render list item
  const renderListItem = (item: ListItem) => (
    <List.Item className='project-overview-list-item'>
      <div className='project-overview-list-key'>{item.label}</div>
      <div className='project-overview-list-value'>{item.value}</div>
    </List.Item>
  );

  // Tab items
  const tabItems = [
    {
      key: 'details',
      label: 'Details',
      children: (
        <div className='project-overview-details'>
          <List
            className='project-overview-list'
            itemLayout='horizontal'
            dataSource={detailsListData}
            split={false}
            renderItem={renderListItem}
          />
        </div>
      ),
    },
    {
      key: 'roles',
      label: (
        <Space size={8}>
          Project Roles
          <Badge
            count={1}
            style={{ backgroundColor: '#52c41a' }}
            size='small'
          />
        </Space>
      ),
      children: (
        <div className='project-overview-roles'>
          <Empty
            description='Project roles management coming soon'
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      ),
    },
  ];

  // Visibility options for select
  const visibilityOptions = [
    {
      value: 'team',
      label: (
        <Space size={8}>
          <TeamOutlined />
          <span>Team</span>
        </Space>
      ),
    },
    {
      value: 'public',
      label: (
        <Space size={8}>
          <GlobalOutlined />
          <span>Public</span>
        </Space>
      ),
    },
    {
      value: 'private',
      label: (
        <Space size={8}>
          <LockOutlined />
          <span>Private</span>
        </Space>
      ),
    },
  ];

  return (
    <div className='project-overview'>
      <Card className='project-overview-card' variant='borderless'>
        {/* Header with Title and Actions */}
        <div className='project-overview-header'>
          <h1 className='project-overview-title'>{project.name}</h1>
          <Space size={8}>
            <Button icon={<EditOutlined />} onClick={handleOpenEditDrawer}>
              Edit
            </Button>
            <Button
              type='text'
              icon={
                starred ? (
                  <StarFilled style={{ color: '#fadb14' }} />
                ) : (
                  <StarOutlined />
                )
              }
              onClick={handleToggleStar}
            />
            <Dropdown menu={{ items: moreMenuItems }} trigger={['click']}>
              <Button type='text' icon={<EllipsisOutlined />} />
            </Dropdown>
          </Space>
        </div>

        {/* Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className='project-overview-tabs'
        />
      </Card>

      {/* Edit Drawer */}
      <Drawer
        title='Edit project'
        placement='right'
        width={400}
        open={editDrawerOpen}
        onClose={() => setEditDrawerOpen(false)}
        className='project-edit-drawer'
      >
        <Form
          form={form}
          layout='vertical'
          onFinish={handleSaveProject}
          initialValues={{
            name: project.name,
            visibility: project.is_public ? 'public' : 'team',
          }}
        >
          <Form.Item
            label='Name'
            name='name'
            rules={[{ required: true, message: 'Please enter project name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label='Project visibility' name='visibility'>
            <Select options={visibilityOptions} />
          </Form.Item>
          <Form.Item
            label={
              <span>
                Description <Text type='secondary'>(optional)</Text>
              </span>
            }
            name='description'
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Button
            type='primary'
            htmlType='submit'
            block
            loading={updateMutation.isPending}
            className='save-button'
            style={{ backgroundColor: '#5fbfbf' }}
          >
            Save
          </Button>
        </Form>
      </Drawer>

      {/* Delete Confirmation Modal */}
      <Modal
        title={`Delete "${project.name}" project?`}
        open={deleteModalOpen}
        onCancel={handleCloseDeleteModal}
        className='project-delete-modal'
        footer={[
          <Button key='cancel' onClick={handleCloseDeleteModal}>
            Cancel
          </Button>,
          <Button
            key='delete'
            danger
            type='primary'
            disabled={deleteConfirmText !== project.name}
            loading={deleteMutation.isPending}
            onClick={handleDelete}
          >
            Delete
          </Button>,
        ]}
      >
        <div className='delete-warning'>
          <Paragraph>
            This will permanently delete {project.name} and all associated runs,
            files, and metadata.{' '}
            <Text strong>This action cannot be undone.</Text>
          </Paragraph>
          <Paragraph style={{ marginBottom: 8 }}>
            Please type <Text strong>the project name</Text> to confirm.
          </Paragraph>
          <Input
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder={project.name}
            className='confirm-input'
          />
        </div>
      </Modal>
    </div>
  );
};

export default ProjectOverview;
