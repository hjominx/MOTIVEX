'use server';

import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { logLoginAttempt } from '@/lib/security/auth-middleware';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const AUTH_FAILURE_MESSAGE = '요청을 처리할 수 없습니다. 잠시 후 다시 시도해주세요.';

// Zod 스키마 정의
const emailSchema = z.string()
  .min(1, '이메일을 입력해주세요.')
  .email('올바른 이메일 형식이 아닙니다.')
  .max(254, '이메일이 너무 깁니다.');

const passwordSchema = z.string()
  .min(8, '비밀번호는 8자 이상이어야 합니다.')
  .max(128, '비밀번호가 너무 깁니다.')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '비밀번호는 대문자, 소문자, 숫자를 각각 하나 이상 포함해야 합니다.');

const fullNameSchema = z.string()
  .min(1, '이름을 입력해주세요.')
  .max(100, '이름이 너무 깁니다.')
  .regex(/^[a-zA-Z가-힣\s]+$/, '이름은 한글 또는 영문만 사용할 수 있습니다.');

const phoneSchema = z.string()
  .regex(/^(\+82|0)[0-9]{8,11}$/, '올바른 휴대폰 번호 형식이 아닙니다.')
  .optional();

const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: passwordSchema,
  fullName: fullNameSchema,
  phone: phoneSchema,
  agreeTerms: z.literal('on', { errorMap: () => ({ message: '서비스 이용약관에 동의해주세요.' }) }),
}).refine((data) => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다.',
  path: ['confirmPassword'],
});

const resetPasswordSchema = z.object({
  email: emailSchema,
});

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function getStringValue(value: FormDataEntryValue | null): string {
  return String(value ?? '').trim();
}

async function getClientIp(): Promise<string> {
  const headerStore = await headers();
  const forwarded = headerStore.get('x-forwarded-for');
  if (!forwarded) return 'unknown';
  return forwarded.split(',')[0]?.trim() || 'unknown';
}

function validateStrongPassword(password: string): string | null {
  try {
    passwordSchema.parse(password);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0].message;
    }
    return '비밀번호 검증에 실패했습니다.';
  }
}

