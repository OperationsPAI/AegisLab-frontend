/**
 * ColumnsDropdown - W&B-style column selector (compact version)
 *
 * A popover dropdown that allows quick show/hide of columns.
 * For full column management, use ColumnManager modal.
 */
import { type FC, useMemo, useState } from 'react';

import { SettingOutlined } from '@ant-design/icons';
import { Button, Checkbox, Popover, Tooltip, Typography } from 'antd';

import type { ColumnConfig } from '@/types/workspace';

import './ColumnsDropdown.css';

const { Text } = Typography;

interface ColumnsDropdownProps {
  columns: ColumnConfig[];
  onColumnsChange: (columns: ColumnConfig[]) => void;
  /** Show only icon without text label */
  iconOnly?: boolean;
}

const ColumnsDropdown: FC<ColumnsDropdownProps> = ({
  columns = [],
  onColumnsChange,
  iconOnly = false,
}) => {
  const [open, setOpen] = useState(false);

  // Separate columns by visibility
  const sortedColumns = useMemo(
    () => [...(columns || [])].sort((a, b) => a.order - b.order),
    [columns]
  );

  // Count visible columns
  const visibleCount = useMemo(
    () => (columns || []).filter((col) => col.visible).length,
    [columns]
  );

  // Toggle column visibility
  const handleToggle = (key: string) => {
    const col = columns.find((c) => c.key === key);
    if (col?.locked) return;

    onColumnsChange(
      columns.map((c) => (c.key === key ? { ...c, visible: !c.visible } : c))
    );
  };

  // Show all columns
  const handleShowAll = () => {
    onColumnsChange(columns.map((c) => ({ ...c, visible: true })));
  };

  // Hide all except locked
  const handleHideAll = () => {
    onColumnsChange(
      columns.map((c) => (c.locked ? c : { ...c, visible: false }))
    );
  };

  const content = (
    <div className='columns-dropdown-content'>
      <div className='columns-dropdown-header'>
        <Text className='columns-dropdown-title'>Columns</Text>
        <div className='columns-dropdown-actions'>
          <Button type='link' size='small' onClick={handleShowAll}>
            Show all
          </Button>
          <Button type='link' size='small' onClick={handleHideAll}>
            Hide all
          </Button>
        </div>
      </div>
      <div className='columns-dropdown-list'>
        {sortedColumns.map((col) => (
          <div
            key={col.key}
            className={`columns-dropdown-item ${col.locked ? 'locked' : ''}`}
            onClick={() => !col.locked && handleToggle(col.key)}
          >
            <Checkbox checked={col.visible} disabled={col.locked} />
            <span className='columns-dropdown-item-title'>{col.title}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const hasActiveColumns = visibleCount < columns.length;

  const button = (
    <Button
      icon={<SettingOutlined />}
      className={`action-button ${hasActiveColumns ? 'active' : ''}`}
      type={iconOnly ? 'text' : 'default'}
      size={iconOnly ? 'small' : 'middle'}
    >
      {!iconOnly && 'Columns'}
    </Button>
  );

  return (
    <Popover
      content={content}
      trigger='click'
      placement='bottomLeft'
      open={open}
      onOpenChange={setOpen}
      classNames={{ root: 'columns-dropdown-popover' }}
    >
      {iconOnly ? <Tooltip title='Columns'>{button}</Tooltip> : button}
    </Popover>
  );
};

export default ColumnsDropdown;
