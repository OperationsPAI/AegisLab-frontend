import { useMemo, useState } from 'react';

import {
  DownloadOutlined,
  FileOutlined,
  FolderOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Button, Empty, Input, Space, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Text } = Typography;

export interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  modifiedAt?: string;
}

interface FilesTabProps {
  files: FileItem[];
  loading?: boolean;
  onDownload?: (file: FileItem) => void;
  onNavigate?: (path: string) => void;
}

/**
 * Files tab component - File browser
 */
const FilesTab: React.FC<FilesTabProps> = ({
  files,
  loading = false,
  onDownload,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Format file size
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)}GB`;
  };

  // Filter files based on search query
  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return files;
    const query = searchQuery.toLowerCase();
    return files.filter((file) => file.name.toLowerCase().includes(query));
  }, [files, searchQuery]);

  // Table columns
  const columns: ColumnsType<FileItem> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: FileItem) => (
        <Space>
          {record.type === 'directory' ? (
            <FolderOutlined style={{ color: '#faad14' }} />
          ) : (
            <FileOutlined style={{ color: '#8c8c8c' }} />
          )}
          {record.type === 'directory' && onNavigate ? (
            <Button
              type='link'
              onClick={() => onNavigate(record.path)}
              style={{ padding: 0 }}
            >
              {name}
            </Button>
          ) : (
            <Text>{name}</Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Modified',
      dataIndex: 'modifiedAt',
      key: 'modifiedAt',
      width: 200,
      render: (date?: string) => (
        <Text type='secondary'>{date ? dayjs(date).fromNow() : '-'}</Text>
      ),
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      width: 120,
      align: 'right',
      render: (size?: number) => (
        <Text type='secondary'>{formatFileSize(size)}</Text>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_: unknown, record: FileItem) =>
        record.type === 'file' && onDownload ? (
          <Button
            type='text'
            icon={<DownloadOutlined />}
            onClick={() => onDownload(record)}
            title='Download'
          />
        ) : null,
    },
  ];

  if (!files || files.length === 0) {
    return (
      <div className='files-tab-empty'>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description='No files available for this run'
        />
      </div>
    );
  }

  return (
    <div className='files-tab'>
      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder='Search files...'
          prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: 300 }}
          allowClear
        />
      </div>

      {/* Current path */}
      <div style={{ marginBottom: 12 }}>
        <Text type='secondary'>&gt; root</Text>
      </div>

      {/* File table */}
      <Table
        columns={columns}
        dataSource={filteredFiles}
        rowKey='path'
        loading={loading}
        pagination={false}
        size='middle'
      />
    </div>
  );
};

export default FilesTab;
