'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signUp } from '../actions';
import { Eye, EyeOff, AlertCircle, Check, TrendingUp, ArrowRight } from 'lucide-react';

export default function SignUpPage() {
  const [showPw, setShowPw]   = useState(false);
  const [pw, setPw]           = useState('');
  const [error, setError]     = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed]   = useState(false);

  const checks = {
    length:    pw.length >= 8,
    upper:     /[A-Z]/.test(pw),
    lower:     /[a-z]/.test(pw),
    number:    /\d/.test(pw),
  };
  const strong = checks.length && checks.upper && checks.lower && checks.number;

  async function handleSubmit(formData: FormData) {
    if (!agreed) { setError('이용약관에 동의해주세요.'); return; }
    setLoading(true);
    setError(null);
    const result = await signUp(formData);
    if (result?.error) { setError(result.error); setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden relative text-foreground">
      {/* 부드러운 배경 레이어 */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl bg-[radial-gradient(circle,rgba(11,31,58,0.12)_0%,transparent_68%)]" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 rounded-full blur-3xl bg-[radial-gradient(circle,rgba(183,154,103,0.08)_0%,transparent_70%)]" />
      </div>

      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-[480px] slide-in-up">
          
          {/* 로고 */}
          <div className="text-center mb-10">
            <Link href="/" className="inline-flex items-center gap-3 mb-8 group">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-motivex-navy p-2.5 shadow-[0_12px_30px_rgba(11,31,58,0.18)] transition-all duration-300">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <span className="text-[13px] font-semibold tracking-[0.28em] text-motivex-navy">MOTIVEX</span>
            </Link>
            
            <h1 className="text-3xl font-semibold text-foreground mb-2 font-serif tracking-[-0.03em]">계정 만들기</h1>
            <p className="text-muted-foreground">글로벌 거래를 시작해보세요</p>
          </div>

          {/* 회원가입 카드 */}
          <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-white/82 backdrop-blur-xl shadow-[0_18px_48px_rgba(17,24,39,0.06)] p-8">
            <form action={handleSubmit} className="relative z-10 space-y-5">
              {/* 에러 메시지 */}
              {error && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-loss/10 border border-loss/20 text-loss text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* 입력 필드들 */}
              <div className="space-y-4">
                {/* 이름 */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">이름</label>
                  <Input
                    name="fullName"
                    placeholder="홍길동"
                    className="h-11 text-sm bg-white/70 border border-border/80 rounded-xl focus:border-motivex-navy/30 focus:ring-2 focus:ring-motivex-navy/10 transition-all duration-300 placeholder:text-muted-foreground/50"
                  />
                </div>

                {/* 이메일 */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">이메일</label>
                  <Input
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    className="h-11 text-sm bg-white/70 border border-border/80 rounded-xl focus:border-motivex-navy/30 focus:ring-2 focus:ring-motivex-navy/10 transition-all duration-300 placeholder:text-muted-foreground/50"
                  />
                </div>

                {/* 전화번호 */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">전화번호 <span className="text-xs font-normal text-muted-foreground">(선택)</span></label>
                  <Input
                    name="phone"
                    type="tel"
                    placeholder="010-0000-0000"
                    className="h-11 text-sm bg-white/70 border border-border/80 rounded-xl focus:border-motivex-navy/30 focus:ring-2 focus:ring-motivex-navy/10 transition-all duration-300 placeholder:text-muted-foreground/50"
                  />
                </div>

                {/* 비밀번호 */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">비밀번호</label>
                  <div className="relative">
                    <Input
                      name="password"
                      type={showPw ? 'text' : 'password'}
                      placeholder="8자 이상, 대/소문자, 숫자 포함"
                      value={pw}
                      onChange={(e) => setPw(e.target.value)}
                      required
                      className="h-11 text-sm bg-white/70 border border-border/80 rounded-xl focus:border-motivex-navy/30 focus:ring-2 focus:ring-motivex-navy/10 transition-all duration-300 pr-11 placeholder:text-muted-foreground/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-motivex-navy transition-colors duration-300"
                    >
                      {showPw ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* 비밀번호 강도 표시 */}
                  {pw.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="flex gap-1">
                        {[checks.length, checks.upper, checks.lower, checks.number].map((check, idx) => (
                          <div
                            key={idx}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                check ? 'bg-motivex-navy shadow-sm shadow-motivex-navy/20' : 'bg-border'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { ok: checks.length, label: '8자 이상' },
                          { ok: checks.upper,  label: '대문자 포함' },
                          { ok: checks.lower,  label: '소문자 포함' },
                          { ok: checks.number, label: '숫자 포함' },
                        ].map((c) => (
                          <div
                            key={c.label}
                            className={`flex items-center gap-2 text-xs transition-colors duration-300 ${
                              c.ok ? 'text-gain' : 'text-muted-foreground'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                c.ok
                                  ? 'bg-motivex-navy border-motivex-navy'
                                  : 'border-border bg-white/70'
                              }`}
                            >
                              {c.ok && (
                                <Check className="w-2.5 h-2.5 text-white" />
                              )}
                            </div>
                            {c.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 비밀번호 확인 */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">비밀번호 확인</label>
                  <Input
                    name="confirmPassword"
                    type="password"
                    placeholder="비밀번호 재입력"
                    required
                    className="h-11 text-sm bg-white/70 border border-border/80 rounded-xl focus:border-motivex-navy/30 focus:ring-2 focus:ring-motivex-navy/10 transition-all duration-300 placeholder:text-muted-foreground/50"
                  />
                </div>
              </div>

              {/* 이용약관 동의 */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <div
                  onClick={() => setAgreed(!agreed)}
                  className={`mt-1 w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
                    agreed
                      ? 'bg-motivex-navy border-motivex-navy shadow-lg shadow-motivex-navy/20'
                      : 'border-border bg-white/70 group-hover:border-motivex-navy/40 group-hover:shadow-md group-hover:shadow-motivex-navy/10'
                  }`}
                >
                  {agreed && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <input type="hidden" name="agreeTerms" value={agreed ? 'on' : ''} />
                <span className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                  <Link href="/terms" className="text-motivex-navy font-medium hover:text-motivex-navy/80 transition-colors">이용약관</Link> 및{' '}
                  <Link href="/privacy" className="text-motivex-navy font-medium hover:text-motivex-navy/80 transition-colors">개인정보처리방침</Link>에 동의합니다
                </span>
              </label>

              {/* 회원가입 버튼 */}
              <Button
                type="submit"
                disabled={loading || !strong || !agreed}
                className="w-full h-11 text-base font-semibold rounded-xl bg-motivex-navy hover:bg-motivex-navy/95 text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_14px_34px_rgba(11,31,58,0.18)]"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    처리 중...
                  </>
                ) : (
                  <>
                    계정 만들기
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* 로그인 링크 */}
          <p className="text-center text-sm text-muted-foreground mt-8">
            이미 계정이 있으신가요?{' '}
            <Link href="/auth/login" className="text-motivex-navy font-semibold hover:text-motivex-navy/80 transition-colors duration-300">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
