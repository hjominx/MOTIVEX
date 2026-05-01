import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Shield, 
  Zap, 
  Globe, 
  BarChart3, 
  Wallet,
  ArrowRight,
  CheckCircle2,
  Flame,
  Sparkles,
  Bolt,
  Target
} from 'lucide-react';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    redirect('/trading');
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden text-foreground">
      {/* 부드러운 배경 레이어 */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl bg-[radial-gradient(circle,rgba(11,31,58,0.12)_0%,transparent_68%)]" />
        <div className="absolute top-1/4 -left-32 w-80 h-80 rounded-full blur-3xl bg-[radial-gradient(circle,rgba(183,154,103,0.09)_0%,transparent_70%)]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl bg-[radial-gradient(circle,rgba(11,31,58,0.08)_0%,transparent_72%)]" />
      </div>

      {/* 헤더 */}
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/78 backdrop-blur-xl transition-all duration-300">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-motivex-navy p-2 shadow-[0_12px_30px_rgba(11,31,58,0.18)] transition-all duration-300">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="font-semibold tracking-[0.28em] text-[13px] text-motivex-navy">MOTIVEX</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            {['기능', '시장', '수수료'].map((item) => (
              <Link key={item} href={`#${item}`} className="text-sm font-medium text-muted-foreground hover:text-motivex-navy transition-colors duration-300 relative group">
                {item}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-motivex-navy group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="text-motivex-navy hover:bg-motivex-navy/5">로그인</Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm" className="bg-motivex-navy hover:bg-motivex-navy/95 text-white shadow-[0_12px_30px_rgba(11,31,58,0.18)] transition-all">시작하기</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 히어로 섹션 */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center slide-in-up">
            {/* 배지 */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/80 bg-white/70 backdrop-blur-sm mb-8 transition-all duration-300 shadow-[0_10px_30px_rgba(17,24,39,0.04)]">
              <Flame className="w-4 h-4 text-motivex-navy" />
              <span className="text-[13px] font-medium tracking-[0.12em] uppercase text-motivex-navy">Real-time market view</span>
              <Sparkles className="w-4 h-4 text-accent" />
            </div>
            
            {/* 메인 타이틀 */}
            <h1 className="text-5xl md:text-7xl font-semibold mb-6 leading-[0.95] tracking-[-0.04em] font-serif text-foreground">
              <span className="block">글로벌 자산을</span>
              <span className="block text-motivex-navy py-2">하나의 플랫폼에서</span>
            </h1>
            
            {/* 서브 타이틀 */}
            <p className="text-base md:text-lg text-muted-foreground mb-10 max-w-3xl mx-auto leading-8">
              한국주식, 미국주식, 암호화폐, 옵션까지.<br />
              <span className="text-foreground font-medium">전문 트레이더를 위한 차세대 HTS</span>로 더 빠르고, 더 정제된 경험을 제공합니다.
            </p>
            
            {/* CTA 버튼 */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/auth/signup">
                <Button size="lg" className="gap-2 text-base h-13 px-8 bg-motivex-navy hover:bg-motivex-navy/95 text-white transition-all duration-300 shadow-[0_14px_34px_rgba(11,31,58,0.18)]">
                  무료로 시작하기
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" size="lg" className="text-base h-13 px-8 border-border/80 bg-white/70 text-motivex-navy hover:bg-motivex-navy/5 hover:border-motivex-navy/20 transition-all duration-300">
                  데모 체험하기
                </Button>
              </Link>
            </div>
            
            {/* 신뢰 지표 */}
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 text-sm">
              {[
                { icon: Shield, text: '금융위 등록' },
                { icon: CheckCircle2, text: 'ISMS 인증' },
                { icon: Bolt, text: '99.9% 가동률' }
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/80 border border-border/80 shadow-[0_8px_24px_rgba(17,24,39,0.04)] transition-all duration-300">
                  <item.icon className="w-4 h-4 text-gain" />
                  <span className="text-foreground font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 지원 시장 */}
      <section id="시장" className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold text-foreground mb-4 font-serif tracking-[-0.03em]">지원 시장</h2>
            <p className="text-muted-foreground text-lg">주요 금융 시장에 한 번에 접근하세요</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { emoji: '🇰🇷', title: '한국 주식', desc: 'KOSPI, KOSDAQ' },
              { emoji: '🇺🇸', title: '미국 주식', desc: 'NYSE, NASDAQ' },
              { emoji: '₿', title: '암호화폐', desc: '100+ 코인' },
              { emoji: '📊', title: '옵션', desc: '전 종목 옵션' }
            ].map((market) => (
              <div key={market.title} className="group relative overflow-hidden rounded-xl border border-border/80 bg-white/80 p-6 shadow-[0_10px_30px_rgba(17,24,39,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-motivex-navy/20">
                <div className="absolute inset-0 bg-linear-to-br from-motivex-navy/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 text-center">
                  <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">{market.emoji}</div>
                  <h3 className="font-semibold text-foreground mb-1">{market.title}</h3>
                  <p className="text-xs text-muted-foreground">{market.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 기능 섹션 */}
      <section id="기능" className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold text-foreground mb-4 font-serif tracking-[-0.03em]">전문가를 위한 기능</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              기관 수준의 트레이딩 도구를 개인 투자자에게 제공합니다
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { 
                icon: Zap, 
                title: '초저지연 시세', 
                desc: '밀리초 단위 실시간 시세와 호가 데이터로 빠른 의사결정을 지원합니다.',
                gradient: 'from-white to-white'
              },
              { 
                icon: BarChart3, 
                title: '고급 차트', 
                desc: '100+ 기술적 지표와 다양한 차트 유형으로 전문적인 분석이 가능합니다.',
                gradient: 'from-white to-white'
              },
              { 
                icon: Globe, 
                title: '글로벌 접근', 
                desc: '하나의 계좌로 한국, 미국, 암호화폐 시장에 동시 접근하세요.',
                gradient: 'from-white to-white'
              },
              { 
                icon: Shield, 
                title: '보안 강화', 
                desc: '2FA 인증, 암호화 통신, 콜드월렛 보관으로 자산을 안전하게 보호합니다.',
                gradient: 'from-white to-white'
              },
              { 
                icon: Wallet, 
                title: '통합 포트폴리오', 
                desc: '모든 자산을 한눈에 관리하고 실시간 손익을 확인하세요.',
                gradient: 'from-white to-white'
              },
              { 
                icon: Target, 
                title: 'AI 분석', 
                desc: 'AI 기반 뉴스 분석과 시장 인사이트로 더 나은 투자 결정을 내리세요.',
                gradient: 'from-white to-white'
              }
            ].map((feature, idx) => {
              const IconComponent = feature.icon;
              return (
                <div 
                  key={idx}
                  className="group relative overflow-hidden rounded-xl border border-border/80 bg-white/80 p-8 shadow-[0_10px_30px_rgba(17,24,39,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-motivex-navy/20"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-motivex-navy/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-lg bg-motivex-navy p-3 flex items-center justify-center mb-5 shadow-[0_12px_30px_rgba(11,31,58,0.14)] transition-all duration-300 group-hover:scale-105">
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 수수료 섹션 */}
      <section id="수수료" className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold text-foreground mb-4 font-serif tracking-[-0.03em]">투명한 수수료</h2>
            <p className="text-muted-foreground text-lg">거래량이 늘어날수록 수수료가 낮아집니다</p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <div className="inline-block w-full min-w-fit">
              <div className="grid gap-4">
                {[
                  { market: '한국 주식', basic: '0.015%', gold: '0.01%', vip: '0.005%' },
                  { market: '미국 주식', basic: '0.25%', gold: '0.15%', vip: '0.05%' },
                  { market: '암호화폐', basic: '0.1%', gold: '0.06%', vip: '0.02%' },
                  { market: '옵션', basic: '0.3%', gold: '0.2%', vip: '0.1%' }
                ].map((row, idx) => (
                  <div 
                    key={idx}
                    className="group relative overflow-hidden rounded-lg border border-border/80 bg-white/80 p-6 shadow-[0_10px_30px_rgba(17,24,39,0.04)] transition-all duration-300 hover:border-motivex-navy/20 hover:bg-white"
                  >
                    <div className="grid grid-cols-4 gap-4">
                      <div className="font-bold text-foreground">{row.market}</div>
                      <div className="text-center text-muted-foreground group-hover:text-foreground transition-colors">{row.basic}</div>
                      <div className="text-center text-motivex-navy font-semibold group-hover:text-motivex-navy transition-colors">{row.gold}</div>
                      <div className="text-center text-gain font-bold group-hover:scale-105 transition-transform">{row.vip}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-[linear-gradient(180deg,rgba(255,253,248,0.96)_0%,rgba(244,238,228,0.9)_100%)] p-12 md:p-16 text-center shadow-[0_20px_55px_rgba(17,24,39,0.06)] transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-mesh opacity-[0.06]" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-semibold text-foreground mb-6 font-serif tracking-[-0.03em]">지금 시작하세요</h2>
              <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                5분 만에 계좌를 개설하고 글로벌 시장에 접근하세요.<br />
                <span className="text-foreground font-medium">첫 거래 수수료는 무료입니다.</span>
              </p>
              <Link href="/auth/signup">
                <Button size="lg" className="gap-2 text-base h-13 px-10 bg-motivex-navy hover:bg-motivex-navy/95 text-white transition-all duration-300 shadow-[0_14px_34px_rgba(11,31,58,0.18)]">
                  무료 계좌 개설
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="border-t border-border/70 bg-white/65 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-motivex-navy p-2 shadow-[0_12px_30px_rgba(11,31,58,0.18)]">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <span className="font-semibold tracking-[0.28em] text-[13px] text-motivex-navy">MOTIVEX</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                차세대 글로벌 트레이딩 플랫폼
              </p>
            </div>
            
            {[
              { title: '서비스', links: ['트레이딩', 'API', '모바일 앱'] },
              { title: '지원', links: ['고객센터', 'FAQ', '가이드'] },
              { title: '법적 고지', links: ['이용약관', '개인정보처리방침', '투자위험고지'] }
            ].map((section) => (
              <div key={section.title}>
                <h4 className="font-semibold text-foreground mb-6">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link}>
                      <Link href="#" className="text-sm text-muted-foreground hover:text-motivex-navy transition-colors duration-300 font-medium">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-border pt-12 text-center text-sm text-muted-foreground space-y-2">
            <p>
              투자에는 원금 손실의 위험이 있습니다. 투자 결정은 본인의 책임하에 이루어져야 합니다.
            </p>
            <p className="pt-4">
              &copy; 2024 MOTIVEX Trading. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
