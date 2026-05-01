'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { resetPassword } from '../actions';

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const result = await resetPassword(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setSuccess(result?.success ?? '비밀번호 재설정 링크를 이메일로 보냈습니다.');
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 text-foreground">
      <div className="w-full max-w-sm panel-surface rounded-2xl p-6 space-y-4">
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[0.24em] text-motivex-navy mb-2">Recovery</p>
          <h1 className="text-[22px] font-semibold font-serif tracking-[-0.03em]">비밀번호 재설정</h1>
          <p className="text-[13px] text-muted-foreground mt-1 leading-6">
            가입한 이메일 주소를 입력하면 재설정 링크를 보내드립니다.
          </p>
        </div>

        <form action={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[13px] font-medium text-foreground mb-1.5">이메일</label>
            <Input
              name="email"
              type="email"
              placeholder="name@example.com"
              required
              className="h-10 text-[14px] bg-white/70 border-border/80 rounded-xl focus:bg-white focus:border-motivex-navy/20"
            />
          </div>

          {error && <p className="text-[13px] text-loss">{error}</p>}
          {success && <p className="text-[13px] text-gain">{success}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-10 text-[14px] font-medium rounded-xl bg-motivex-navy hover:bg-motivex-navy/95 text-white shadow-[0_14px_34px_rgba(11,31,58,0.18)]"
          >
            {loading ? '전송 중...' : '재설정 링크 보내기'}
          </Button>
        </form>

        <p className="text-center text-[13px] text-muted-foreground">
          <Link href="/auth/login" className="text-motivex-navy font-medium hover:text-motivex-navy/80">로그인으로 돌아가기</Link>
        </p>
      </div>
    </div>
  );
}
