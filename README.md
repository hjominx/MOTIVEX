# MOTIVEX 1.0-1 - 한국 HTS 스타일 트레이딩 플랫폼

<div align="center">

![MOTIVEX Logo](public/motivex-logo.svg)

**현대적인 웹 기반 HTS (Home Trading System)**

[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.104.1-green)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.2.0-38B2AC)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[데모 보기](https://motivex.vercel.app) • [문서](docs/) • [API 레퍼런스](api/)

</div>

---

## 📊 프로젝트 개요

MOTIVEX는 한국 투자자들을 위한 현대적인 웹 기반 HTS (Home Trading System)입니다. 실시간 시세 조회, 포트폴리오 관리, 고급 차트 분석, 자동 매매 등의 기능을 제공합니다.

### ✨ 주요 특징

- 🚀 **초고속 성능**: Next.js 16 App Router + React 19
- 🔒 **기업급 보안**: RBAC, 감사 로그, 암호화, Rate Limiting
- 📱 **완벽한 반응형**: 모바일부터 데스크톱까지 지원
- 🎨 **현대적 UI**: shadcn/ui + Tailwind CSS 기반
- 📈 **실시간 데이터**: WebSocket 기반 실시간 시세
- 🔧 **확장성**: 모듈식 아키텍처로 쉬운 기능 확장
- 🌐 **다국어 지원**: 한국어 기본, 영어 지원 예정

### 🎯 대상 사용자

- 개인 투자자 및 트레이더
- 소규모 증권사 및 금융 기관
- 트레이딩 교육 플랫폼
- 금융 데이터 분석가

---

## 🏗️ 아키텍처

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js 16    │    │   Supabase      │    │   Redis         │
│   Frontend      │◄──►│   Backend       │◄──►│   Cache         │
│                 │    │   Database      │    │   Rate Limit    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Trading UI    │    │   Real-time     │    │   External      │
│   Components    │    │   WebSocket     │    │   APIs          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 🛠️ 기술 스택

#### Frontend
- **Framework**: Next.js 16.2.6 (App Router)
- **Language**: TypeScript 5.7.3
- **Styling**: Tailwind CSS 4.2.0
- **UI Components**: shadcn/ui (Radix UI 기반)
- **State Management**: Zustand 5.0.12
- **Charts**: Lightweight Charts 5.2.0, Recharts 3.8.1
- **Forms**: React Hook Form + Zod 검증

#### Backend & Database
- **Backend as a Service**: Supabase 2.104.1
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **File Storage**: Supabase Storage
- **Cache**: Redis (ioredis)

#### DevOps & Security
- **Deployment**: Vercel
- **Analytics**: Vercel Analytics
- **Security**: Rate Limiting, RBAC, CSP, Audit Logs
- **Testing**: Vitest, Playwright (계획)
- **Linting**: ESLint 9.39.1

#### External Integrations
- **증권사 API**: KIS, 키움증권 (계획)
- **거래소 API**: 업비트, 바이낸스 (계획)
- **시장 데이터**: Alpha Vantage, Yahoo Finance (계획)

---

## 🚀 빠른 시작

### 사전 요구사항

- **Node.js**: 20.x 이상
- **pnpm**: 9.x 이상
- **Supabase**: 계정 및 프로젝트
- **Redis**: 로컬 또는 클라우드 (선택사항)

### 설치 및 실행

1. **레포지토리 클론**
   ```bash
   git clone https://github.com/your-username/motivex.git
   cd motivex
   ```

2. **의존성 설치**
   ```bash
   pnpm install
   ```

3. **환경 변수 설정**
   ```bash
   cp .env.example .env.local
   ```

   `.env.local` 파일을 열고 다음 값들을 설정하세요:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   REDIS_URL=redis://localhost:6379
   ```

4. **데이터베이스 스키마 적용**
   ```bash
   # Supabase SQL Editor에서 실행
   cat scripts/001_create_hts_schema.sql
   ```

5. **개발 서버 실행**
   ```bash
   pnpm dev
   ```

6. **브라우저에서 접속**
   ```
   http://localhost:3000
   ```

### 🧪 테스트 실행

```bash
# 단위 테스트
pnpm test

# E2E 테스트 (준비 중)
pnpm test:e2e

# 커버리지 리포트
pnpm test:coverage
```

---

## 📁 프로젝트 구조

```
MOTIVEX-1.0-1/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 인증 관련 페이지
│   ├── (dashboard)/              # 대시보드 페이지
│   ├── api/                      # API 라우트
│   │   └── admin/                # 관리자 API
│   └── globals.css               # 글로벌 스타일
├── components/                   # 재사용 컴포넌트
│   ├── ui/                       # 기본 UI 컴포넌트
│   └── trading/                  # 트레이딩 관련 컴포넌트
├── hooks/                        # 커스텀 React 훅
├── lib/                          # 유틸리티 및 설정
│   ├── security/                 # 보안 관련 모듈
│   ├── stores/                   # 상태 관리
│   ├── supabase/                 # Supabase 설정
│   └── utils.ts                  # 유틸리티 함수
├── public/                       # 정적 파일
├── scripts/                      # 데이터베이스 스크립트
├── types/                        # TypeScript 타입 정의
├── .env.example                  # 환경 변수 템플릿
├── next.config.mjs              # Next.js 설정
├── tailwind.config.ts           # Tailwind 설정
├── tsconfig.json                # TypeScript 설정
└── README.md                     # 프로젝트 문서
```

---

## 🔒 보안 기능

### 인증 및 권한
- **JWT 기반 인증**: Supabase Auth
- **역할 기반 접근 제어 (RBAC)**: user, moderator, admin, super_admin
- **다중 요소 인증 (2FA)**: 준비 중
- **세션 관리**: 자동 만료 및 갱신

### 데이터 보호
- **API 키 암호화**: AES-256-GCM
- **민감한 데이터 마스킹**: 로그 및 응답에서
- **SQL 인젝션 방지**: 파라미터화된 쿼리
- **XSS 방지**: CSP 헤더 및 입력 검증

### 네트워크 보안
- **Rate Limiting**: Redis 기반 분산 제한
- **CORS 정책**: 엄격한 오리진 제한
- **HTTPS 강제**: 프로덕션 환경
- **보안 헤더**: HSTS, CSP, X-Frame-Options 등

### 감사 및 모니터링
- **감사 로그**: 모든 관리자 작업 기록
- **실시간 모니터링**: 이상 징후 감지
- **보안 이벤트 알림**: 자동화된 경고 시스템

---

## 📊 API 문서

### 인증 API
```typescript
// 로그인
POST /api/auth/signin
{
  "email": "user@example.com",
  "password": "securePassword123!"
}

// 회원가입
POST /api/auth/signup
{
  "email": "user@example.com",
  "password": "securePassword123!",
  "fullName": "홍길동",
  "phone": "+821012345678"
}
```

### 관리자 API
```typescript
// 사용자 목록 조회 (관리자 전용)
GET /api/admin/users
Authorization: Bearer <admin_jwt_token>

// 사용자 삭제 (최고 관리자 전용)
DELETE /api/admin/users?id=user-uuid
```

### 트레이딩 API (계획)
```typescript
// 주문 생성
POST /api/trading/orders
{
  "symbol": "005930",
  "side": "buy",
  "quantity": 10,
  "price": 65000
}

// 포트폴리오 조회
GET /api/trading/portfolio
```

---

## 🔧 개발 가이드

### 코드 스타일
- **TypeScript**: 엄격한 타입 체크
- **ESLint**: Next.js 권장 규칙
- **Prettier**: 자동 코드 포맷팅
- **Husky**: Git 훅을 통한 품질 관리

### 기여 방법
1. Fork 및 브랜치 생성
2. 기능 구현 또는 버그 수정
3. 테스트 작성
4. Pull Request 생성

### 브랜치 전략
- `main`: 프로덕션 배포 브랜치
- `develop`: 개발 브랜치
- `feature/*`: 기능 개발 브랜치
- `hotfix/*`: 긴급 수정 브랜치

---

## 📈 로드맵

### Phase 1: MVP (현재)
- ✅ 기본 트레이딩 인터페이스
- ✅ 사용자 인증 및 프로필
- ✅ 실시간 시세 데이터 (모의)
- ✅ 포트폴리오 관리
- ✅ 기본 보안 기능

### Phase 2: 고급 기능 (Q2 2025)
- 🔄 실제 증권사 API 연동
- 🔄 고급 차트 분석 도구
- 🔄 모바일 앱 출시
- 🔄 다국어 지원

### Phase 3: 확장 (Q4 2025)
- 📋 AI 기반 트레이딩 추천
- 📋 소셜 트레이딩 기능
- 📋 고빈도 트레이딩 지원
- 📋 기관 투자자 기능

### Phase 4: 생태계 (2026)
- 🌐 DeFi 통합
- 🌐 NFT 마켓플레이스
- 🌐 크로스 체인 지원
- 🌐 글로벌 확장

---

## 🤝 기여자

<a href="https://github.com/your-username/motivex/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=your-username/motivex" />
</a>

### 기여 방법
- 버그 리포트: [GitHub Issues](https://github.com/your-username/motivex/issues)
- 기능 요청: [GitHub Discussions](https://github.com/your-username/motivex/discussions)
- 코드 기여: [Pull Requests](https://github.com/your-username/motivex/pulls)

---

## 📄 라이선스

이 프로젝트는 [MIT 라이선스](LICENSE)를 따릅니다.

---

## 📞 연락처

- **프로젝트 리드**: [Your Name](mailto:your-email@example.com)
- **기술 지원**: [support@motivex.com](mailto:support@motivex.com)
- **비즈니스 문의**: [business@motivex.com](mailto:business@motivex.com)

### 커뮤니티
- [Discord](https://discord.gg/motivex)
- [Twitter](https://twitter.com/motivex)
- [LinkedIn](https://linkedin.com/company/motivex)

---

<div align="center">

**MOTIVEX** - 한국 투자자들을 위한 미래형 트레이딩 플랫폼

⭐ Star를 눌러주세요! | 🐛 버그를 발견하셨나요? | 💡 좋은 아이디어가 있으신가요?

[위로 가기](#motivex-10---한국-hts-스타일-트레이딩-플랫폼)

</div>
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `NEXT_PUBLIC_SITE_URL` | Public app URL, usually `http://localhost:3000` in dev |
| `ENCRYPTION_KEY` | 32+ byte secret for encrypting broker or exchange credentials |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | Optional AWS credentials |
| `AWS_REGION` | Optional AWS region |
| `KIS_APP_KEY` / `KIS_APP_SECRET` | Optional Korea Investment & Securities API credentials |
| `UPBIT_ACCESS_KEY` / `UPBIT_SECRET_KEY` | Optional Upbit API credentials |
| `ALPACA_API_KEY` / `ALPACA_SECRET_KEY` / `ALPACA_BASE_URL` | Optional Alpaca API credentials |

Live market credentials are optional during local development. Mock or fallback behavior is used where available.

## Project Structure

```text
app/
  page.tsx                Home page
  layout.tsx              Root layout and metadata
  auth/                   Login, signup, callback, recovery flows
  trading/                Trading dashboard and nested layout
  privacy/                Privacy policy page
  risk/                   Risk disclosure page
  terms/                  Terms page
components/
  trading/                Trading UI blocks
  ui/                     Shared UI primitives
hooks/                    Shared React hooks
lib/
  crypto/                 Encryption helpers
  security/               Security helpers such as rate limiting
  services/               App service utilities
  stores/                 State management stores
  supabase/               Supabase client helpers
public/                   Static assets and icons
scripts/                  SQL schema setup scripts
styles/                   Global styles
```

## Notes

- The repo currently uses Supabase for auth and app data helpers.
- `scripts/001_create_hts_schema.sql` contains the SQL schema bootstrap script.
- `next.config.mjs` keeps image optimization disabled for the current setup.

## License

TBD.
