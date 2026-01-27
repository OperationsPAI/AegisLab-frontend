/**
 * RunListDropdown - W&B-style dropdown for run list header
 *
 * Provides options for:
 * - Sorting order (Ascending/Descending)
 * - Run colors (Randomize)
 * - Run name cropping (End/Middle/Beginning)
 *
 * Used in both RunsPanel sidebar and WorkspaceTable NAME column header
 */
import { type ReactNode, useMemo } from 'react';

import {
  BgColorsOutlined,
  EyeOutlined,
  ScissorOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
} from '@ant-design/icons';
import { Dropdown, type MenuProps } from 'antd';

import type { RunNameCropMode } from '@/types/workspace';

import './NameColumnDropdown.css';

export interface RunListDropdownProps {
  /** Number of visualized (visible) runs */
  visualizedCount: number;
  /** Current sort order */
  sortOrder: 'asc' | 'desc';
  /** Current crop mode */
  cropMode: RunNameCropMode;
  /** Callback when sort order changes */
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  /** Callback when crop mode changes */
  onCropModeChange: (mode: RunNameCropMode) => void;
  /** Callback to randomize colors */
  onRandomizeColors: () => void;
  /** Optional children to render instead of default header */
  children?: ReactNode;
  /** Optional additional menu items */
  extraMenuItems?: MenuProps['items'];
  /** Optional header label (defaults to "NAME") */
  headerLabel?: string;
}

/**
 * Crop mode labels for display
 */
const CROP_MODE_LABELS: Record<RunNameCropMode, string> = {
  end: 'End (default)',
  middle: 'Middle',
  beginning: 'Beginning',
};

/**
 * RunListDropdown component
 *
 * @example
 * ```tsx
 * // In RunsPanel
 * <RunListDropdown
 *   visualizedCount={5}
 *   sortOrder="desc"
 *   cropMode="end"
 *   onSortOrderChange={(order) => setSortOrder(order)}
 *   onCropModeChange={(mode) => setCropMode(mode)}
 *   onRandomizeColors={() => randomizeColors()}
 * />
 *
 * // In WorkspaceTable (with children override)
 * <RunListDropdown
 *   visualizedCount={5}
 *   sortOrder={sortOrder}
 *   cropMode={cropMode}
 *   onSortOrderChange={handleSortOrderChange}
 *   onCropModeChange={handleCropModeChange}
 *   onRandomizeColors={handleRandomizeColors}
 * >
 *   <span>NAME</span>
 * </RunListDropdown>
 * ```
 */
const RunListDropdown: React.FC<RunListDropdownProps> = ({
  visualizedCount,
  sortOrder,
  cropMode,
  onSortOrderChange,
  onCropModeChange,
  onRandomizeColors,
  children,
  extraMenuItems,
  headerLabel = 'NAME',
}) => {
  // Build menu items
  const menuItems: MenuProps['items'] = useMemo(() => {
    const items: MenuProps['items'] = [
      // Sorting order section
      {
        key: 'sort-header',
        type: 'group',
        label: 'Sorting order',
        children: [
          {
            key: 'sort-asc',
            icon: <SortAscendingOutlined />,
            label: 'Ascending',
            onClick: () => onSortOrderChange('asc'),
            className:
              sortOrder === 'asc' ? 'ant-dropdown-menu-item-selected' : '',
          },
          {
            key: 'sort-desc',
            icon: <SortDescendingOutlined />,
            label: 'Descending',
            onClick: () => onSortOrderChange('desc'),
            className:
              sortOrder === 'desc' ? 'ant-dropdown-menu-item-selected' : '',
          },
        ],
      },
      { type: 'divider' },
      // Run colors section
      {
        key: 'colors-header',
        type: 'group',
        label: 'Run colors',
        children: [
          {
            key: 'randomize-colors',
            icon: <BgColorsOutlined />,
            label: 'Randomize',
            onClick: onRandomizeColors,
          },
        ],
      },
      { type: 'divider' },
      // Run name cropping section
      {
        key: 'crop-header',
        type: 'group',
        label: 'Run name cropping',
        children: [
          {
            key: 'crop-end',
            icon: <ScissorOutlined />,
            label: CROP_MODE_LABELS.end,
            onClick: () => onCropModeChange('end'),
            className:
              cropMode === 'end' ? 'ant-dropdown-menu-item-selected' : '',
          },
          {
            key: 'crop-middle',
            icon: <ScissorOutlined />,
            label: CROP_MODE_LABELS.middle,
            onClick: () => onCropModeChange('middle'),
            className:
              cropMode === 'middle' ? 'ant-dropdown-menu-item-selected' : '',
          },
          {
            key: 'crop-beginning',
            icon: <ScissorOutlined />,
            label: CROP_MODE_LABELS.beginning,
            onClick: () => onCropModeChange('beginning'),
            className:
              cropMode === 'beginning' ? 'ant-dropdown-menu-item-selected' : '',
          },
        ],
      },
    ];

    // Add extra menu items if provided
    if (extraMenuItems && extraMenuItems.length > 0) {
      items.push({ type: 'divider' });
      items.push(...extraMenuItems);
    }

    return items;
  }, [
    sortOrder,
    cropMode,
    onSortOrderChange,
    onCropModeChange,
    onRandomizeColors,
    extraMenuItems,
  ]);

  // Default header content
  const defaultHeader = (
    <div className='name-column-header'>
      <EyeOutlined className='visualized-icon' />
      <span className='column-title'>{headerLabel}</span>
      <span className='visualized-badge'>{visualizedCount} visualized</span>
      <span className='dropdown-ellipsis'>⋮</span>
    </div>
  );

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={['click']}
      placement='bottomLeft'
    >
      {children || defaultHeader}
    </Dropdown>
  );
};

export default RunListDropdown;
