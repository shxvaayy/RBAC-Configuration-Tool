'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Role } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { AuthButton } from './auth-button'

export function RolesManager() {
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [formData, setFormData] = useState({ name: '' })
  const supabase = createClient()

  useEffect(() => {
    loadRoles()
  }, [])

  const loadRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setRoles(data || [])
    } catch (error: any) {
      toast.error(error.message || 'Failed to load roles')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingRole) {
        const { error } = await supabase
          .from('roles')
          .update({ name: formData.name })
          .eq('id', editingRole.id)

        if (error) throw error
        toast.success('Role updated successfully')
      } else {
        const { error } = await supabase
          .from('roles')
          .insert([{ name: formData.name }])

        if (error) throw error
        toast.success('Role created successfully')
      }

      setIsDialogOpen(false)
      setEditingRole(null)
      setFormData({ name: '' })
      await loadRoles()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save role')
    }
  }

  const handleEdit = (role: Role) => {
    setEditingRole(role)
    setFormData({ name: role.name })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this role? This will also remove all permission assignments.')) return

    try {
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Role deleted successfully')
      loadRoles()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete role')
    }
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingRole(null)
    setFormData({ name: '' })
  }

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
              <h1 className="text-3xl font-bold">Roles Management</h1>
              <p className="text-muted-foreground">Create and manage roles</p>
            </div>
          </div>
          <AuthButton />
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Roles</CardTitle>
                <CardDescription>Manage all roles in the system</CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingRole(null)
                    setFormData({ name: '' })
                    setIsDialogOpen(true)
                  }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Role
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingRole ? 'Edit Role' : 'Create Role'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingRole ? 'Update the role name' : 'Add a new role to the system'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g., Administrator"
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={handleDialogClose}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingRole ? 'Update' : 'Create'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading roles...</div>
            ) : roles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No roles found. Create your first role!
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell>
                        {new Date(role.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(role)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(role.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

