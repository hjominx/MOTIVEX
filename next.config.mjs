/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  // 보안 헤더 설정
  async headers() {
    return [
      {
        // 모든 경로에 적용
        source: '/(.*)',
        headers: [
          // XSS 방지
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Referrer Policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // HTTPS 강제 (프로덕션에서만)
          ...(process.env.NODE_ENV === 'production' ? [{
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          }] : []),
          // CSP (Content Security Policy)
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.vercel-analytics.com *.supabase.co",
              "style-src 'self' 'unsafe-inline' *.googleapis.com",
              "img-src 'self' data: https: *.supabase.co *.vercel.com",
              "font-src 'self' *.googleapis.com *.gstatic.com",
              "connect-src 'self' *.supabase.co *.vercel-analytics.com wss://*.supabase.co",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
      {
        // API 경로에 추가 보안 헤더
        source: '/api/(.*)',
        headers: [
          {
            key: 'X-RateLimit-Limit',
            value: '100',
          },
          {
            key: 'X-RateLimit-Window',
            value: '60', // 60초
          },
        ],
      },
    ];
  },

  // 실험적 기능 활성화 (필요시)
  experimental: {
    serverComponentsExternalPackages: ['ioredis'],
  },
};

export default nextConfig;
