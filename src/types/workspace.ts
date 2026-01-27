/**
 * Workspace-related type definitions
 */

// Run status
export type RunStatus = 'running' | 'finished' | 'failed' | 'crashed';

// Data source for RunsPanel
export type RunsDataSource = 'injections' | 'executions';

// Workspace ownership type
export type OwnerType = 'user' | 'team';

// Workspace settings
export interface WorkspaceSettings {
  layout?: 'grid' | 'list';
  chartGroups?: ChartGroup[];
  visibleMetrics?: string[];
  panelOrder?: string[];
}

// Chart group configuration
export interface ChartGroup {
  id: string;
  name: string;
  collapsed: boolean;
  charts: string[];
}

// Panel layout configuration
export interface PanelLayout {
  id: string;
  type: 'charts' | 'media' | 'custom';
  title: string;
  collapsed: boolean;
  order: number;
}

// Workspace definition
export interface Workspace {
  id: string;
  name: string;
  project_id: string;
  owner_id: string;
  owner_type: OwnerType;
  is_personal: boolean;
  settings: WorkspaceSettings;
  created_at: string;
  updated_at: string;
}

// Run definition (maps to Execution in most cases)
export interface Run {
  id: string;
  name: string;
  status: RunStatus;
  created_at: string;
  finished_at?: string;
  metrics: Record<string, number[]>;
  config: Record<string, unknown>;
  tags?: string[];
  notes?: string;
}

// Chart data point
export interface ChartDataPoint {
  step: number;
  value: number;
  timestamp?: string;
}

// Chart series
export interface ChartSeries {
  runId: string;
  runName: string;
  data: ChartDataPoint[];
  color: string;
  visible: boolean;
}

// Chart definition
export interface Chart {
  id: string;
  metricKey: string;
  title: string;
  type: 'line' | 'scatter' | 'bar' | 'area';
  series: ChartSeries[];
}

// Workspace view (saved layout configuration)
export interface WorkspaceView {
  id: string;
  name: string;
  workspace_id: string;
  settings: WorkspaceSettings;
  is_default: boolean;
  created_at: string;
}

// Run visibility map
export interface RunVisibility {
  [runId: string]: boolean;
}

// Run color map
export interface RunColors {
  [runId: string]: string;
}

// Workspace page state
export interface WorkspacePageState {
  selectedRuns: string[];
  visibleRuns: RunVisibility;
  runColors: RunColors;
  searchQuery: string;
  panelSearchQuery: string;
  runsPerPage: number;
  currentPage: number;
}

// Chart panel state
export interface ChartPanelState {
  groups: ChartGroup[];
  searchQuery: string;
}

// Media item
export interface MediaItem {
  id: string;
  run_id: string;
  type: 'image' | 'video' | 'audio' | 'html';
  name: string;
  url: string;
  step?: number;
  caption?: string;
  created_at: string;
}

// Artifact item
export interface ArtifactItem {
  id: string;
  run_id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  created_at: string;
}

// ============================================================================
// Table Configuration Types (W&B Table Style)
// ============================================================================

// Column data types
export type ColumnType =
  | 'text'
  | 'number'
  | 'date'
  | 'user'
  | 'tags'
  | 'status'
  | 'duration'
  | 'progress';

// Column configuration
export interface ColumnConfig {
  key: string;
  title: string;
  dataIndex: string;
  type: ColumnType;
  width?: number | string;
  visible: boolean;
  pinned: boolean;
  locked?: boolean; // Name column locked, cannot be hidden
  order: number;
  sortable?: boolean;
  filterable?: boolean;
}

// Sort field configuration for multi-field sorting
export interface SortField {
  key: string; // Unique key for React
  field: string; // Column dataIndex
  order: 'asc' | 'desc';
}

