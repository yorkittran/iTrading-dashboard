import type { Database } from './database'

// Database user types (from public.users table)
export type DatabaseUser = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

// User profile types are now handled by the users table
// Legacy UserProfile types for backward compatibility
export type UserProfile = DatabaseUser
export type UserProfileInsert = UserInsert
export type UserProfileUpdate = UserUpdate

// Permission types
export type UserPermission = Database['public']['Tables']['user_permissions']['Row']
export type UserPermissionInsert = Database['public']['Tables']['user_permissions']['Insert']
export type UserPermissionUpdate = Database['public']['Tables']['user_permissions']['Update']

export type RolePermission = Database['public']['Tables']['role_permissions']['Row']
export type RolePermissionInsert = Database['public']['Tables']['role_permissions']['Insert']
export type RolePermissionUpdate = Database['public']['Tables']['role_permissions']['Update']

// User-specific enums/unions
export type UserRole = 'user' | 'admin' | 'super_admin'
export type UserStatus = 'invited' | 'active' | 'inactive' | 'suspended'

// Permission helper types
export interface Permission {
  resource: string
  action: string
}

export interface UserWithPermissions extends DatabaseUser {
  permissions: Permission[]
}
