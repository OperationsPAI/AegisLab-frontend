import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

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
  titleDotColor: string;
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
  titleDotColor,
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
  const location = useLocation();
  const navigate = useNavigate();

  // Extract tab from path (e.g., /workspace/project/injections/123/files => 'files')
  const pathSegments = location.pathname.split('/').filter(Boolean);

  // Find injection/execution ID index and tab
  // Pattern: .../injections/{id}/tab or .../executions/{id}/tab
  const entityIndex = pathSegments.findIndex(
    (seg) => seg === 'injections' || seg === 'executions'
  );
  const entityId = entityIndex !== -1 ? pathSegments[entityIndex + 1] : null;
  const tabFromPath =
    entityIndex !== -1 && pathSegments.length > entityIndex + 2
      ? pathSegments[entityIndex + 2]
      : null;
  const isValidTab = tabFromPath
    ? tabs.some((tab) => tab.key === tabFromPath)
    : false;

  const [activeTab, setActiveTab] = useState(
    isValidTab ? tabFromPath : defaultActiveTab || tabs[0]?.key || 'overview'
  );

  // Sync activeTab with path and redirect to tab if missing
  useEffect(() => {
    if (entityIndex !== -1 && entityId) {
      if (!tabFromPath || !isValidTab) {
        // No tab in URL or invalid tab, redirect to default tab
        const defaultTab = defaultActiveTab || tabs[0]?.key || 'overview';
        const basePath = pathSegments.slice(0, entityIndex + 2).join('/');
        const newPath = `/${basePath}/${defaultTab}`;
        navigate(newPath, { replace: true });
        setActiveTab(defaultTab);
      } else if (isValidTab && tabFromPath !== activeTab) {
        // Valid tab in URL, sync state
        setActiveTab(tabFromPath);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Handle tab change
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    // Build new path: keep everything up to and including the entity ID, then add the tab
    if (entityIndex !== -1 && entityId) {
      const basePath = pathSegments.slice(0, entityIndex + 2).join('/');
      const newPath = `/${basePath}/${key}`;
      navigate(newPath, { replace: true });
    }
  };

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
        titleDotColor={titleDotColor}
        onBack={onBack}
        backLabel={backLabel}
        actions={actions}
      />

      <div className='detail-view-tabs'>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
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
