import {
  BarChartOutlined,
  DownloadOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import {
  Badge,
  Button,
  Card,
  Empty,
  Progress,
  Space,
  Table,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';

const { Text } = Typography;

// Flexible types to match API responses
export interface DetectorResult {
  span_name?: string;
  anomaly_type?: string;
  normal_avg_latency?: number;
  abnormal_avg_latency?: number;
  normal_success_rate?: number;
  abnormal_success_rate?: number;
  [key: string]: unknown;
}

export interface GranularityResult {
  rank?: number;
  result?: string;
  level?: string;
  confidence?: number;
  [key: string]: unknown;
}

interface ArtifactsTabProps {
  detectorResults?: DetectorResult[];
  granularityResults?: GranularityResult[];
  loading?: boolean;
  onViewGranularity?: (result: GranularityResult) => void;
  onDownload?: () => void;
}

/**
 * Artifacts tab component - Execution-specific outputs
 */
const ArtifactsTab: React.FC<ArtifactsTabProps> = ({
  detectorResults = [],
  granularityResults = [],
  loading = false,
  onViewGranularity,
  onDownload,
}) => {
  // Detector Results Table columns
  const detectorColumns: ColumnsType<DetectorResult> = [
    {
      title: 'Span Name',
      dataIndex: 'span_name',
      key: 'span_name',
      width: '25%',
      ellipsis: true,
      render: (value?: string) => value || '-',
    },
    {
      title: 'Anomaly Type',
      dataIndex: 'anomaly_type',
      key: 'anomaly_type',
      width: '15%',
      render: (type?: string) =>
        type ? (
          <Badge
            color={type === 'latency' ? '#faad14' : '#f5222d'}
            text={type}
          />
        ) : (
          '-'
        ),
    },
    {
      title: 'Normal Avg Latency',
      dataIndex: 'normal_avg_latency',
      key: 'normal_avg_latency',
      width: '15%',
      render: (value?: number) =>
        value !== undefined ? `${value.toFixed(2)}ms` : '-',
    },
    {
      title: 'Abnormal Avg Latency',
      dataIndex: 'abnormal_avg_latency',
      key: 'abnormal_avg_latency',
      width: '15%',
      render: (value?: number) =>
        value !== undefined ? `${value.toFixed(2)}ms` : '-',
    },
    {
      title: 'Normal Success Rate',
      dataIndex: 'normal_success_rate',
      key: 'normal_success_rate',
      width: '15%',
      render: (value?: number) =>
        value !== undefined ? `${(value * 100).toFixed(1)}%` : '-',
    },
    {
      title: 'Abnormal Success Rate',
      dataIndex: 'abnormal_success_rate',
      key: 'abnormal_success_rate',
      width: '15%',
      render: (value?: number) =>
        value !== undefined ? `${(value * 100).toFixed(1)}%` : '-',
    },
  ];

  // Granularity Results Table columns
  const granularityColumns: ColumnsType<GranularityResult> = [
    {
      title: 'Rank',
      dataIndex: 'rank',
      key: 'rank',
      width: '10%',
      render: (rank?: number) =>
        rank !== undefined ? (
          <Badge
            count={rank}
            style={{
              backgroundColor:
                rank === 1 ? '#10b981' : rank === 2 ? '#f59e0b' : '#6b7280',
            }}
          />
        ) : (
          '-'
        ),
    },
    {
      title: 'Result',
      dataIndex: 'result',
      key: 'result',
      width: '40%',
      ellipsis: true,
      render: (value?: string) => value || '-',
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      width: '15%',
      render: (level?: string) => level || '-',
    },
    {
      title: 'Confidence',
      dataIndex: 'confidence',
      key: 'confidence',
      width: '20%',
      render: (confidence?: number) =>
        confidence !== undefined ? (
          <Progress
            percent={Math.round(confidence * 100)}
            size='small'
            strokeColor={
              confidence >= 0.8
                ? '#10b981'
                : confidence >= 0.5
                  ? '#f59e0b'
                  : '#ef4444'
            }
            format={(percent) => `${percent}%`}
          />
        ) : (
          '-'
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '15%',
      render: (_: unknown, record: GranularityResult) =>
        onViewGranularity ? (
          <Button
            type='link'
            icon={<EyeOutlined />}
            onClick={() => onViewGranularity(record)}
          >
            View
          </Button>
        ) : null,
    },
  ];

  const hasDetectorResults = detectorResults.length > 0;
  const hasGranularityResults = granularityResults.length > 0;

  if (!hasDetectorResults && !hasGranularityResults) {
    return (
      <div className='artifacts-tab-empty'>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description='No artifacts available for this execution'
        />
      </div>
    );
  }

  return (
    <div className='artifacts-tab'>
      <Space direction='vertical' style={{ width: '100%' }} size='large'>
        {/* Detector Results */}
        {hasDetectorResults && (
          <Card
            title='Anomaly Detection Results'
            extra={
              onDownload && (
                <Button icon={<DownloadOutlined />} onClick={onDownload}>
                  Export
                </Button>
              )
            }
          >
            <Table
              rowKey={(record, index) => record.span_name || String(index)}
              columns={detectorColumns}
              dataSource={detectorResults}
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
              }}
              size='middle'
            />
          </Card>
        )}

        {/* Granularity Results */}
        {hasGranularityResults && (
          <Card
            title='Granularity Results'
            extra={<Button icon={<BarChartOutlined />}>View Chart</Button>}
          >
            <Table
              rowKey={(record, index) =>
                record.rank !== undefined ? String(record.rank) : String(index)
              }
              columns={granularityColumns}
              dataSource={granularityResults}
              loading={loading}
              pagination={false}
              size='middle'
            />
          </Card>
        )}

        {/* Empty state */}
        {!hasDetectorResults && !hasGranularityResults && (
          <Empty description='No artifact data available'>
            <Text type='secondary'>
              Artifacts will be available once the execution completes.
            </Text>
          </Empty>
        )}
      </Space>
    </div>
  );
};

export default ArtifactsTab;
