// Re-export commonly used types from @rcabench/client
export type {
  ExecutionResp,
  ProjectResp,
  ProjectDetailResp,
  UserDetailResp,
  UserResp,
} from '@rcabench/client';

export { ExecutionState, FaultType } from '@rcabench/client';

// Custom enums (not in generated API)
export enum InjectionState {
  PENDING = '0',
  RUNNING = '1',
  COMPLETED = '2',
  ERROR = '3',
  STOPPED = '4',
}

export enum InjectionType {
  NETWORK = 'network',
  CPU = 'cpu',
  MEMORY = 'memory',
  DISK = 'disk',
  PROCESS = 'process',
  KUBERNETES = 'kubernetes',
}

export enum ProjectState {
  ACTIVE = 0,
  PAUSED = 1,
  COMPLETED = 2,
  ARCHIVED = 3,
}

// Custom interfaces (extensions of API types)
export interface FaultParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'range';
  label: string;
  description?: string;
  required?: boolean;
  default?: string | number | boolean;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
}

// Profile Activity Types
export interface ActivityContribution {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface ActivityResponse {
  contributions: ActivityContribution[];
  total_runs: number;
  total_projects: number;
}

// Project Visibility
export type ProjectVisibility = 'private' | 'team' | 'public';

// Extended Project for Profile display
export interface ProjectWithStats {
  id: number;
  name: string;
  description?: string;
  is_public?: boolean;
  visibility?: ProjectVisibility;
  updated_at?: string;
  created_at?: string;
  run_count?: number;
  last_run_at?: string;
  is_starred?: boolean;
}

// Team Types
export interface Team {
  id: number;
  name: string;
  display_name?: string;
  description?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  member_count: number;
  project_count: number;
  settings?: TeamSettings;
}

export interface TeamSettings {
  customization_enabled: boolean;
  default_ttl?: number;
  ttl_permissions?: 'admins' | 'members';
}

export type TeamRole = 'owner' | 'admin' | 'member';

export interface TeamMember {
  id: number;
  user_id: number;
  team_id: number;
  role: TeamRole;
  joined_at: string;
  user: {
    id: number;
    username: string;
    display_name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface TeamSecret {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface TeamLink {
  id: number;
  title: string;
  url: string;
}

export interface TeamRunsResponse {
  items: ExecutionResp[];
  total: number;
  page: number;
  size: number;
}
