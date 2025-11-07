export interface Permission {
  id: string
  name: string
  description: string | null
  created_at: string
}

export interface Role {
  id: string
  name: string
  created_at: string
}

export interface RolePermission {
  role_id: string
  permission_id: string
  created_at: string
}

export interface UserRole {
  user_id: string
  role_id: string
  created_at: string
}

export interface RoleWithPermissions extends Role {
  permissions: Permission[]
}

export interface PermissionWithRoles extends Permission {
  roles: Role[]
}

