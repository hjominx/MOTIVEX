import Redis from 'ioredis';

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitResult = {
  allowed: boolean;
  retryAfterSec: number;
  remaining: number;
};

// Redis 클라이언트 초기화 (싱글톤 패턴)
let redisClient: Redis | null = null;

function getRedisClient(): Redis {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL || process.env.REDIS_URL_LOCAL || 'redis://localhost:6379';

    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      reconnectOnError: (err) => {
        console.warn('Redis connection error:', err.message);
        return err.message.includes('READONLY');
      },
    });

    redisClient.on('error', (err) => {
      console.error('Redis connection failed:', err.message);
      // 프로덕션 환경에서는 더 정교한 에러 처리 필요
    });

    redisClient.on('connect', () => {
      console.log('Connected to Redis for rate limiting');
    });
  }

  return redisClient;
}

// 개발 환경에서는 인메모리 폴백
const memoryStore = new Map<string, { count: number; windowStart: number }>();

export async function checkRateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const { key, limit, windowMs } = options;
  const now = Date.now();
  const windowStart = Math.floor(now / windowMs) * windowMs;

  try {
    const redis = getRedisClient();

    // Redis를 사용한 분산 rate limiting
    const redisKey = `ratelimit:${key}`;
    const currentCount = await redis.incr(redisKey);

    // 키가 처음 생성된 경우 만료 시간 설정
    if (currentCount === 1) {
      await redis.pexpire(redisKey, windowMs);
    }

    const remaining = Math.max(0, limit - currentCount);
    const allowed = currentCount <= limit;

    return {
      allowed,
      retryAfterSec: allowed ? 0 : Math.ceil((windowStart + windowMs - now) / 1000),
      remaining,
    };
  } catch (error) {
    console.warn('Redis rate limiting failed, falling back to memory:', error);

    // Redis 실패 시 인메모리 폴백
    const existing = memoryStore.get(key);
    if (!existing || now - existing.windowStart >= windowMs) {
      memoryStore.set(key, { count: 1, windowStart });
      return { allowed: true, retryAfterSec: 0, remaining: limit - 1 };
    }

    if (existing.count >= limit) {
      const retryAfterSec = Math.max(1, Math.ceil((existing.windowStart + windowMs - now) / 1000));
      return { allowed: false, retryAfterSec, remaining: 0 };
    }

    existing.count += 1;
    memoryStore.set(key, existing);
    return { allowed: true, retryAfterSec: 0, remaining: limit - existing.count };
  }
}

// Rate limiting 미들웨어 헬퍼
export async function createRateLimitMiddleware(
  options: Omit<RateLimitOptions, 'key'> & { keyGenerator?: (req: Request) => string }
) {
  const { limit, windowMs, keyGenerator } = options;

  return async (req: Request): Promise<{ allowed: boolean; retryAfterSec: number; remaining: number }> => {
    const key = keyGenerator ? keyGenerator(req) : `ip:${req.headers.get('x-forwarded-for') || 'unknown'}`;
    return checkRateLimit({ key, limit, windowMs });
  };
}

// Redis 연결 종료 (graceful shutdown용)
export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}