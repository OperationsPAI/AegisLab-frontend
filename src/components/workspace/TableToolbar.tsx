/**
 * TableToolbar - W&B-style table toolbar
 *
 * Provides search, filter, sort, group, and column management functionality.
 * Also shows bulk action buttons (Tag, Move to project, Delete) when rows are selected.
 */
import type React from 'react';

import {
  ArrowLeftOutlined,
  ColumnHeightOutlined,
  DeleteOutlined,
  DownloadOutlined,
  FilterOutlined,
  FolderOutlined,
  PlusOutlined,
  SettingOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import { Button, Input, Space, Tooltip } from 'antd';

import type { ColumnConfig, SortField } from '@/types/workspace';

import GroupDropdown from './GroupDropdown';
import SortDropdown from './SortDropdown';

import './TableToolbar.css';

interface TableToolbarProps {
  title: string;
  total: number;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  // Back to workspace button
  onBackClick?: () => void;
  backTooltip?: string;
  // Filter (still callback-based for now)
  onFilterClick?: () => void;
  // Group dropdown
  columns?: ColumnConfig[];
  groupBy?: string | null;
  onGroupChange?: (field: string | null) => void;
  // Sort dropdown
  sortFields?: SortField[];
  onSortFieldsChange?: (fields: SortField[]) => void;
  defaultSortField?: string;
  defaultSortOrder?: 'asc' | 'desc';
  // Column management
  onColumnsClick?: () => void;
  onExportClick?: () => void;
  onSettingsClick?: () => void;
  // New button
  onNewClick?: () => void;
  newButtonText?: string;
  // Collapse
  showCollapse?: boolean;
  collapsed?: boolean;
  onCollapseToggle?: () => void;
  // Extra content
  extra?: React.ReactNode;
  // Bulk actions (shown when items selected)
  selectedCount?: number;
  onBulkTag?: () => void;
  onBulkMoveToProject?: () => void;
  onBulkDelete?: () => void;
}

const TableToolbar: React.FC<TableToolbarProps> = ({
  title,
  total,
  searchPlaceholder = 'Search...',
  searchValue,
  onSearchChange,
  onBackClick,
  backTooltip = 'Back to Workspace',
  onFilterClick,
  columns,
  groupBy,
  onGroupChange,
  sortFields,
  onSortFieldsChange,
  defaultSortField,
  defaultSortOrder,
  onColumnsClick,
  onExportClick,
  onSettingsClick,
  onNewClick,
  newButtonText = 'New',
  showCollapse = true,
  collapsed = false,
  onCollapseToggle,
  extra,
  selectedCount = 0,
  onBulkTag,
  onBulkMoveToProject,
  onBulkDelete,
}) => {
  // Check if dropdowns should be shown
  const showGroupDropdown = columns && onGroupChange;
  const showSortDropdown = columns && sortFields && onSortFieldsChange;
  const hasSelection = selectedCount > 0;

  return (
    <div className='table-toolbar'>
      {/* Header with title and collapse */}
      <div className='table-toolbar-header'>
        <div className='table-toolbar-title'>
          {onBackClick && (
            <Tooltip title={backTooltip}>
              <Button
                type='text'
                size='small'
                icon={<ArrowLeftOutlined />}
                onClick={onBackClick}
                style={{ marginRight: 8 }}
              />
            </Tooltip>
          )}
          <span className='title-text'>{title}</span>
          <span className='title-count'>{total}</span>
        </div>
        {showCollapse && (
          <Button
            type='text'
            size='small'
            icon={<ColumnHeightOutlined rotate={collapsed ? 0 : 180} />}
            onClick={onCollapseToggle}
            className='collapse-button'
          />
        )}
      </div>

      {/* Search bar */}
      <div className='table-toolbar-search'>
        <Input.Search
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          allowClear
          className='search-input'
        />
      </div>

      {/* Action buttons */}
      <div className='table-toolbar-actions'>
        <div className='actions-left'>
          <Space size='small'>
            {onFilterClick && (
              <Tooltip title='Filter'>
                <Button
                  icon={<FilterOutlined />}
                  onClick={onFilterClick}
                  className='action-button'
                >
                  Filter
                </Button>
              </Tooltip>
            )}
            {showGroupDropdown && (
              <GroupDropdown
                columns={columns}
                groupBy={groupBy ?? null}
                onGroupChange={onGroupChange}
              />
            )}
            {showSortDropdown && (
              <SortDropdown
                columns={columns}
                sortFields={sortFields}
                onSortChange={onSortFieldsChange}
                defaultSortField={defaultSortField}
                defaultSortOrder={defaultSortOrder}
              />
            )}

            {/* Bulk action buttons - shown when items are selected */}
            {hasSelection && onBulkTag && (
              <Button
                icon={<TagsOutlined />}
                onClick={onBulkTag}
                className='action-button bulk-action-button'
              >
                Tag
              </Button>
            )}
            {hasSelection && onBulkMoveToProject && (
              <Button
                icon={<FolderOutlined />}
                onClick={onBulkMoveToProject}
                className='action-button bulk-action-button'
              >
                Move to project
              </Button>
            )}
            {hasSelection && onBulkDelete && (
              <Button
                icon={<DeleteOutlined />}
                onClick={onBulkDelete}
                className='action-button bulk-action-button bulk-action-delete'
              >
                Delete
              </Button>
            )}

            {onNewClick && (
              <Button
                type='primary'
                icon={<PlusOutlined />}
                onClick={onNewClick}
                className='new-button'
              >
                {newButtonText}
              </Button>
            )}
          </Space>
        </div>

        <div className='actions-right'>
          <Space size='small'>
            {extra}
            {onExportClick && (
              <Tooltip title='Export CSV'>
                <Button
                  type='text'
                  icon={<DownloadOutlined />}
                  onClick={onExportClick}
                  className='icon-button'
                />
              </Tooltip>
            )}
            {onSettingsClick && (
              <Tooltip title='Settings'>
                <Button
                  type='text'
                  icon={<SettingOutlined />}
                  onClick={onSettingsClick}
                  className='icon-button'
                />
              </Tooltip>
            )}
            {onColumnsClick && (
              <Tooltip title='Manage Columns'>
                <Button onClick={onColumnsClick} className='columns-button'>
                  Columns
                </Button>
              </Tooltip>
            )}
          </Space>
        </div>
      </div>
    </div>
  );
};

export default TableToolbar;
