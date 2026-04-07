import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const schoolId = searchParams.get('schoolId')

    if (!schoolId) {
      return NextResponse.json({ error: 'schoolId is required' }, { status: 400 })
    }

    // Verify user belongs to school
    const { data: profile } = await supabase.from('profiles').select().eq('id', user.id).eq('school_id', schoolId).single()

    if (!profile) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { data: roles, error } = await supabase
      .from('roles')
      .select(
        `
        id,
        school_id,
        name,
        description,
        is_system,
        role_permissions(
          permission_id,
          permissions(id, key: id, module, action, description)
        )
      `,
      )
      .eq('school_id', schoolId)

    if (error) {
      console.error('[v0] Error fetching roles:', error)
      return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 })
    }

    return NextResponse.json({ data: roles })
  } catch (error) {
    console.error('[v0] API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { schoolId, name, description } = body

    if (!schoolId || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify user is admin in school
    const { data: profile } = await supabase.from('profiles').select().eq('id', user.id).eq('school_id', schoolId).single()

    if (!profile || profile.role !== 'school_admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

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

    if (error) {
      console.error('[v0] Error creating role:', error)
      return NextResponse.json({ error: 'Failed to create role' }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('[v0] API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
