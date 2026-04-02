/**
 * NotificationsPage - Real-time notification list with SSE streaming.
 *
 * Route: /notifications
 *
 * Connects to the notification SSE stream via the useNotifications hook,
 * displays a reverse-chronological list, and allows marking items as read.
 */
import { useMemo, useState } from 'react';

import {
  BellOutlined,
  CheckOutlined,
  ClearOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  Badge,
  Button,
  Card,
  Empty,
  List,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import {
  type NotificationEvent,
  useNotifications,
} from '@/hooks/useNotifications';

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;

// ---------- Helpers ----------

type NotificationType = 'info' | 'success' | 'warning' | 'error';

const typeConfig: Record<
  NotificationType,
  { color: string; icon: React.ReactNode; tagColor: string }
> = {
  info: {
    color: '#1890ff',
    icon: <InfoCircleOutlined />,
    tagColor: 'blue',
  },
  success: {
    color: '#52c41a',
    icon: <CheckOutlined />,
    tagColor: 'success',
  },
  warning: {
    color: '#faad14',
    icon: <WarningOutlined />,
    tagColor: 'warning',
  },
  error: {
    color: '#ff4d4f',
    icon: <ExclamationCircleOutlined />,
    tagColor: 'error',
  },
};

const getTypeConfig = (type: string) =>
  typeConfig[type as NotificationType] ?? typeConfig.info;

// ---------- Filter options ----------

type FilterValue = 'all' | 'unread' | 'read';

// ---------- Component ----------

const NotificationsPage: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useNotifications();

  const [filter, setFilter] = useState<FilterValue>('all');

  // Apply filter
  const filteredNotifications = useMemo(() => {
    switch (filter) {
      case 'unread':
        return notifications.filter((n) => !n.read);
      case 'read':
        return notifications.filter((n) => n.read);
      default:
        return notifications;
    }
  }, [notifications, filter]);

  // ---------- Render ----------

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <Space align='center' size={12}>
          <Title level={3} style={{ margin: 0 }}>
            <BellOutlined style={{ marginRight: 8 }} />
            Notifications
          </Title>
          {unreadCount > 0 && (
            <Badge count={unreadCount} style={{ backgroundColor: '#2563eb' }} />
          )}
          <Badge
            status={isConnected ? 'processing' : 'default'}
            text={
              <Text type='secondary' style={{ fontSize: 12 }}>
                {isConnected ? 'Live' : 'Disconnected'}
              </Text>
            }
          />
        </Space>

        <Space>
          <Button
            icon={<CheckOutlined />}
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            Mark All Read
          </Button>
          <Button
            icon={<ClearOutlined />}
            onClick={clearAll}
            disabled={notifications.length === 0}
            danger
          >
            Clear All
          </Button>
        </Space>
      </div>

      {/* Filter tabs */}
      <Space style={{ marginBottom: 16 }}>
        {(
          [
            { key: 'all', label: 'All' },
            { key: 'unread', label: `Unread (${unreadCount})` },
            { key: 'read', label: 'Read' },
          ] as Array<{ key: FilterValue; label: string }>
        ).map((item) => (
          <Button
            key={item.key}
            type={filter === item.key ? 'primary' : 'default'}
            size='small'
            onClick={() => setFilter(item.key)}
          >
            {item.label}
          </Button>
        ))}
      </Space>

      {/* Notification list */}
      <Card bodyStyle={{ padding: 0 }}>
        {filteredNotifications.length === 0 ? (
          <div style={{ padding: 64, textAlign: 'center' }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                filter === 'unread'
                  ? 'No unread notifications'
                  : filter === 'read'
                    ? 'No read notifications'
                    : 'No notifications yet'
              }
            />
            {!isConnected && notifications.length === 0 && (
              <Text type='secondary' style={{ display: 'block', marginTop: 8 }}>
                Waiting for notification stream to connect...
              </Text>
            )}
          </div>
        ) : (
          <List<NotificationEvent>
            dataSource={filteredNotifications}
            renderItem={(item) => {
              const config = getTypeConfig(item.type);
              return (
                <List.Item
                  key={item.id}
                  style={{
                    padding: '16px 24px',
                    background: item.read ? 'transparent' : '#f0f5ff',
                    cursor: item.read ? 'default' : 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onClick={() => {
                    if (!item.read) {
                      markAsRead(item.id);
                    }
                  }}
                  actions={[
                    !item.read && (
                      <Tooltip title='Mark as read' key='read'>
                        <Button
                          type='text'
                          size='small'
                          icon={<CheckOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(item.id);
                          }}
                        />
                      </Tooltip>
                    ),
                  ].filter(Boolean)}
                >
                  <List.Item.Meta
                    avatar={
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: `${config.color}15`,
                          color: config.color,
                          fontSize: 18,
                        }}
                      >
                        {config.icon}
                      </div>
                    }
                    title={
                      <Space size={8}>
                        <Tag color={config.tagColor} style={{ fontSize: 11 }}>
                          {item.type.toUpperCase()}
                        </Tag>
                        {!item.read && (
                          <Badge
                            dot
                            offset={[0, 0]}
                            style={{ marginLeft: 4 }}
                          />
                        )}
                      </Space>
                    }
                    description={
                      <div>
                        <Paragraph
                          style={{
                            margin: '4px 0 0',
                            color: item.read
                              ? 'rgba(0,0,0,0.45)'
                              : 'rgba(0,0,0,0.85)',
                            fontWeight: item.read ? 'normal' : 500,
                          }}
                        >
                          {item.message}
                        </Paragraph>
                        <Text
                          type='secondary'
                          style={{
                            fontSize: 12,
                            marginTop: 4,
                            display: 'block',
                          }}
                        >
                          {dayjs(item.timestamp).fromNow()}
                          {' - '}
                          {dayjs(item.timestamp).format('YYYY-MM-DD HH:mm:ss')}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              );
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default NotificationsPage;