// Table view settings (persisted to localStorage)
export interface TableViewSettings {
  columns: ColumnConfig[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  sortFields?: SortField[]; // Multi-field sorting
  groupBy?: string | null; // Group by field
  filters?: Record<string, unknown>;
  pageSize: number;
}

// Row visibility state
export interface RowVisibilityState {
  visibleRowKeys: React.Key[];
  selectedRowKeys: React.Key[];
}

// Table state for workspace tables
export interface WorkspaceTableState {
  viewSettings: TableViewSettings;
  rowVisibility: RowVisibilityState;
  searchQuery: string;
  currentPage: number;
}

// ============================================================================
// Injection Table Types
// ============================================================================

export type InjectionState =
  | 'pending'
  | 'running'
  | 'success'
  | 'failed'
  | 'stopped';

export type FaultType =
  | 'network'
  | 'cpu'
  | 'memory'
  | 'disk'
  | 'process'
  | 'kubernetes';

export interface InjectionTableRow {
  id: number;
  name: string;
  notes?: string;
  user: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  state: InjectionState;
  fault_type: FaultType;
  category: string;
  benchmark_name: string;
  pedestal_name: string;
  pre_duration: number;
  runtime?: string;
  // Hidden fields
  description?: string;
  start_time?: string;
  end_time?: string;
  task_id?: string;
  benchmark_id?: number;
  pedestal_id?: number;
  labels?: Array<{ key: string; value?: string }>;
  ground_truth?: Array<{ service: string; root_cause: string }>;
}

// ============================================================================
// Execution Table Types
// ============================================================================

export type ExecutionState =
  | 'initial'
  | 'pending'
  | 'running'
  | 'success'
  | 'failed';

export interface ExecutionTableRow {
  id: number;
  name: string;
  notes?: string;
  user: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  state: ExecutionState;
  runtime?: string;
  // Execution specific fields
  algorithm_name: string;
  algorithm_version: string;
  datapack_id?: string;
  datapack_name?: string;
  injection_id?: number;
  injection_name?: string;
  // Hidden fields
  description?: string;
  start_time?: string;
  end_time?: string;
  execution_duration?: number;
  labels?: Array<{ key: string; value?: string }>;
}

// ============================================================================
// Evaluation Table Types
// ============================================================================

export type EvaluationState = 'pending' | 'running' | 'completed' | 'failed';

export interface EvaluationTableRow {
  id: number;
  name: string;
  notes?: string;
  user: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  state: EvaluationState;
  runtime?: string;
  // Evaluation metrics
  score?: number;
  precision?: number;
  recall?: number;
  f1_score?: number;
  // Related info
  model: string;
  algorithm: string;
  execution_id?: number;
  execution_name?: string;
  injection_id?: number;
  injection_name?: string;
  // Hidden fields
  description?: string;
  start_time?: string;
  end_time?: string;
  config?: Record<string, unknown>;
  metrics?: Record<string, number>;
  labels?: Array<{ key: string; value?: string }>;
}

// ============================================================================
// Status Color Definitions
// ============================================================================

export const STATUS_COLORS = {
  pending: '#faad14',
  running: '#1890ff',
  success: '#52c41a',
  completed: '#52c41a',
  finished: '#52c41a',
  failed: '#f5222d',
  stopped: '#8c8c8c',
  initial: '#d9d9d9',
  crashed: '#faad14',
} as const;

export type StatusColorKey = keyof typeof STATUS_COLORS;

// ============================================================================
// Shared Table Settings (for workspace store)
// ============================================================================

/**
 * Run name cropping mode for display
 * - 'end': Show beginning, crop end (e.g., "very_long_na...")
 * - 'middle': Show beginning and end, crop middle (e.g., "very_...name")
 * - 'beginning': Show end, crop beginning (e.g., "...long_name")
 */
export type RunNameCropMode = 'end' | 'middle' | 'beginning';

/**
 * Run list display settings shared between RunsPanel and WorkspaceTable
 */
export interface RunListDisplaySettings {
  /** Sorting order for list display (asc/desc) */
  sortOrder: 'asc' | 'desc';
  /** Run name cropping mode */
  cropMode: RunNameCropMode;
}

/**
 * Shared table settings for filter/group/sort/columns synchronization
 * between RunsPanel sidebar and standalone list pages
 */
export interface SharedTableSettings {
  sortFields: SortField[];
  groupBy: string | null;
  filters: Record<string, unknown>;
  searchText: string;
  pageSize: number;
  currentPage: number;
  columns: ColumnConfig[];
  /** Run list display settings (shared between Table and Panel) */
  displaySettings: RunListDisplaySettings;
}

// Default columns for injections table
export const defaultInjectionColumns: ColumnConfig[] = [
  {
    key: 'name',
    title: 'Name',
    dataIndex: 'name',
    type: 'text',
    visible: true,
    pinned: true,
    locked: true,
    order: 0,
    sortable: true,
  },
  {
    key: 'fault_type',
    title: 'Fault Type',
    dataIndex: 'fault_type',
    type: 'text',
    visible: true,
    pinned: false,
    order: 1,
    filterable: true,
  },
  {
    key: 'state',
    title: 'Status',
    dataIndex: 'state',
    type: 'status',
    visible: true,
    pinned: false,
    order: 2,
    filterable: true,
  },
  {
    key: 'benchmark_name',
    title: 'Benchmark',
    dataIndex: 'benchmark_name',
    type: 'text',
    visible: true,
    pinned: false,
    order: 3,
  },
  {
    key: 'created_at',
    title: 'Created',
    dataIndex: 'created_at',
    type: 'date',
    visible: true,
    pinned: false,
    order: 4,
    sortable: true,
  },
];

// Default columns for executions table
export const defaultExecutionColumns: ColumnConfig[] = [
  {
    key: 'name',
    title: 'Name',
    dataIndex: 'name',
    type: 'text',
    visible: true,
    pinned: true,
    locked: true,
    order: 0,
    sortable: true,
  },
  {
    key: 'algorithm_name',
    title: 'Algorithm',
    dataIndex: 'algorithm_name',
    type: 'text',
    visible: true,
    pinned: false,
    order: 1,
    filterable: true,
  },
  {
    key: 'state',
    title: 'Status',
    dataIndex: 'state',
    type: 'status',
    visible: true,
    pinned: false,
    order: 2,
    filterable: true,
  },
  {
    key: 'injection_name',
    title: 'Injection',
    dataIndex: 'injection_name',
    type: 'text',
    visible: true,
    pinned: false,
    order: 3,
  },
  {
    key: 'created_at',
    title: 'Created',
    dataIndex: 'created_at',
    type: 'date',
    visible: true,
    pinned: false,
    order: 4,
    sortable: true,
  },
];

/**
 * Default run list display settings
 */
export const defaultRunListDisplaySettings: RunListDisplaySettings = {
  sortOrder: 'desc',
  cropMode: 'end',
};

/**
 * Default table settings factory
 */
export const createDefaultTableSettings = (
  dataSource: 'injections' | 'executions' = 'injections'
): SharedTableSettings => ({
  sortFields: [],
  groupBy: null,
  filters: {},
  searchText: '',
  pageSize: 20,
  currentPage: 1,
  columns:
    dataSource === 'injections'
      ? [...defaultInjectionColumns]
      : [...defaultExecutionColumns],
  displaySettings: { ...defaultRunListDisplaySettings },
});
