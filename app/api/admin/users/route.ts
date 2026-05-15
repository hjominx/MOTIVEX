import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createAuditLog } from '@/lib/security/audit'
import { requireAuth, requireRole } from '@/lib/security/auth-middleware'
import type { UserRole } from '@/types/trading'

// 역할별 권한 매핑
const ROLE_PERMISSIONS = {
  user: [],
  moderator: ['read_users', 'update_users'],
  admin: ['read_users', 'create_users', 'update_users', 'delete_users'],
  super_admin: ['*'], // 모든 권한
} as const

function hasPermission(userRole: UserRole, requiredPermission: string): boolean {
  const permissions = ROLE_PERMISSIONS[userRole] || []
  return permissions.includes('*') || permissions.includes(requiredPermission)
}

export async function GET(req: Request) {
  try {
    // 인증 및 권한 검증
    const authResult = await requireAuth(req)
    if (!authResult.success) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const roleResult = await requireRole(req, ['admin', 'super_admin'])
    if (!roleResult.success) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const { user } = authResult

    // 권한 검증
    if (!hasPermission(user.role, 'read_users')) {
      return new NextResponse('Insufficient permissions', { status: 403 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase.auth.admin.listUsers()

    if (error) {
      await createAuditLog({
        user_id: user.id,
        action: 'ADMIN_ACCESS',
        resource_type: 'admin_api',
        resource_id: 'users_list',
        details: { error: error.message, success: false },
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || null,
      })

      return new NextResponse(JSON.stringify({ error: 'Failed to fetch users' }), { status: 500 })
    }

    // 감사 로그 기록
    await createAuditLog({
      user_id: user.id,
      action: 'ADMIN_ACCESS',
      resource_type: 'admin_api',
      resource_id: 'users_list',
      details: { user_count: data.users?.length || 0, success: true },
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || null,
    })

    return NextResponse.json({
      users: data.users?.map(user => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        email_confirmed_at: user.email_confirmed_at,
        // 민감한 정보 제외 (password_hash 등)
      })) || []
    })
  } catch (error) {
    console.error('Admin users API error:', error)
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    // 인증 및 권한 검증
    const authResult = await requireAuth(req)
    if (!authResult.success) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const roleResult = await requireRole(req, ['super_admin']) // 삭제는 최고 관리자만
    if (!roleResult.success) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const { user } = authResult

    // 권한 검증
    if (!hasPermission(user.role, 'delete_users')) {
      return new NextResponse('Insufficient permissions', { status: 403 })
    }

    const body = await req.json().catch(() => null)
    const targetUserId = body?.id

    if (!targetUserId) {
      return new NextResponse(JSON.stringify({ error: 'Missing user ID' }), { status: 400 })
    }

    // 자기 자신 삭제 방지
    if (targetUserId === user.id) {
      return new NextResponse(JSON.stringify({ error: 'Cannot delete your own account' }), { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase.auth.admin.deleteUser(targetUserId)

    if (error) {
      await createAuditLog({
        user_id: user.id,
        action: 'USER_DELETE',
        resource_type: 'user',
        resource_id: targetUserId,
        details: { error: error.message, success: false },
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || null,
      })

      return new NextResponse(JSON.stringify({ error: 'Failed to delete user' }), { status: 500 })
    }

    // 감사 로그 기록
    await createAuditLog({
      user_id: user.id,
      action: 'USER_DELETE',
      resource_type: 'user',
      resource_id: targetUserId,
      details: { success: true },
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || null,
    })

    return NextResponse.json({ success: true, message: 'User deleted successfully' })
  } catch (error) {
    console.error('Admin delete user API error:', error)
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}
