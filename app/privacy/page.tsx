export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background p-6 md:p-10 text-foreground">
      <article className="mx-auto max-w-3xl panel-surface rounded-2xl p-6 md:p-8 space-y-4">
        <p className="text-[11px] uppercase tracking-[0.24em] text-motivex-navy">Legal</p>
        <h1 className="text-2xl md:text-3xl font-semibold font-serif tracking-[-0.03em]">개인정보처리방침</h1>
        <p className="text-sm text-muted-foreground leading-6">
          본 문서는 베타 서비스용 임시 방침입니다. 정식 출시 전 상세 정책으로 갱신됩니다.
        </p>
        <section className="space-y-3 text-sm leading-7 text-foreground/90">
          <p>1. 계정 생성 및 인증을 위해 이메일, 이름, 전화번호(선택)를 수집할 수 있습니다.</p>
          <p>2. 서비스 안정성과 보안을 위해 접속 로그 및 보안 이벤트를 저장할 수 있습니다.</p>
          <p>3. 법령상 보관 의무 또는 이용자 요청에 따라 개인정보를 파기 또는 익명화 처리합니다.</p>
        </section>
      </article>
    </main>
  );
}
