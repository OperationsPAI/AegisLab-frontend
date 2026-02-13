/**
 * ColumnHeaderDropdown - W&B-style column header context menu
 *
 * A dropdown menu that appears on column headers with options to
 * pin, hide, and sort by the column.
 */
import { type FC, type ReactNode, useState } from 'react';

import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CheckOutlined,
  CopyOutlined,
  EllipsisOutlined,
  EyeInvisibleOutlined,
  PushpinFilled,
  PushpinOutlined,
} from '@ant-design/icons';
import { Dropdown, type MenuProps, message, Tooltip } from 'antd';

import type { ColumnConfig } from '@/types/workspace';

import './ColumnHeaderDropdown.css';

interface ColumnHeaderDropdownProps {
  column: ColumnConfig;
  currentSortField?: string;
  currentSortOrder?: 'asc' | 'desc';
  onPin: (columnKey: string) => void;
  onHide: (columnKey: string) => void;
  onSort: (columnKey: string, order: 'asc' | 'desc') => void;
  children: ReactNode;
}

const ColumnHeaderDropdown: FC<ColumnHeaderDropdownProps> = ({
  column,
  currentSortField,
  currentSortOrder,
  onPin,
  onHide,
  onSort,
  children,
}) => {
  const [open, setOpen] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(String(children));
      message.success('Copied to clipboard');
    } catch (err) {
      message.error('Failed to copy');
    }
  };

  const tooltipContent = (
    <div className='column-header-tooltip'>
      <CopyOutlined className='tooltip-copy-icon' onClick={handleCopy} />
      <span className='tooltip-text'>{children}</span>
    </div>
  );

  const isCurrentSortField = currentSortField === column.dataIndex;
  const isAscActive = isCurrentSortField && currentSortOrder === 'asc';
  const isDescActive = isCurrentSortField && currentSortOrder === 'desc';
  const canSort = column.sortable !== false;
  const canHide = !column.locked;

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    switch (key) {
      case 'pin':
        onPin(column.key);
        break;
      case 'hide':
        if (canHide) {
          onHide(column.key);
        }
        break;
      case 'sort_asc':
        if (canSort) {
          onSort(column.key, 'asc');
        }
        break;
      case 'sort_desc':
        if (canSort) {
          onSort(column.key, 'desc');
        }
        break;
    }
    setOpen(false);
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'pin',
      icon: column.pinned ? <PushpinFilled /> : <PushpinOutlined />,
      label: column.pinned ? 'Unpin column' : 'Pin column',
    },
    {
      key: 'hide',
      icon: <EyeInvisibleOutlined />,
      label: 'Hide column',
      disabled: !canHide,
      title: !canHide ? 'This column cannot be hidden' : undefined,
    },
    {
      type: 'divider',
    },
    {
      key: 'sort_group',
      type: 'group',
      label: 'Sorting order',
      children: [
        {
          key: 'sort_asc',
          icon: isAscActive ? <CheckOutlined /> : <ArrowUpOutlined />,
          label: 'Ascending',
          disabled: !canSort,
          className: isAscActive ? 'sort-active' : '',
        },
        {
          key: 'sort_desc',
          icon: isDescActive ? <CheckOutlined /> : <ArrowDownOutlined />,
          label: 'Descending',
          disabled: !canSort,
          className: isDescActive ? 'sort-active' : '',
        },
      ],
    },
  ];

  return (
    <div className={`column-header-dropdown-trigger ${open ? 'open' : ''}`}>
      <Tooltip
        title={tooltipContent}
        placement='bottomLeft'
        align={{ offset: [-8, 4], targetOffset: [0, 0] }}
        classNames={{ root: 'column-header-tooltip-overlay' }}
        mouseEnterDelay={0.3}
      >
        <span className='column-header-title'>{children}</span>
      </Tooltip>
      <Dropdown
        menu={{ items: menuItems, onClick: handleMenuClick }}
        trigger={['click']}
        placement='bottomLeft'
        open={open}
        onOpenChange={setOpen}
        classNames={{ root: 'column-header-dropdown-menu' }}
      >
        <EllipsisOutlined
          className='column-menu-icon'
          onClick={(e) => e.stopPropagation()}
        />
      </Dropdown>
    </div>
  );
};

export default ColumnHeaderDropdown;
