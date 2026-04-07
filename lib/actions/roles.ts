'use server'

import { createClient } from '@/lib/supabase/server'
import { clearUserPermissionCache } from '@/lib/permissions'

export async function createRole(
  schoolId: string,
  name: string,
  description?: string,
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('roles')
    .insert({
      school_id: schoolId,
      name,
      description,
      is_system: false,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateRole(
  roleId: string,
  schoolId: string,
  name: string,
  description?: string,
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Verify role belongs to school
  const { data: role } = await supabase.from('roles').select().eq('id', roleId).eq('school_id', schoolId).single()

  if (!role) throw new Error('Role not found')
  if (role.is_system) throw new Error('Cannot modify system roles')

  const { data, error } = await supabase
    .from('roles')
    .update({ name, description, updated_at: new Date().toISOString() })
    .eq('id', roleId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteRole(roleId: string, schoolId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Verify role belongs to school and is not system role
  const { data: role } = await supabase.from('roles').select().eq('id', roleId).eq('school_id', schoolId).single()

  if (!role) throw new Error('Role not found')
  if (role.is_system) throw new Error('Cannot delete system roles')

  // Check if any users have this role
  const { count } = await supabase.from('user_roles').select('*', { count: 'exact' }).eq('role_id', roleId)

  if (count && count > 0) {
    throw new Error('Cannot delete role with assigned users')
  }

  const { error } = await supabase.from('roles').delete().eq('id', roleId)

  if (error) throw error
}

export async function assignPermissionToRole(roleId: string, permissionId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Get the role's school_id
  const { data: role } = await supabase.from('roles').select('school_id').eq('id', roleId).single()

  if (!role) throw new Error('Role not found')

  const { data, error } = await supabase
    .from('role_permissions')
    .insert({
      role_id: roleId,
      permission_id: permissionId,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      // Unique constraint violation - already assigned
      return { success: true }
    }
    throw error
  }

  // Clear permission cache for all users with this role
  const { data: userRoles } = await supabase.from('user_roles').select('user_id').eq('role_id', roleId)

  if (userRoles) {
    for (const ur of userRoles) {
      clearUserPermissionCache(ur.user_id, role.school_id)
    }
  }

  return data
}

export async function removePermissionFromRole(roleId: string, permissionId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Get the role's school_id
  const { data: role } = await supabase.from('roles').select('school_id').eq('id', roleId).single()

  if (!role) throw new Error('Role not found')

  const { error } = await supabase
    .from('role_permissions')
    .delete()
    .eq('role_id', roleId)
    .eq('permission_id', permissionId)

  if (error) throw error

  // Clear permission cache for all users with this role
  const { data: userRoles } = await supabase.from('user_roles').select('user_id').eq('role_id', roleId)

  if (userRoles) {
    for (const ur of userRoles) {
      clearUserPermissionCache(ur.user_id, role.school_id)
    }
  }
}

export async function assignRoleToUser(userId: string, roleId: string, schoolId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Verify role belongs to school
  const { data: role } = await supabase.from('roles').select().eq('id', roleId).eq('school_id', schoolId).single()

  if (!role) throw new Error('Role not found')

  const { data, error } = await supabase
    .from('user_roles')
    .insert({
      user_id: userId,
      role_id: roleId,
      school_id: schoolId,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      // Unique constraint violation - already assigned
      return { success: true }
    }
    throw error
  }

  // Clear permission cache for this user
  clearUserPermissionCache(userId, schoolId)

  return data
}

export async function removeRoleFromUser(userId: string, roleId: string, schoolId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId)
    .eq('role_id', roleId)
    .eq('school_id', schoolId)

  if (error) throw error

  // Clear permission cache for this user
  clearUserPermissionCache(userId, schoolId)
}
