/**
 * NameColumnDropdown - W&B-style dropdown for NAME column header
 *
 * Provides visibility control options:
 * - Make all visible
 * - Make all hidden
 * - Only show visualized (toggle)
 * - Select visible runs
 */
import type { Key, ReactNode } from 'react';

import {
  CheckSquareOutlined,
  DownOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { Dropdown, type MenuProps, Switch, Typography } from 'antd';

import './NameColumnDropdown.css';

const { Text } = Typography;

export interface NameColumnDropdownProps {
  visualizedRowKeys: Key[];
  dataSource: Array<{ id: Key }>;
  onVisualizeChange?: (keys: Key[]) => void;
  onSelectChange?: (keys: Key[]) => void;
  showOnlyVisualized: boolean;
  onShowOnlyVisualizedChange: (show: boolean) => void;
  visualizedCount: number;
  children: ReactNode;
}

const NameColumnDropdown: React.FC<NameColumnDropdownProps> = ({
  visualizedRowKeys,
  dataSource,
  onVisualizeChange,
  onSelectChange,
  showOnlyVisualized,
  onShowOnlyVisualizedChange,
  visualizedCount,
  children,
}) => {
  const menuItems: MenuProps['items'] = [
    {
      key: 'make-all-visible',
      icon: <EyeOutlined />,
      label: 'Make all visible',
      onClick: () => onVisualizeChange?.(dataSource.map((d) => d.id)),
    },
    {
      key: 'make-all-hidden',
      icon: <EyeInvisibleOutlined />,
      label: 'Make all hidden',
      onClick: () => onVisualizeChange?.([]),
    },
    { type: 'divider' },
    {
      key: 'only-show-visualized',
      label: (
        <div
          className='dropdown-item-with-toggle'
          onClick={(e) => e.stopPropagation()}
        >
          <span>Only show visualized</span>
          <Switch
            size='small'
            checked={showOnlyVisualized}
            onChange={(checked) => onShowOnlyVisualizedChange(checked)}
          />
        </div>
      ),
    },
    { type: 'divider' },
    {
      key: 'select-visible',
      icon: <CheckSquareOutlined />,
      label: 'Select visible runs',
      onClick: () => onSelectChange?.(visualizedRowKeys),
      disabled: !onSelectChange,
    },
  ];

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={['click']}
      placement='bottomLeft'
    >
      <div className='name-column-header'>
        <EyeOutlined className='visualized-icon' />
        <span className='column-title'>{children}</span>
        <Text type='secondary' className='visualized-count'>
          {visualizedCount} visualized
        </Text>
        <DownOutlined className='dropdown-arrow' />
      </div>
    </Dropdown>
  );
};

export default NameColumnDropdown;
