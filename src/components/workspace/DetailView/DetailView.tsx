import { useState } from 'react';

import { Spin, Tabs } from 'antd';

import WorkspacePageHeader from '../WorkspacePageHeader';

import DetailViewHeader from './DetailViewHeader';

import './DetailView.css';

export type EntityType = 'injection' | 'execution';

export interface DetailViewAction {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

export interface DetailViewTab {
  key: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
  hidden?: boolean;
}

export interface DetailViewProps {
  // Entity info
  entityType: EntityType;
  title: string;
  status: string;
  statusColor: string;
  loading?: boolean;

  // Workspace header props
  workspaceName?: string;
  workspaceType?: 'personal' | 'team';
  lastSaved?: string;

  // Navigation
  onBack: () => void;
  backLabel?: string;

  // Actions
  actions?: DetailViewAction[];

  // Tabs
  tabs: DetailViewTab[];
  defaultActiveTab?: string;
}

/**
 * Shared DetailView component for Injection/Execution detail pages
 * Layout: WorkspacePageHeader + DetailViewHeader + Tabs
 */
const DetailView: React.FC<DetailViewProps> = ({
  title,
  status,
  statusColor,
  loading = false,
  workspaceName,
  workspaceType = 'personal',
  lastSaved,
  onBack,
  backLabel,
  actions,
  tabs,
  defaultActiveTab,
}) => {
  const [activeTab, setActiveTab] = useState(
    defaultActiveTab || tabs[0]?.key || 'overview'
  );

  // Filter out hidden tabs
  const visibleTabs = tabs.filter((tab) => !tab.hidden);

  if (loading) {
    return (
      <div className='detail-view'>
        {workspaceName && (
          <WorkspacePageHeader
            workspaceName={workspaceName}
            workspaceType={workspaceType}
            lastSaved={lastSaved}
            runsPanelCollapsed={false}
            // eslint-disable-next-line no-empty-function
            onToggleRunsPanel={() => {}}
          />
        )}
        <div className='detail-view-loading'>
          <Spin size='large' />
        </div>
      </div>
    );
  }

  return (
    <div className='detail-view'>
      {workspaceName && (
        <WorkspacePageHeader
          workspaceName={workspaceName}
          workspaceType={workspaceType}
          lastSaved={lastSaved}
          runsPanelCollapsed={false}
          onToggleRunsPanel={() => {
            // Not applicable in detail view
            // Not applicable in detail view
          }}
        />
      )}

      <DetailViewHeader
        title={title}
        status={status}
        statusColor={statusColor}
        onBack={onBack}
        backLabel={backLabel}
        actions={actions}
      />

      <div className='detail-view-tabs'>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={visibleTabs.map((tab) => ({
            key: tab.key,
            label: (
              <span className='detail-view-tab-label'>
                {tab.icon}
                {tab.label}
              </span>
            ),
            children: (
              <div className='detail-view-tab-content'>{tab.content}</div>
            ),
            disabled: tab.disabled,
          }))}
        />
      </div>
    </div>
  );
};

export default DetailView;
