import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Mail, ArrowLeft } from 'lucide-react';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 text-foreground">
      <div className="w-full max-w-md">
        {/* 로고 */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-motivex-navy shadow-[0_12px_30px_rgba(11,31,58,0.18)]">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-[13px] font-semibold tracking-[0.28em] text-motivex-navy">MOTIVEX</h1>
            <p className="text-xs text-muted-foreground tracking-[0.12em] uppercase">Trading Platform</p>
          </div>
        </div>

        <Card className="panel-surface border-border/50 rounded-2xl overflow-hidden">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-motivex-navy/5 border border-border/80">
                <Mail className="w-8 h-8 text-motivex-navy" />
              </div>
            </div>
            <CardTitle className="text-xl font-semibold font-serif tracking-[-0.03em]">이메일을 확인해주세요</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              가입하신 이메일로 인증 링크를 보냈습니다
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground leading-7">
              이메일에 포함된 링크를 클릭하여 계정을 인증해주세요.
              <br />
              이메일이 보이지 않으면 스팸함을 확인해주세요.
            </p>
            
            <div className="pt-4">
              <Link href="/auth/login">
                <Button variant="outline" className="w-full border-border/80 bg-white/70 text-motivex-navy hover:bg-motivex-navy/5 hover:border-motivex-navy/20">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  로그인 페이지로 돌아가기
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
