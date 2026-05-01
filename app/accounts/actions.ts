'use server';

/**
 * Server actions for connected broker/exchange accounts.
 * API keys are encrypted before storage and decrypted only on the server.
 * The client never receives plaintext keys.
 */

import { createClient } from '@/lib/supabase/server';
import { encrypt, decrypt } from '@/lib/crypto/encryption';
import type { AccountProvider } from '@/types/trading';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ConnectAccountInput {
  provider: AccountProvider;
  accountNumber?: string;
  nickname?: string;
  apiKey: string;
  apiSecret: string;
}

/** Safe account view — never includes plaintext or encrypted key material */
export interface AccountView {
  id: string;
  provider: AccountProvider;
  accountNumber: string | null;
  nickname: string | null;
  isActive: boolean;
  hasKeys: boolean;   // true = keys are present, but never exposed to client
  createdAt: string;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

/**
 * Store a new broker/exchange account with encrypted API keys.
 */
export async function connectAccount(input: ConnectAccountInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: '인증이 필요합니다.' };

  if (!input.apiKey || !input.apiSecret) {
    return { error: 'API Key와 Secret을 모두 입력해주세요.' };
  }

  let encryptedKey: string;
  let encryptedSecret: string;

  try {
    encryptedKey    = encrypt(input.apiKey);
    encryptedSecret = encrypt(input.apiSecret);
  } catch (err) {
    console.error('[connectAccount] Encryption failed:', err);
    return { error: '암호화 처리 중 오류가 발생했습니다. 관리자에게 문의해주세요.' };
  }

  const { data, error } = await supabase
    .from('connected_accounts')
    .insert({
      user_id:             user.id,
      provider:            input.provider,
      account_number:      input.accountNumber ?? null,
      nickname:            input.nickname ?? null,
      api_key_encrypted:   encryptedKey,
      api_secret_encrypted: encryptedSecret,
      is_active:           true,
    })
    .select('id')
    .single();

  if (error) {
    console.error('[connectAccount] DB insert failed:', error);
    return { error: '계좌 등록에 실패했습니다.' };
  }

  return { success: true, accountId: data.id };
}

/**
 * List all connected accounts for the current user.
 * Returns safe views — NO key material exposed.
 */
export async function listAccounts(): Promise<{ accounts: AccountView[]; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { accounts: [], error: '인증이 필요합니다.' };

  const { data, error } = await supabase
    .from('connected_accounts')
    .select('id, provider, account_number, nickname, is_active, api_key_encrypted, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return { accounts: [], error: '계좌 목록을 불러오지 못했습니다.' };

  const accounts: AccountView[] = (data ?? []).map((row) => ({
    id:            row.id,
    provider:      row.provider,
    accountNumber: row.account_number,
    nickname:      row.nickname,
    isActive:      row.is_active,
    hasKeys:       !!row.api_key_encrypted,
    createdAt:     row.created_at,
  }));

  return { accounts };
}

/**
 * Retrieve decrypted API credentials for a specific account.
 * SERVER-SIDE USE ONLY — call from other server actions or Route Handlers.
 * Never return this data to the client.
 */
export async function getDecryptedCredentials(
  accountId: string,
): Promise<{ apiKey: string; apiSecret: string } | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('connected_accounts')
    .select('api_key_encrypted, api_secret_encrypted, user_id')
    .eq('id', accountId)
    .single();

  if (error || !data) return null;

  // Ownership check — user can only decrypt their own accounts
  if (data.user_id !== user.id) {
    console.warn(`[getDecryptedCredentials] Ownership mismatch: user ${user.id} tried to access account ${accountId}`);
    return null;
  }

  try {
    const apiKey    = decrypt(data.api_key_encrypted);
    const apiSecret = decrypt(data.api_secret_encrypted);
    return { apiKey, apiSecret };
  } catch (err) {
    console.error('[getDecryptedCredentials] Decryption failed:', err);
    return null;
  }
}

/**
 * Rotate (update) API keys for an existing account.
 */
export async function rotateApiKeys(
  accountId: string,
  newApiKey: string,
  newApiSecret: string,
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: '인증이 필요합니다.' };

  if (!newApiKey || !newApiSecret) {
    return { error: '새 API Key와 Secret을 입력해주세요.' };
  }

  let encryptedKey: string;
  let encryptedSecret: string;

  try {
    encryptedKey    = encrypt(newApiKey);
    encryptedSecret = encrypt(newApiSecret);
  } catch {
    return { error: '암호화 처리 중 오류가 발생했습니다.' };
  }

  const { error } = await supabase
    .from('connected_accounts')
    .update({
      api_key_encrypted:    encryptedKey,
      api_secret_encrypted: encryptedSecret,
      updated_at:           new Date().toISOString(),
    })
    .eq('id', accountId)
    .eq('user_id', user.id);   // ownership enforced at DB level

  if (error) return { error: 'API 키 업데이트에 실패했습니다.' };

  return { success: true };
}

/**
 * Deactivate (soft-delete) an account. Does not wipe key material.
 * Use `deleteAccount` for permanent removal.
 */
export async function deactivateAccount(accountId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: '인증이 필요합니다.' };

  const { error } = await supabase
    .from('connected_accounts')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', accountId)
    .eq('user_id', user.id);

  if (error) return { error: '계좌 비활성화에 실패했습니다.' };
  return { success: true };
}

/**
 * Permanently delete an account and wipe all key material.
 */
export async function deleteAccount(accountId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: '인증이 필요합니다.' };

  const { error } = await supabase
    .from('connected_accounts')
    .delete()
    .eq('id', accountId)
    .eq('user_id', user.id);

  if (error) return { error: '계좌 삭제에 실패했습니다.' };
  return { success: true };
}
