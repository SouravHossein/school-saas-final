'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { createRole, updateRole, deleteRole, assignPermissionToRole, removePermissionFromRole } from '@/lib/actions/roles'

interface Role {
  id: string
  name: string
  description?: string
  is_system: boolean
  role_permissions?: Array<{ permission_id: string; permissions: Permission }>
}

interface Permission {
  id: string
  module: string
  action: string
  description?: string
}

interface GroupedPermissions {
  [module: string]: Permission[]
}

export default function RolesPage() {
  const searchParams = useSearchParams()
  const schoolId = searchParams.get('schoolId') || ''

  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [groupedPermissions, setGroupedPermissions] = useState<GroupedPermissions>({})
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [newRoleName, setNewRoleName] = useState('')
  const [newRoleDesc, setNewRoleDesc] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadData()
  }, [schoolId])

  async function loadData() {
    try {
      setLoading(true)
      const [rolesRes, permsRes] = await Promise.all([
        fetch(`/api/roles?schoolId=${schoolId}`),
        fetch('/api/permissions'),
      ])

      if (rolesRes.ok) {
        const rolesData = await rolesRes.json()
        setRoles(rolesData.data || [])
      }

      if (permsRes.ok) {
        const permsData = await permsRes.json()
        const perms = permsData.data || []
        setPermissions(perms)

        const grouped = perms.reduce(
          (acc, perm) => {
            if (!acc[perm.module]) acc[perm.module] = []
            acc[perm.module].push(perm)
            return acc
          },
          {} as GroupedPermissions,
        )
        setGroupedPermissions(grouped)
      }
    } catch (error) {
      console.error('[v0] Error loading roles:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateRole() {
    if (!newRoleName.trim()) return

    setCreating(true)
    try {
      await createRole(schoolId, newRoleName, newRoleDesc)
      setNewRoleName('')
      setNewRoleDesc('')
      await loadData()
    } catch (error) {
      console.error('[v0] Error creating role:', error)
    } finally {
      setCreating(false)
    }
  }

  async function handleDeleteRole(roleId: string) {
    if (!confirm('Are you sure you want to delete this role?')) return

    try {
      await deleteRole(roleId, schoolId)
      await loadData()
      setSelectedRole(null)
    } catch (error) {
      console.error('[v0] Error deleting role:', error)
    }
  }

  function handlePermissionToggle(permId: string) {
    const newSelected = new Set(selectedPermissions)
    if (newSelected.has(permId)) {
      newSelected.delete(permId)
    } else {
      newSelected.add(permId)
    }
    setSelectedPermissions(newSelected)
  }

  async function handleSavePermissions() {
    if (!selectedRole) return

    try {
      const currentPermIds = new Set(selectedRole.role_permissions?.map((rp) => rp.permission_id) || [])

      for (const permId of selectedPermissions) {
        if (!currentPermIds.has(permId)) {
          await assignPermissionToRole(selectedRole.id, permId)
        }
      }

      for (const permId of currentPermIds) {
        if (!selectedPermissions.has(permId)) {
          await removePermissionFromRole(selectedRole.id, permId)
        }
      }

      await loadData()
    } catch (error) {
      console.error('[v0] Error saving permissions:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Roles & Permissions</h1>
        <p className="text-muted-foreground">Manage roles and assign permissions to control access</p>
      </div>

      <Tabs defaultValue="roles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="roles">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Create Role</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Role Name</Label>
                  <Input
                    placeholder="e.g., Class Teacher"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Description (optional)</Label>
                  <Input
                    placeholder="Role description"
                    value={newRoleDesc}
                    onChange={(e) => setNewRoleDesc(e.target.value)}
                  />
                </div>
                <Button onClick={handleCreateRole} disabled={creating || !newRoleName.trim()} className="w-full">
                  {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  Create Role
                </Button>
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-4">
              {roles.map((role) => (
                <Card key={role.id} className={selectedRole?.id === role.id ? 'border-primary' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 cursor-pointer" onClick={() => setSelectedRole(role)}>
                        <CardTitle className="text-lg">{role.name}</CardTitle>
                        {role.description && <CardDescription>{role.description}</CardDescription>}
                        {role.is_system && <span className="text-xs text-muted-foreground">System Role</span>}
                      </div>
                      {!role.is_system && (
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteRole(role.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="permissions">
          {selectedRole ? (
            <Card>
              <CardHeader>
                <CardTitle>Permissions for {selectedRole.name}</CardTitle>
                <CardDescription>Select permissions to assign to this role</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(groupedPermissions).map(([module, perms]) => (
                  <div key={module}>
                    <h3 className="font-semibold mb-3 capitalize">{module}</h3>
                    <div className="grid gap-3 md:grid-cols-2 ml-4">
                      {perms.map((perm) => (
                        <div key={perm.id} className="flex items-start space-x-2">
                          <Checkbox
                            id={perm.id}
                            checked={selectedPermissions.has(perm.id)}
                            onCheckedChange={() => handlePermissionToggle(perm.id)}
                          />
                          <label htmlFor={perm.id} className="text-sm cursor-pointer leading-relaxed">
                            <span className="font-medium">{perm.action}</span>
                            {perm.description && <p className="text-xs text-muted-foreground">{perm.description}</p>}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSavePermissions} className="flex-1">
                    Save Permissions
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedRole(null)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">Select a role to manage its permissions</CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
