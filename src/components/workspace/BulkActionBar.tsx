/**
 * BulkActionBar - W&B-style action bar that appears when rows are selected
 *
 * Shows bulk operation buttons in toolbar style:
 * - Tag
 * - Move to group
 * - Move to project
 * - Delete
 */
import {
  CloseOutlined,
  DeleteOutlined,
  FolderOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import { Button, Checkbox, Space, Typography } from 'antd';

import './BulkActionBar.css';

const { Text } = Typography;

export interface BulkActionBarProps {
  selectedCount: number;
  onDelete?: () => void;
  onAddTags?: () => void;
  onMoveToProject?: () => void;
  onClearSelection: () => void;
}

const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  onDelete,
  onAddTags,
  onMoveToProject,
  onClearSelection,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className='bulk-action-bar'>
      {/* Left side: selection count */}
      <div className='bulk-action-left'>
        <Checkbox checked indeterminate={false} />
        <Text strong className='bulk-action-count'>
          {selectedCount} selected
        </Text>
      </div>

      {/* Center: action buttons (W&B style) */}
      <Space className='bulk-action-buttons' size={4}>
        {onAddTags && (
          <Button
            type='text'
            size='small'
            icon={<TagsOutlined />}
            onClick={onAddTags}
            className='bulk-action-btn'
          >
            Tag
          </Button>
        )}
        {onMoveToProject && (
          <Button
            type='text'
            size='small'
            icon={<FolderOutlined />}
            onClick={onMoveToProject}
            className='bulk-action-btn'
          >
            Move to project
          </Button>
        )}
        {onDelete && (
          <Button
            type='text'
            size='small'
            icon={<DeleteOutlined />}
            onClick={onDelete}
            className='bulk-action-btn bulk-action-btn-delete'
          >
            Delete
          </Button>
        )}
      </Space>

      {/* Right side: clear button */}
      <Button
        type='text'
        size='small'
        icon={<CloseOutlined />}
        onClick={onClearSelection}
        className='bulk-action-clear'
      >
        Clear
      </Button>
    </div>
  );
};

export default BulkActionBar;
