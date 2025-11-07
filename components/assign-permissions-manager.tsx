'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Role, Permission, RolePermission } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { AuthButton } from './auth-button'

export function AssignPermissionsManager() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [rolePermissions, setRolePermissions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedRole) {
      loadRolePermissions(selectedRole)
    }
  }, [selectedRole])

  const loadData = async () => {
    try {
      const [rolesRes, permissionsRes] = await Promise.all([
        supabase.from('roles').select('*').order('name'),
        supabase.from('permissions').select('*').order('name'),
      ])

      if (rolesRes.error) throw rolesRes.error
      if (permissionsRes.error) throw permissionsRes.error

      setRoles(rolesRes.data || [])
      setPermissions(permissionsRes.data || [])
    } catch (error: any) {
      toast.error(error.message || 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const loadRolePermissions = async (roleId: string) => {
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('permission_id')
        .eq('role_id', roleId)

      if (error) throw error
      setRolePermissions((data || []).map((rp) => rp.permission_id))
    } catch (error: any) {
      toast.error(error.message || 'Failed to load role permissions')
    }
  }

  const handlePermissionToggle = (permissionId: string) => {
    setRolePermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    )
  }

  const handleSave = async () => {
    if (!selectedRole) {
      toast.error('Please select a role first')
      return
    }

    try {
      // Delete existing permissions
      const { error: deleteError } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', selectedRole)

      if (deleteError) throw deleteError

      // Insert new permissions
      if (rolePermissions.length > 0) {
        const inserts = rolePermissions.map((permissionId) => ({
          role_id: selectedRole,
          permission_id: permissionId,
        }))

        const { error: insertError } = await supabase
          .from('role_permissions')
          .insert(inserts)

        if (insertError) throw insertError
      }

      toast.success('Permissions assigned successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to save permissions')
    }
  }

  const selectedRoleName = roles.find((r) => r.id === selectedRole)?.name || ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Assign Permissions to Roles</h1>
              <p className="text-muted-foreground">Link permissions to roles</p>
            </div>
          </div>
          <AuthButton />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Select Role</CardTitle>
              <CardDescription>Choose a role to assign permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedRole && (
                <div className="pt-4">
                  <h3 className="font-semibold mb-2">
                    Permissions for: {selectedRoleName}
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {permissions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No permissions available. Create permissions first.
                      </p>
                    ) : (
                      permissions.map((permission) => (
                        <div
                          key={permission.id}
                          className="flex items-center space-x-2 p-2 rounded hover:bg-muted"
                        >
                          <Checkbox
                            id={permission.id}
                            checked={rolePermissions.includes(permission.id)}
                            onCheckedChange={() => handlePermissionToggle(permission.id)}
                          />
                          <label
                            htmlFor={permission.id}
                            className="flex-1 cursor-pointer text-sm"
                          >
                            <div className="font-medium">{permission.name}</div>
                            {permission.description && (
                              <div className="text-xs text-muted-foreground">
                                {permission.description}
                              </div>
                            )}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                  <Button
                    onClick={handleSave}
                    className="w-full mt-4"
                    disabled={!selectedRole}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Permissions
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>View Permissions by Role</CardTitle>
              <CardDescription>See which permissions are assigned to a role</CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedRole}
                onValueChange={setSelectedRole}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role to view" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedRole && rolePermissions.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h3 className="font-semibold">Assigned Permissions:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {rolePermissions.map((permissionId) => {
                      const permission = permissions.find((p) => p.id === permissionId)
                      return permission ? (
                        <li key={permissionId} className="text-sm">
                          {permission.name}
                        </li>
                      ) : null
                    })}
                  </ul>
                </div>
              )}

              {selectedRole && rolePermissions.length === 0 && (
                <p className="mt-4 text-sm text-muted-foreground">
                  No permissions assigned to this role yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

