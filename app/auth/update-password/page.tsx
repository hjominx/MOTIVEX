'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updatePassword } from '../actions';

export default function UpdatePasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await updatePassword(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 text-foreground">
      <div className="w-full max-w-sm panel-surface rounded-2xl p-6 space-y-4">
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[0.24em] text-motivex-navy mb-2">Recovery</p>
          <h1 className="text-[22px] font-semibold font-serif tracking-[-0.03em]">새 비밀번호 설정</h1>
          <p className="text-[13px] text-muted-foreground mt-1 leading-6">
            새 비밀번호를 입력하면 즉시 계정에 반영됩니다.
          </p>
        </div>

        <form action={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[13px] font-medium text-foreground mb-1.5">새 비밀번호</label>
            <Input
              name="password"
              type="password"
              required
              className="h-10 text-[14px] bg-white/70 border-border/80 rounded-xl focus:bg-white focus:border-motivex-navy/20"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-foreground mb-1.5">새 비밀번호 확인</label>
            <Input
              name="confirmPassword"
              type="password"
              required
              className="h-10 text-[14px] bg-white/70 border-border/80 rounded-xl focus:bg-white focus:border-motivex-navy/20"
            />
          </div>

          {error && <p className="text-[13px] text-loss">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-10 text-[14px] font-medium rounded-xl bg-motivex-navy hover:bg-motivex-navy/95 text-white shadow-[0_14px_34px_rgba(11,31,58,0.18)]"
          >
            {loading ? '변경 중...' : '비밀번호 변경'}
          </Button>
        </form>

        <p className="text-center text-[13px] text-muted-foreground">
          <Link href="/auth/login" className="text-motivex-navy font-medium hover:text-motivex-navy/80">로그인으로 이동</Link>
        </p>
      </div>
    </div>
  );
}