export async function signIn(formData: FormData) {
  try {
    // Zod를 사용한 입력 검증
    const rawData = {
      email: normalizeEmail(getStringValue(formData.get('email'))),
      password: getStringValue(formData.get('password')),
    };

    const validationResult = signInSchema.safeParse(rawData);
    if (!validationResult.success) {
      return { error: validationResult.error.errors[0].message };
    }

    const { email, password } = validationResult.data;
    const ip = await getClientIp();

    // Rate limiting 적용
    const rateLimit = await checkRateLimit({
      key: `auth:signin:${ip}:${email}`,
      limit: 10,
      windowMs: 60_000,
    });

    if (!rateLimit.allowed) {
      return {
        error: `요청이 너무 많습니다. ${rateLimit.retryAfterSec}초 후 다시 시도해주세요.`,
      };
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // 로그인 시도 로깅
    await logLoginAttempt(
      email,
      !error,
      ip,
      (await headers()).get('user-agent') || undefined,
      data?.user?.id
    );

    if (error) {
      return { error: AUTH_FAILURE_MESSAGE };
    }

    redirect('/trading');
  } catch (error) {
    console.error('Sign in error:', error);
    return { error: AUTH_FAILURE_MESSAGE };
  }
}

export async function signUp(formData: FormData) {
  try {
    // Zod를 사용한 입력 검증
    const rawData = {
      email: normalizeEmail(getStringValue(formData.get('email'))),
      password: getStringValue(formData.get('password')),
      confirmPassword: getStringValue(formData.get('confirmPassword')),
      fullName: getStringValue(formData.get('fullName')),
      phone: getStringValue(formData.get('phone')) || undefined,
      agreeTerms: formData.get('agreeTerms'),
    };

    const validationResult = signUpSchema.safeParse(rawData);
    if (!validationResult.success) {
      return { error: validationResult.error.errors[0].message };
    }

    const { email, password, fullName, phone } = validationResult.data;
    const ip = await getClientIp();

    // Rate limiting 적용
    const rateLimit = await checkRateLimit({
      key: `auth:signup:${ip}:${email}`,
      limit: 5,
      windowMs: 60_000,
    });

    if (!rateLimit.allowed) {
      return {
        error: `요청이 너무 많습니다. ${rateLimit.retryAfterSec}초 후 다시 시도해주세요.`,
      };
    }

    const supabase = await createClient();

    const redirectUrl = process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
      `${process.env.NEXT_PUBLIC_SITE_URL || ''}/auth/callback`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName || null,
          phone: phone || null,
        },
      },
    });

    if (error) {
      if (error.message.includes('already registered') || error.message.includes('already been registered')) {
        redirect('/auth/verify-email');
      }
      return { error: AUTH_FAILURE_MESSAGE };
    }

    redirect('/auth/verify-email');
  } catch (error) {
    console.error('Sign up error:', error);
    return { error: AUTH_FAILURE_MESSAGE };
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

export async function resetPassword(formData: FormData) {
  try {
    // Zod를 사용한 입력 검증
    const rawData = {
      email: normalizeEmail(getStringValue(formData.get('email'))),
    };

    const validationResult = resetPasswordSchema.safeParse(rawData);
    if (!validationResult.success) {
      return { error: validationResult.error.errors[0].message };
    }

    const { email } = validationResult.data;
    const ip = await getClientIp();

    // Rate limiting 적용
    const rateLimit = await checkRateLimit({
      key: `auth:reset-password:${ip}:${email}`,
      limit: 3,
      windowMs: 60_000,
    });

    if (!rateLimit.allowed) {
      return {
        error: `요청이 너무 많습니다. ${rateLimit.retryAfterSec}초 후 다시 시도해주세요.`,
      };
    }

    const supabase = await createClient();

    const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL ?
      `${process.env.NEXT_PUBLIC_SITE_URL}/auth/update-password` :
      `${process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || ''}/auth/update-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      return { error: AUTH_FAILURE_MESSAGE };
    }

    return { success: '비밀번호 재설정 이메일을 보냈습니다.' };
  } catch (error) {
    console.error('Reset password error:', error);
    return { error: AUTH_FAILURE_MESSAGE };
  }
}
  
  const supabase = await createClient();
  
  const redirectUrl = process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? 
    `${process.env.NEXT_PUBLIC_SITE_URL || ''}/auth/callback`;
  
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: {
        full_name: fullName || null,
        phone: phone || null,
      },
    },
  });
  
  if (error) {
    if (error.message.includes('already registered') || error.message.includes('already been registered')) {
      redirect('/auth/verify-email');
    }
    return { error: AUTH_FAILURE_MESSAGE };
  }
  
  redirect('/auth/verify-email');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

export async function resetPassword(formData: FormData) {
  const email = normalizeEmail(formData.get('email'));
  
  if (!email) {
    return { error: '이메일을 입력해주세요.' };
  }

  const ip = await getClientIp();
  const rateLimit = checkRateLimit({
    key: `auth:reset-password:${ip}:${email}`,
    limit: 5,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return {
      error: `요청이 너무 많습니다. ${rateLimit.retryAfterSec}초 후 다시 시도해주세요.`,
    };
  }
  
  const supabase = await createClient();
  
  const redirectUrl = process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? 
    `${process.env.NEXT_PUBLIC_SITE_URL || ''}/auth/callback`;
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${redirectUrl}?next=/auth/update-password`,
  });
  
  if (error && !error.message.includes('not found')) {
    return { error: AUTH_FAILURE_MESSAGE };
  }
  
  return { success: '비밀번호 재설정 링크를 이메일로 보냈습니다.' };
}

export async function updatePassword(formData: FormData) {
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;
  
  if (!password || !confirmPassword) {
    return { error: '모든 필드를 입력해주세요.' };
  }
  
  if (password !== confirmPassword) {
    return { error: '비밀번호가 일치하지 않습니다.' };
  }
  
  const passwordError = validateStrongPassword(password);
  if (passwordError) {
    return { error: passwordError };
  }
  
  const supabase = await createClient();
  
  const { error } = await supabase.auth.updateUser({
    password,
  });
  
  if (error) {
    return { error: AUTH_FAILURE_MESSAGE };
  }
  
  redirect('/trading');
}

export async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getUserProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  return profile;
}
