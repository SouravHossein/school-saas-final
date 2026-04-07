import { createClient } from '@/lib/supabase/server'

export type Permission = {
  id: string
  module: string
  action: string
  description?: string
}

export type Role = {
  id: string
  school_id: string
  name: string
  description?: string
  is_system: boolean
  permissions?: Permission[]
}

/**
 * Get all permissions available for a role
 */
export async function getRolePermissions(roleId: string): Promise<Permission[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('role_permissions')
    .select('permissions(id, module, action, description)')
    .eq('role_id', roleId)

  if (error) {
    console.error('[v0] Error fetching role permissions:', error)
    return []
  }

  return data?.flatMap((rp: any) => rp.permissions || []) || []
}

/**
 * Get all user permissions for their current role
 */
export async function getUserPermissions(userId: string, schoolId: string): Promise<Permission[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_roles')
    .select(
      `
      role_id,
      roles!inner(
        id,
        role_permissions(
          permissions(id, module, action, description)
        )
      )
    `,
    )
    .eq('user_id', userId)
    .eq('school_id', schoolId)

  if (error) {
    console.error('[v0] Error fetching user permissions:', error)
    return []
  }

  const permissions: Permission[] = []
  if (data && Array.isArray(data)) {
    for (const userRole of data) {
      if (userRole.roles?.role_permissions) {
        for (const rolePerms of userRole.roles.role_permissions) {
          if (rolePerms.permissions) {
            permissions.push(...(Array.isArray(rolePerms.permissions) ? rolePerms.permissions : [rolePerms.permissions]))
          }
        }
      }
    }
  }

  return permissions
}

/**
 * Check if user has a specific permission (by module and action)
 */
export async function hasPermission(userId: string, schoolId: string, module: string, action: string): Promise<boolean> {
  const permissions = await getUserPermissions(userId, schoolId)
  return permissions.some((p) => p.module === module && p.action === action)
}

/**
 * Check if user has any of the given permissions
 */
export async function hasAnyPermission(
  userId: string,
  schoolId: string,
  permissionChecks: Array<{ module: string; action: string }>,
): Promise<boolean> {
  const permissions = await getUserPermissions(userId, schoolId)
  return permissionChecks.some((check) => permissions.some((p) => p.module === check.module && p.action === check.action))
}

/**
 * Check if user has all of the given permissions
 */
export async function hasAllPermissions(
  userId: string,
  schoolId: string,
  permissionChecks: Array<{ module: string; action: string }>,
): Promise<boolean> {
  const permissions = await getUserPermissions(userId, schoolId)
  return permissionChecks.every((check) => permissions.some((p) => p.module === check.module && p.action === check.action))
}

/**
 * Get all roles for a school
 */
export async function getSchoolRoles(schoolId: string): Promise<Role[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('roles')
    .select('id, school_id, name, description, is_system')
    .eq('school_id', schoolId)

  if (error) {
    console.error('[v0] Error fetching school roles:', error)
    return []
  }

  return data || []
}

/**
 * Get user's roles in a school
 */
export async function getUserRoles(userId: string, schoolId: string): Promise<Role[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_roles')
    .select('roles!inner(id, school_id, name, description, is_system)')
    .eq('user_id', userId)
    .eq('school_id', schoolId)

  if (error) {
    console.error('[v0] Error fetching user roles:', error)
    return []
  }

  return data?.flatMap((ur: any) => ur.roles || []) || []
}

/**
 * Permission check cache for performance
 */
const permissionCache = new Map<string, { permissions: Permission[]; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Get cached or fresh permissions
 */
export async function getCachedUserPermissions(userId: string, schoolId: string): Promise<Permission[]> {
  const cacheKey = `${userId}:${schoolId}`
  const cached = permissionCache.get(cacheKey)

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.permissions
  }

  const permissions = await getUserPermissions(userId, schoolId)

  permissionCache.set(cacheKey, { permissions, timestamp: Date.now() })
  return permissions
}

/**
 * Clear permission cache for a user (called when roles/permissions change)
 */
export function clearUserPermissionCache(userId: string, schoolId: string) {
  const cacheKey = `${userId}:${schoolId}`
  permissionCache.delete(cacheKey)
}

