export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background p-6 md:p-10 text-foreground">
      <article className="mx-auto max-w-3xl panel-surface rounded-2xl p-6 md:p-8 space-y-4">
        <p className="text-[11px] uppercase tracking-[0.24em] text-motivex-navy">Legal</p>
        <h1 className="text-2xl md:text-3xl font-semibold font-serif tracking-[-0.03em]">이용약관</h1>
        <p className="text-sm text-muted-foreground leading-6">
          본 문서는 베타 서비스용 임시 약관입니다. 정식 출시 전 법무 검토 후 최종 약관으로 교체됩니다.
        </p>
        <section className="space-y-3 text-sm leading-7 text-foreground/90">
          <p>1. 서비스는 테스트 목적으로 제공되며, 기능과 정책은 사전 고지 없이 변경될 수 있습니다.</p>
          <p>2. 사용자는 계정 정보와 인증 수단을 안전하게 관리해야 합니다.</p>
          <p>3. 시장 데이터는 지연 또는 오류가 있을 수 있으며 투자 판단의 책임은 사용자에게 있습니다.</p>
        </section>
      </article>
    </main>
  );
}
