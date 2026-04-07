'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import {
  createRole,
  deleteRole,
  assignPermissionToRole,
  removePermissionFromRole,
} from '@/lib/actions/roles'

interface Role {
  id: string
  name: string
  description?: string
  is_system: boolean
  role_permissions?: Array<{ permission_id: string }>
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

export function RolesPageContent({ schoolId }: { schoolId: string }) {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [groupedPermissions, setGroupedPermissions] = useState<GroupedPermissions>({})
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  const [newRoleName, setNewRoleName] = useState('')
  const [newRoleDesc, setNewRoleDesc] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set())

  // 🔥 Load Data
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

      const rolesData = await rolesRes.json()
      const permsData = await permsRes.json()

      setRoles(rolesData.data || [])
      setPermissions(permsData.data || [])

      groupPermissions(permsData.data || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // 🔥 Group permissions by module
  function groupPermissions(perms: Permission[]) {
    const grouped: GroupedPermissions = {}

    perms.forEach((perm) => {
      if (!grouped[perm.module]) grouped[perm.module] = []
      grouped[perm.module].push(perm)
    })

    setGroupedPermissions(grouped)
  }

  // 🔥 Sync selected permissions when role changes
  useEffect(() => {
    if (selectedRole) {
      setSelectedPermissions(
        new Set(selectedRole.role_permissions?.map((rp) => rp.permission_id) || [])
      )
    }
  }, [selectedRole])

  // 🔥 Create Role
  async function handleCreateRole() {
    if (!newRoleName.trim()) return

    try {
      setCreating(true)

      const newRole = await createRole({
        name: newRoleName,
        description: newRoleDesc,
        school_id: schoolId,
      })

      // Assign permissions
      await Promise.all(
        Array.from(selectedPermissions).map((permId) =>
          assignPermissionToRole({
            role_id: newRole.id,
            permission_id: permId,
          })
        )
      )

      setNewRoleName('')
      setNewRoleDesc('')
      setSelectedPermissions(new Set())

      await loadData()
    } catch (error) {
      console.error('Error creating role:', error)
    } finally {
      setCreating(false)
    }
  }

  // 🔥 Delete Role
  async function handleDeleteRole(roleId: string) {
    if (!confirm('Are you sure you want to delete this role?')) return

    try {
      await deleteRole(roleId)
      await loadData()
      if (selectedRole?.id === roleId) setSelectedRole(null)
    } catch (error) {
      console.error('Error deleting role:', error)
    }
  }

  // 🔥 Toggle permission (live update)
  async function handlePermissionToggle(permissionId: string, checked: boolean) {
    if (!selectedRole) return

    try {
      if (checked) {
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
      console.error('Error updating permission:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  const selectedRolePermissions =
    selectedRole?.role_permissions?.map((rp) => rp.permission_id) || []

  return (
    <div className="space-y-8 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Role Management</h1>
        <p className="text-muted-foreground mt-2">
          Create roles and assign permissions
        </p>
      </div>

      <Tabs defaultValue="roles">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        {/* ---------------- ROLES TAB ---------------- */}
        <TabsContent value="roles" className="space-y-6">
          {/* Create Role */}
          <Card>
            <CardHeader>
              <CardTitle>Create Role</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Role name"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
              />

              <Input
                placeholder="Description"
                value={newRoleDesc}
                onChange={(e) => setNewRoleDesc(e.target.value)}
              />

              <Button
                onClick={handleCreateRole}
                disabled={creating || !newRoleName.trim()}
              >
                {creating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Create Role
              </Button>
            </CardContent>
          </Card>

          {/* Roles List */}
          <div className="grid gap-4">
            {roles.map((role) => (
              <Card
                key={role.id}
                onClick={() => setSelectedRole(role)}
                className={`cursor-pointer ${selectedRole?.id === role.id ? 'ring-2 ring-primary' : ''
                  }`}
              >
                <CardHeader className="flex flex-row justify-between items-center">
                  <div>
                    <CardTitle>{role.name}</CardTitle>
                    <CardDescription>{role.description}</CardDescription>
                  </div>

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
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ---------------- PERMISSIONS TAB ---------------- */}
        <TabsContent value="permissions">
          {selectedRole ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedRole.name} Permissions</CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                {Object.entries(groupedPermissions).map(([module, perms]) => (
                  <div key={module}>
                    <h3 className="font-semibold mb-2 capitalize">{module}</h3>

                    <div className="grid gap-3 md:grid-cols-2">
                      {perms.map((perm) => {
                        const checked = selectedRolePermissions.includes(perm.id)

                        return (
                          <div key={perm.id} className="flex items-start gap-2">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(val) =>
                                handlePermissionToggle(perm.id, !!val)
                              }
                            />

                            <div>
                              <p className="text-sm font-medium">{perm.action}</p>
                              <p className="text-xs text-muted-foreground">
                                {perm.description}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              Select a role to manage permissions
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}