// DetailView main component
export { default as DetailView } from './DetailView';
export type {
  DetailViewProps,
  DetailViewAction,
  DetailViewTab,
  EntityType,
} from './DetailView';

// DetailViewHeader
export { default as DetailViewHeader } from './DetailViewHeader';

// Tab components
export { default as OverviewTab } from './tabs/OverviewTab';
export type { OverviewField } from './tabs/OverviewTab';

export { default as ConfigTree } from './tabs/ConfigTree';

export { default as GroundTruthTable } from './tabs/GroundTruthTable';
export type { GroundTruthItem } from './tabs/GroundTruthTable';

export { default as ChartsTab } from './tabs/ChartsTab';

export { default as LogsTab } from './tabs/LogsTab';
export type { LogEntry } from './tabs/LogsTab';

export { LogViewer } from './tabs/LogViewer';
export type { LogLine, LogViewerProps } from './tabs/LogViewer';

export { default as FilesTab } from './tabs/FilesTab';

export { default as ArtifactsTab } from './tabs/ArtifactsTab';
export type { DetectorResult, GranularityResult } from './tabs/ArtifactsTab';
