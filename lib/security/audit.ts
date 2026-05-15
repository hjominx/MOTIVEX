import { createClient } from '@/lib/supabase/server'
import type { AuditLog, AuditAction } from '@/types/trading'

/**
 * 감사 로그를 생성합니다.
 */
export async function createAuditLog(logData: Omit<AuditLog, 'id' | 'created_at'>): Promise<void> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: logData.user_id,
        action: logData.action,
        resource_type: logData.resource_type,
        resource_id: logData.resource_id,
        details: logData.details,
        ip_address: logData.ip_address,
        user_agent: logData.user_agent,
        created_at: new Date().toISOString(),
      })

    if (error) {
      console.error('Failed to create audit log:', error)
      // 프로덕션에서는 외부 로깅 서비스로 전송
    }
  } catch (error) {
    console.error('Audit log creation error:', error)
    // 감사 로그 실패는 애플리케이션 실행을 중단하지 않음
  }
}

/**
 * 감사 로그를 조회합니다. (관리자용)
 */
export async function getAuditLogs(
  userId?: string,
  action?: AuditAction,
  limit: number = 100,
  offset: number = 0
): Promise<AuditLog[]> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (action) {
      query = query.eq('action', action)
    }

    const { data, error } = await query

    if (error) {
      console.error('Failed to fetch audit logs:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Audit logs fetch error:', error)
    return []
  }
}

/**
 * 보안 이벤트를 감지하고 알림을 보냅니다.
 */
export async function detectSecurityAnomalies(logs: AuditLog[]): Promise<{
  suspiciousActivities: AuditLog[]
  recommendations: string[]
}> {
  const suspiciousActivities: AuditLog[] = []
  const recommendations: string[] = []

  // 동일 IP에서 여러 실패 로그인 시도 감지
  const failedLoginsByIp = new Map<string, AuditLog[]>()

  logs.forEach(log => {
    if (log.action === 'USER_LOGIN_FAILED') {
      const existing = failedLoginsByIp.get(log.ip_address) || []
      existing.push(log)
      failedLoginsByIp.set(log.ip_address, existing)
    }
  })

  // 5분 내 5회 이상 실패한 IP 감지
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

  failedLoginsByIp.forEach((logs, ip) => {
    const recentFailures = logs.filter(log =>
      new Date(log.created_at) > fiveMinutesAgo
    )

    if (recentFailures.length >= 5) {
      suspiciousActivities.push(...recentFailures)
      recommendations.push(`${ip}에서 의심스러운 로그인 시도가 감지되었습니다. IP 차단을 고려하세요.`)
    }
  })

  // 동일 사용자의 잦은 권한 변경 감지
  const roleChangesByUser = new Map<string, AuditLog[]>()

  logs.forEach(log => {
    if (log.action === 'USER_ROLE_CHANGE') {
      const existing = roleChangesByUser.get(log.user_id) || []
      existing.push(log)
      roleChangesByUser.set(log.user_id, existing)
    }
  })

  roleChangesByUser.forEach((logs, userId) => {
    if (logs.length >= 3) {
      suspiciousActivities.push(...logs)
      recommendations.push(`사용자 ${userId}의 잦은 권한 변경이 감지되었습니다.`)
    }
  })

  return { suspiciousActivities, recommendations }
}

/**
 * 감사 로그를 외부 시스템으로 내보냅니다.
 */
export async function exportAuditLogs(
  startDate: Date,
  endDate: Date,
  format: 'json' | 'csv' = 'json'
): Promise<string> {
  const logs = await getAuditLogs()

  const filteredLogs = logs.filter(log => {
    const logDate = new Date(log.created_at)
    return logDate >= startDate && logDate <= endDate
  })

  if (format === 'csv') {
    const headers = ['id', 'user_id', 'action', 'resource_type', 'resource_id', 'details', 'ip_address', 'user_agent', 'created_at']
    const csvContent = [
      headers.join(','),
      ...filteredLogs.map(log => [
        log.id,
        log.user_id,
        log.action,
        log.resource_type,
        log.resource_id || '',
        JSON.stringify(log.details).replace(/"/g, '""'),
        log.ip_address,
        log.user_agent || '',
        log.created_at
      ].join(','))
    ].join('\n')

    return csvContent
  }

  return JSON.stringify(filteredLogs, null, 2)
}