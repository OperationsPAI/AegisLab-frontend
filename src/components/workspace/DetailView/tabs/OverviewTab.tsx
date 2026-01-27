import { useMemo } from 'react';

import { PlusOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Col, List, Row, Space, Tag, Typography } from 'antd';
import dayjs from 'dayjs';

import { STATUS_COLORS } from '@/types/workspace';

import ConfigTree from './ConfigTree';
import GroundTruthTable, { type GroundTruthItem } from './GroundTruthTable';

import './OverviewTab.css';

const { Text, Paragraph } = Typography;

export interface OverviewField {
  label: string;
  value: React.ReactNode;
  span?: number;
  isCommand?: boolean;
}

interface ListItem {
  key: string;
  label: string;
  value: React.ReactNode;
  isCommand?: boolean;
}

interface OverviewTabProps {
  // Basic info
  notes?: string;
  tags?: string[];
  author?: string;
  state: string;
  startTime?: string;
  runtime?: string;
  createdAt: string;
  updatedAt?: string;

  // Entity-specific fields passed as array
  additionalFields?: OverviewField[];

  // Config and Ground Truth for two-column layout
  config?: Record<string, unknown>;
  groundTruth?: GroundTruthItem[];

  // Actions
  onAddTag?: () => void;
  onEditNotes?: () => void;
}

/**
 * Overview tab component - W&B style List layout with high-density key-value pairs
 * Plus two-column layout for Config JSON tree and Ground Truth table
 */
const OverviewTab: React.FC<OverviewTabProps> = ({
  notes,
  tags = [],
  author,
  state,
  startTime,
  runtime,
  createdAt,
  updatedAt,
  additionalFields = [],
  config,
  groundTruth,
  onAddTag,
  onEditNotes,
}) => {
  // Get status color from STATUS_COLORS map
  const getStatusColor = (status: string): string => {
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus in STATUS_COLORS) {
      return STATUS_COLORS[normalizedStatus as keyof typeof STATUS_COLORS];
    }
    // Handle special cases
    if (
      normalizedStatus === 'inject_success' ||
      normalizedStatus === 'build_success'
    ) {
      return STATUS_COLORS.success;
    }
    if (normalizedStatus === 'crashed') {
      return STATUS_COLORS.failed;
    }
    return '#8c8c8c';
  };

  // Format display status
  const formatStatus = (status: string): string => {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Build data items for list
  const listData: ListItem[] = useMemo(() => {
    const items: ListItem[] = [
      {
        key: 'notes',
        label: 'Notes',
        value: notes ? (
          <Paragraph
            className='overview-notes'
            ellipsis={{ rows: 2, expandable: true }}
          >
            {notes}
          </Paragraph>
        ) : (
          <Button
            type='text'
            size='small'
            className='overview-add-notes'
            onClick={onEditNotes}
          >
            What makes this run special?
          </Button>
        ),
      },
      {
        key: 'tags',
        label: 'Tags',
        value: (
          <Space wrap size={4}>
            {tags.map((tag, index) => (
              <Tag key={index} color='blue'>
                {tag}
              </Tag>
            ))}
            <Button
              type='text'
              size='small'
              icon={<PlusOutlined />}
              onClick={onAddTag}
              className='overview-add-tag-btn'
            />
          </Space>
        ),
      },
      {
        key: 'author',
        label: 'Author',
        value: (
          <Space size={8}>
            <UserOutlined style={{ color: '#8c8c8c' }} />
            <Text>{author || '-'}</Text>
          </Space>
        ),
      },
      {
        key: 'state',
        label: 'State',
        value: (
          <div className='overview-status'>
            <span
              className='overview-status-dot'
              style={{ backgroundColor: getStatusColor(state) }}
            />
            <span style={{ color: getStatusColor(state) }}>
              {formatStatus(state)}
            </span>
          </div>
        ),
      },
      {
        key: 'startTime',
        label: 'Start time',
        value: (
          <Text>
            {startTime
              ? dayjs(startTime).format('MMMM D, YYYY h:mm:ss A')
              : '-'}
          </Text>
        ),
      },
      {
        key: 'runtime',
        label: 'Runtime',
        value: <Text>{runtime || '-'}</Text>,
      },
    ];

    // Add additional entity-specific fields
    additionalFields.forEach((field, index) => {
      items.push({
        key: `additional-${index}`,
        label: field.label,
        value: field.isCommand ? (
          <pre className='overview-command-value'>{field.value}</pre>
        ) : (
          field.value
        ),
        isCommand: field.isCommand,
      });
    });

    // Add timestamps
    items.push({
      key: 'created',
      label: 'Created',
      value: (
        <Text type='secondary'>
          {dayjs(createdAt).format('YYYY-MM-DD HH:mm:ss')}
        </Text>
      ),
    });

    if (updatedAt) {
      items.push({
        key: 'updated',
        label: 'Updated',
        value: (
          <Text type='secondary'>
            {dayjs(updatedAt).format('YYYY-MM-DD HH:mm:ss')}
          </Text>
        ),
      });
    }

    return items;
  }, [
    notes,
    tags,
    author,
    state,
    startTime,
    runtime,
    createdAt,
    updatedAt,
    additionalFields,
    onAddTag,
    onEditNotes,
  ]);

  // Render list item
  const renderItem = (item: ListItem) => (
    <List.Item
      className={`overview-list-item ${item.isCommand ? 'command-item' : ''}`}
    >
      <div className='overview-list-key'>{item.label}</div>
      <div className='overview-list-value'>{item.value}</div>
    </List.Item>
  );

  // Check if we should show the two-column section
  const hasConfig = config && Object.keys(config).length > 0;
  const hasGroundTruth = groundTruth && groundTruth.length > 0;
  const showTwoColumnSection = hasConfig || hasGroundTruth;

  return (
    <div className='overview-tab'>
      {/* Key-value list section */}
      <List
        className='overview-list'
        itemLayout='horizontal'
        dataSource={listData}
        split={false}
        renderItem={renderItem}
      />

      {/* Two-column section: Config + Ground Truth (only for injections) */}
      {showTwoColumnSection && (
        <div className='overview-two-column-section'>
          <Row gutter={24}>
            {/* Left column: Config JSON tree */}
            {hasConfig && (
              <Col xs={24} lg={hasGroundTruth ? 12 : 24}>
                <ConfigTree config={config} />
              </Col>
            )}

            {/* Right column: Ground Truth table */}
            {hasGroundTruth && (
              <Col xs={24} lg={hasConfig ? 12 : 24}>
                <GroundTruthTable groundTruth={groundTruth} />
              </Col>
            )}
          </Row>
        </div>
      )}
    </div>
  );
};

export default OverviewTab;
