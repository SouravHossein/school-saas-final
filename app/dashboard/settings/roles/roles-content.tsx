'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react'
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

export function RolesPageContent() {
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
        setRoles(rolesData)
      }

      if (permsRes.ok) {
        const permsData = await permsRes.json()
        setPermissions(permsData)
        groupPermissionsByModule(permsData)
      }
    } catch (error) {
      console.error('[v0] Error loading roles data:', error)
    } finally {
      setLoading(false)
    }
  }

  function groupPermissionsByModule(perms: Permission[]) {
    const grouped: GroupedPermissions = {}
    perms.forEach((perm) => {
      if (!grouped[perm.module]) {
        grouped[perm.module] = []
      }
      grouped[perm.module].push(perm)
    })
    setGroupedPermissions(grouped)
  }

  async function handleCreateRole() {
    if (!newRoleName.trim()) return

    try {
      setCreating(true)
      const newRole = await createRole({
        name: newRoleName,
        description: newRoleDesc,
        school_id: schoolId,
      })

      // Assign selected permissions
      for (const permId of selectedPermissions) {
        await assignPermissionToRole({
          role_id: newRole.id,
          permission_id: permId,
        })
      }

      setNewRoleName('')
      setNewRoleDesc('')
      setSelectedPermissions(new Set())
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
      await deleteRole(roleId)
      await loadData()
    } catch (error) {
      console.error('[v0] Error deleting role:', error)
    }
  }

  async function handlePermissionToggle(permissionId: string, add: boolean) {
    if (!selectedRole) return

    try {
      if (add) {
        await assignPermissionToRole({
          role_id: selectedRole.id,
          permission_id: permissionId,
        })
      } else {
        await removePermissionFromRole({
          role_id: selectedRole.id,
          permission_id: permissionId,
        })
      }
      await loadData()
    } catch (error) {
      console.error('[v0] Error toggling permission:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  const selectedRolePermissions = selectedRole?.role_permissions?.map((rp) => rp.permission_id) || []

  return (
    <div className="space-y-8 p-4 md:p-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Role Management</h1>
        <p className="text-muted-foreground mt-2">
          Create and manage roles with granular permissions
        </p>
      </div>

      <Tabs defaultValue="roles" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-6">
          {/* Create New Role */}
          <Card>
            <CardHeader>
              <CardTitle>Create New Role</CardTitle>
              <CardDescription>Define a new role with specific permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="role-name">Role Name</Label>
                <Input
                  id="role-name"
                  placeholder="e.g., Teacher, Administrator"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="role-desc">Description</Label>
                <Input
                  id="role-desc"
                  placeholder="Role description"
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                />
              </div>

              <div>
                <Label>Select Permissions</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
                  {permissions.map((perm) => (
                    <div key={perm.id} className="flex items-center space-x-2 p-2 border rounded">
                      <Checkbox
                        id={`perm-${perm.id}`}
                        checked={selectedPermissions.has(perm.id)}
                        onCheckedChange={(checked) => {
                          const newPerms = new Set(selectedPermissions)
                          if (checked) {
                            newPerms.add(perm.id)
                          } else {
                            newPerms.delete(perm.id)
                          }
                          setSelectedPermissions(newPerms)
                        }}
                      />
                      <label htmlFor={`perm-${perm.id}`} className="text-sm cursor-pointer">
                        <p className="font-medium">{perm.module}</p>
                        <p className="text-xs text-muted-foreground">{perm.action}</p>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleCreateRole} disabled={creating || !newRoleName.trim()}>
                {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Create Role
              </Button>
            </CardContent>
          </Card>

          {/* Existing Roles */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Existing Roles</h2>
            <div className="grid gap-4">
              {roles.map((role) => (
                <Card
                  key={role.id}
                  className={`cursor-pointer transition-all ${
                    selectedRole?.id === role.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedRole(role)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{role.name}</CardTitle>
                        <CardDescription>{role.description}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {!role.is_system && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteRole(role.id)
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  {role.role_permissions && role.role_permissions.length > 0 && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {role.role_permissions.length} permissions assigned
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          {selectedRole ? (
            <Card>
              <CardHeader>
                <CardTitle>Manage Permissions for {selectedRole.name}</CardTitle>
                <CardDescription>Add or remove permissions from this role</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(groupedPermissions).map(([module, perms]) => (
                  <div key={module} className="space-y-3">
                    <h3 className="font-semibold text-lg capitalize">{module}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {perms.map((perm) => {
                        const isAssigned = selectedRolePermissions.includes(perm.id)
                        return (
                          <div
                            key={perm.id}
                            className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                          >
                            <Checkbox
                              id={`role-perm-${perm.id}`}
                              checked={isAssigned}
                              onCheckedChange={(checked) => {
                                handlePermissionToggle(perm.id, !!checked)
                              }}
                            />
                            <label
                              htmlFor={`role-perm-${perm.id}`}
                              className="flex-1 cursor-pointer"
                            >
                              <p className="font-medium text-sm">{perm.action}</p>
                              <p className="text-xs text-muted-foreground">{perm.description}</p>
                            </label>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Select a role from the left to manage its permissions
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
