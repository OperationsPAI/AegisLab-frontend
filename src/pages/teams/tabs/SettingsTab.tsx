import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  KeyOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Card,
  Empty,
  Form,
  Input,
  message,
  Modal,
  Switch,
  Table,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { teamApi } from '@/api/teams';
import type { Team, TeamSecret } from '@/types/api';

const { Text, Title, Paragraph } = Typography;

interface SettingsTabProps {
  team: Team;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ team }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [secretModalVisible, setSecretModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [secretForm] = Form.useForm();

  // Fetch team secrets
  const { data: secrets = [], isLoading: secretsLoading } = useQuery({
    queryKey: ['team', 'secrets', team.id],
    queryFn: () => [],
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (settings: Partial<Team['settings']>) =>
      teamApi.updateTeamSettings(team.id, settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', 'byName'] });
      message.success('Settings updated');
    },
  });

  // Add secret mutation
  const addSecretMutation = useMutation({
    mutationFn: (data: { name: string; value: string }) =>
      teamApi.addSecret(team.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', 'secrets', team.id] });
      setSecretModalVisible(false);
      secretForm.resetFields();
      message.success('Secret added');
    },
  });

  // Delete secret mutation
  const deleteSecretMutation = useMutation({
    mutationFn: (secretId: number) => teamApi.deleteSecret(team.id, secretId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', 'secrets', team.id] });
      message.success('Secret deleted');
    },
  });

  // Delete team mutation
  const deleteTeamMutation = useMutation({
    mutationFn: () => teamApi.deleteTeam(team.id),
    onSuccess: () => {
      message.success('Team deleted');
      navigate('/home');
    },
  });

  const handleCustomizationToggle = (checked: boolean) => {
    updateSettingsMutation.mutate({ customization_enabled: checked });
  };

  const handleAddSecret = (values: { name: string; value: string }) => {
    addSecretMutation.mutate(values);
  };

  const handleDeleteTeam = () => {
    if (deleteConfirmText === team.name) {
      deleteTeamMutation.mutate();
    }
  };

  const secretColumns: ColumnsType<TeamSecret> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Created By',
      dataIndex: 'created_by',
      key: 'created_by',
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Button
          type='text'
          danger
          icon={<DeleteOutlined />}
          onClick={() => deleteSecretMutation.mutate(record.id)}
        />
      ),
    },
  ];

  return (
    <div className='settings-tab'>
      {/* Header */}
      <Title level={2}>
        Team Settings for {team.display_name || team.name}
      </Title>
      <Paragraph type='secondary' style={{ marginBottom: 24 }}>
        Only admins can update team settings
      </Paragraph>

      {/* Team Profile Section */}
      <Card style={{ marginBottom: 24 }}>
        <Title level={5} style={{ marginBottom: 16 }}>
          Team profile
        </Title>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <Text strong>CUSTOMIZATION</Text>
            <br />
            <Text type='secondary'>
              Customize your user team page to showcase your ML portfolio
            </Text>
          </div>
          <Switch
            checked={team.settings?.customization_enabled ?? false}
            onChange={handleCustomizationToggle}
            loading={updateSettingsMutation.isPending}
          />
        </div>
      </Card>

      {/* Team Secrets Section */}
      <Card style={{ marginBottom: 24 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <div>
            <Title level={5} style={{ margin: 0 }}>
              <KeyOutlined style={{ marginRight: 8 }} />
              Team Secrets
            </Title>
            <Text type='secondary'>
              Manage secrets for your team&apos;s projects
            </Text>
          </div>
          <Button
            type='primary'
            icon={<PlusOutlined />}
            onClick={() => setSecretModalVisible(true)}
          >
            Add Secret
          </Button>
        </div>

        {secrets.length > 0 ? (
          <Table
            columns={secretColumns}
            dataSource={secrets}
            rowKey='id'
            loading={secretsLoading}
            pagination={false}
          />
        ) : (
          <Empty
            image={<KeyOutlined style={{ fontSize: 48, color: '#ccc' }} />}
            description='No secrets configured yet.'
          />
        )}
      </Card>

      {/* Danger Zone */}
      <Card
        style={{
          borderColor: '#ff4d4f',
        }}
      >
        <Title level={5} style={{ color: '#ff4d4f', marginBottom: 16 }}>
          <ExclamationCircleOutlined style={{ marginRight: 8 }} />
          Danger Zone
        </Title>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 0',
            borderTop: '1px solid #f0f0f0',
          }}
        >
          <div>
            <Text strong>Delete Team</Text>
            <br />
            <Text type='secondary'>
              Once deleted, all team data will be permanently removed.
            </Text>
          </div>
          <Button danger onClick={() => setDeleteModalVisible(true)}>
            Delete Team
          </Button>
        </div>
      </Card>

      {/* Add Secret Modal */}
      <Modal
        title='Add Secret'
        open={secretModalVisible}
        onCancel={() => {
          setSecretModalVisible(false);
          secretForm.resetFields();
        }}
        footer={null}
      >
        <Form form={secretForm} layout='vertical' onFinish={handleAddSecret}>
          <Form.Item
            name='name'
            label='Secret Name'
            rules={[{ required: true, message: 'Please enter secret name' }]}
          >
            <Input placeholder='MY_SECRET_KEY' />
          </Form.Item>
          <Form.Item
            name='value'
            label='Secret Value'
            rules={[{ required: true, message: 'Please enter secret value' }]}
          >
            <Input.Password placeholder='Enter secret value' />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button
              type='primary'
              htmlType='submit'
              loading={addSecretMutation.isPending}
            >
              Add Secret
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Team Modal */}
      <Modal
        title='Delete Team'
        open={deleteModalVisible}
        onCancel={() => {
          setDeleteModalVisible(false);
          setDeleteConfirmText('');
        }}
        footer={[
          <Button
            key='cancel'
            onClick={() => {
              setDeleteModalVisible(false);
              setDeleteConfirmText('');
            }}
          >
            Cancel
          </Button>,
          <Button
            key='delete'
            danger
            type='primary'
            disabled={deleteConfirmText !== team.name}
            loading={deleteTeamMutation.isPending}
            onClick={handleDeleteTeam}
          >
            Delete Team
          </Button>,
        ]}
      >
        <Paragraph>
          This action cannot be undone. This will permanently delete the{' '}
          <Text strong>{team.name}</Text> team and all associated data.
        </Paragraph>
        <Paragraph>
          Please type <Text strong>{team.name}</Text> to confirm.
        </Paragraph>
        <Input
          value={deleteConfirmText}
          onChange={(e) => setDeleteConfirmText(e.target.value)}
          placeholder={team.name}
        />
      </Modal>
    </div>
  );
};

export default SettingsTab;
