export interface UserRecord {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  status?: string;
  roles?: RoleRecord[];
  created_at?: string;
  updated_at?: string;
}

export interface RoleRecord {
  id: number;
  name: string;
  scope?: string;
  description?: string;
  permissions_count?: number;
  created_at?: string;
}
