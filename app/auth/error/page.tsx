import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 text-foreground">
      <div className="w-full max-w-md panel-surface rounded-2xl p-6 space-y-4 text-center">
        <p className="text-[11px] uppercase tracking-[0.24em] text-motivex-navy">Authentication</p>
        <h1 className="text-xl md:text-2xl font-semibold font-serif tracking-[-0.03em]">인증 중 문제가 발생했습니다</h1>
        <p className="text-sm text-muted-foreground leading-6">
          링크가 만료되었거나 잘못된 요청일 수 있습니다. 다시 로그인하거나 비밀번호 재설정을 시도해주세요.
        </p>

        <div className="flex gap-2 justify-center">
          <Button asChild className="rounded-xl bg-motivex-navy hover:bg-motivex-navy/95 text-white shadow-[0_14px_34px_rgba(11,31,58,0.18)]">
            <Link href="/auth/login">로그인으로 이동</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl border-border/80 bg-white/70 text-motivex-navy hover:bg-motivex-navy/5 hover:border-motivex-navy/20">
            <Link href="/auth/forgot-password">비밀번호 재설정</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
