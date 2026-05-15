import { createClient } from '@/lib/supabase/server'
import { createAuditLog } from '@/lib/security/audit'
import type { UserProfile, UserRole } from '@/types/trading'

export interface AuthResult {
  success: boolean
  user?: UserProfile
  error?: string
}

export interface RoleResult {
  success: boolean
  error?: string
}

/**
 * 요청에서 사용자 인증을 검증합니다.
 */
export async function requireAuth(req: Request): Promise<AuthResult> {
  try {
    const supabase = await createClient()

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // 사용자 프로필 조회
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return { success: false, error: 'User profile not found' }
    }

    const userProfile: UserProfile = {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      phone: profile.phone,
      tier: profile.tier,
      role: profile.role || 'user', // 기본값 설정
      is_verified: profile.is_verified,
      two_factor_enabled: profile.two_factor_enabled,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      last_login_at: profile.last_login_at,
    }

    return { success: true, user: userProfile }
  } catch (error) {
    console.error('Auth middleware error:', error)
    return { success: false, error: 'Authentication failed' }
  }
}

/**
 * 사용자의 역할을 검증합니다.
 */
export async function requireRole(req: Request, allowedRoles: UserRole[]): Promise<RoleResult> {
  const authResult = await requireAuth(req)

  if (!authResult.success) {
    return { success: false, error: authResult.error }
  }

  const { user } = authResult

  if (!allowedRoles.includes(user!.role)) {
    return { success: false, error: 'Insufficient role permissions' }
  }

  return { success: true }
}

/**
 * 특정 권한을 검증합니다.
 */
export async function requirePermission(req: Request, permission: string): Promise<AuthResult> {
  const authResult = await requireAuth(req)

  if (!authResult.success) {
    return authResult
  }

  const { user } = authResult

  // 역할별 권한 매핑 (실제 구현에서는 별도 파일로 분리)
  const rolePermissions: Record<UserRole, string[]> = {
    user: ['read_own_data'],
    moderator: ['read_own_data', 'read_users', 'moderate_content'],
    admin: ['read_own_data', 'read_users', 'create_users', 'update_users', 'delete_users', 'admin_panel'],
    super_admin: ['*'], // 모든 권한
  }

  const userPermissions = rolePermissions[user!.role] || []

  if (!userPermissions.includes('*') && !userPermissions.includes(permission)) {
    return { success: false, error: 'Insufficient permissions' }
  }

  return authResult
}

/**
 * 로그인 시도 로깅
 */
export async function logLoginAttempt(
  email: string,
  success: boolean,
  ipAddress: string,
  userAgent?: string,
  userId?: string
): Promise<void> {
  await createAuditLog({
    user_id: userId || 'unknown',
    action: success ? 'USER_LOGIN' : 'USER_LOGIN_FAILED',
    resource_type: 'auth',
    resource_id: null,
    details: {
      email,
      success,
      ip_address: ipAddress,
      user_agent: userAgent,
    },
    ip_address: ipAddress,
    user_agent: userAgent || null,
  })
}

/**
 * API 요청 로깅 (선택적)
 */
export async function logApiRequest(
  req: Request,
  userId: string,
  endpoint: string,
  method: string,
  statusCode: number
): Promise<void> {
  await createAuditLog({
    user_id: userId,
    action: 'API_ACCESS',
    resource_type: 'api',
    resource_id: endpoint,
    details: {
      method,
      status_code: statusCode,
      user_agent: req.headers.get('user-agent'),
    },
    ip_address: req.headers.get('x-forwarded-for') || 'unknown',
    user_agent: req.headers.get('user-agent') || null,
  })
}