/**
 * GroupDropdown - W&B-style group by field selector
 *
 * A popover dropdown that allows selecting a field to group table rows by.
 */
import { type FC, useState } from 'react';

import { GroupOutlined } from '@ant-design/icons';
import { Button, Popover, Select, Tooltip, Typography } from 'antd';

import type { ColumnConfig } from '@/types/workspace';

import './GroupDropdown.css';

const { Text } = Typography;

interface GroupDropdownProps {
  columns: ColumnConfig[];
  groupBy: string | null;
  onGroupChange: (field: string | null) => void;
  /** Show only icon without text label */
  iconOnly?: boolean;
}

const GroupDropdown: FC<GroupDropdownProps> = ({
  columns = [],
  groupBy,
  onGroupChange,
  iconOnly = false,
}) => {
  const [open, setOpen] = useState(false);

  // Filter columns that can be grouped (text, status, user types)
  const groupableColumns = (columns || []).filter(
    (col) =>
      col.type === 'text' ||
      col.type === 'status' ||
      col.type === 'user' ||
      col.type === 'tags'
  );

  // Build options for select
  const options = groupableColumns.map((col) => ({
    value: col.dataIndex,
    label: col.title,
  }));

  const handleChange = (value: string | undefined) => {
    onGroupChange(value || null);
  };

  const content = (
    <div className='group-dropdown-content'>
      <Text className='group-dropdown-header'>Group runs by...</Text>
      <Select
        className='group-dropdown-select'
        placeholder='Select field...'
        value={groupBy || undefined}
        onChange={handleChange}
        allowClear
        showSearch
        optionFilterProp='label'
        options={options}
        notFoundContent='No groupable columns'
      />
    </div>
  );

  const button = (
    <Button
      icon={<GroupOutlined />}
      className={`action-button ${groupBy ? 'active' : ''}`}
      type={iconOnly ? 'text' : 'default'}
      size={iconOnly ? 'small' : 'middle'}
    >
      {!iconOnly && 'Group'}
    </Button>
  );

  return (
    <Popover
      content={content}
      trigger='click'
      placement='bottomLeft'
      open={open}
      onOpenChange={setOpen}
      overlayClassName='group-dropdown-popover'
    >
      {iconOnly ? <Tooltip title='Group'>{button}</Tooltip> : button}
    </Popover>
  );
};

export default GroupDropdown;
