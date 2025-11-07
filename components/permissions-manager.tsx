'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Permission } from '@/types/database'
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

export function PermissionsManager() {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const supabase = createClient()

  useEffect(() => {
    loadPermissions()
  }, [])

  const loadPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPermissions(data || [])
    } catch (error: any) {
      toast.error(error.message || 'Failed to load permissions')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingPermission) {
        const { error } = await supabase
          .from('permissions')
          .update({
            name: formData.name,
            description: formData.description || null,
          })
          .eq('id', editingPermission.id)

        if (error) throw error
        toast.success('Permission updated successfully')
      } else {
        const { error } = await supabase
          .from('permissions')
          .insert([{
            name: formData.name,
            description: formData.description || null,
          }])

        if (error) throw error
        toast.success('Permission created successfully')
      }

      setIsDialogOpen(false)
      setEditingPermission(null)
      setFormData({ name: '', description: '' })
      loadPermissions()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save permission')
    }
  }

  const handleEdit = (permission: Permission) => {
    setEditingPermission(permission)
    setFormData({
      name: permission.name,
      description: permission.description || '',
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this permission?')) return

    try {
      const { error } = await supabase
        .from('permissions')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Permission deleted successfully')
      loadPermissions()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete permission')
    }
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingPermission(null)
    setFormData({ name: '', description: '' })
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
              <h1 className="text-3xl font-bold">Permissions Management</h1>
              <p className="text-muted-foreground">Create and manage permissions</p>
            </div>
          </div>
          <AuthButton />
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Permissions</CardTitle>
                <CardDescription>Manage all permissions in the system</CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingPermission(null)
                    setFormData({ name: '', description: '' })
                  }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Permission
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingPermission ? 'Edit Permission' : 'Create Permission'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingPermission ? 'Update the permission details' : 'Add a new permission to the system'}
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
                          placeholder="e.g., can_edit_articles"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="A brief description of the permission"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={handleDialogClose}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingPermission ? 'Update' : 'Create'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading permissions...</div>
            ) : permissions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No permissions found. Create your first permission!
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissions.map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell className="font-medium">{permission.name}</TableCell>
                      <TableCell>{permission.description || '-'}</TableCell>
                      <TableCell>
                        {new Date(permission.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(permission)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(permission.id)}
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

