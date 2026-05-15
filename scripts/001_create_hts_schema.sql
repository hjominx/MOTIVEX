-- HTS 웹앱 데이터베이스 스키마
-- 사용자 프로필, 포트폴리오, 주문, 거래 내역 등

-- 1. 사용자 프로필 테이블
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  tier TEXT DEFAULT 'basic' CHECK (tier IN ('basic', 'silver', 'gold', 'platinum', 'vip')),
  is_verified BOOLEAN DEFAULT FALSE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 연결된 증권/거래소 계좌
CREATE TABLE IF NOT EXISTS public.connected_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('kis', 'kiwoom', 'upbit', 'binance', 'alpaca')),
  account_number TEXT,
  nickname TEXT,
  api_key_encrypted TEXT,
  api_secret_encrypted TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 관심종목 그룹
CREATE TABLE IF NOT EXISTS public.watchlist_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 관심종목
CREATE TABLE IF NOT EXISTS public.watchlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.watchlist_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  market TEXT NOT NULL CHECK (market IN ('krx', 'nyse', 'nasdaq', 'crypto', 'options')),
  name TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, symbol, market)
);

-- 5. 주문 테이블
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  account_id UUID REFERENCES public.connected_accounts(id),
  symbol TEXT NOT NULL,
  market TEXT NOT NULL CHECK (market IN ('krx', 'nyse', 'nasdaq', 'crypto', 'options')),
  order_type TEXT NOT NULL CHECK (order_type IN ('market', 'limit', 'stop', 'stop_limit')),
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  quantity DECIMAL(20, 8) NOT NULL,
  price DECIMAL(20, 8),
  stop_price DECIMAL(20, 8),
  filled_quantity DECIMAL(20, 8) DEFAULT 0,
  avg_fill_price DECIMAL(20, 8),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'partial', 'filled', 'cancelled', 'rejected')),
  external_order_id TEXT,
  commission DECIMAL(20, 8) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  filled_at TIMESTAMPTZ
);

-- 6. 거래 내역 (체결)
CREATE TABLE IF NOT EXISTS public.trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id),
  symbol TEXT NOT NULL,
  market TEXT NOT NULL CHECK (market IN ('krx', 'nyse', 'nasdaq', 'crypto', 'options')),
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  quantity DECIMAL(20, 8) NOT NULL,
  price DECIMAL(20, 8) NOT NULL,
  total_value DECIMAL(20, 8) NOT NULL,
  commission DECIMAL(20, 8) DEFAULT 0,
  commission_rate DECIMAL(10, 6) DEFAULT 0,
  pnl DECIMAL(20, 8),
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. 감사 로그 테이블
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- 'unknown'일 수 있음
  action TEXT NOT NULL CHECK (action IN (
    'USER_LOGIN', 'USER_LOGOUT', 'USER_REGISTER', 'USER_UPDATE', 'USER_DELETE',
    'USER_ROLE_CHANGE', 'USER_LOGIN_FAILED', 'API_ACCESS', 'ADMIN_ACCESS',
    'ORDER_CREATE', 'ORDER_CANCEL', 'ORDER_UPDATE', 'ACCOUNT_CONNECT', 'ACCOUNT_DISCONNECT'
  )),
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address INET NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 감사 로그 인덱스 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address ON public.audit_logs(ip_address);

-- 사용자 프로필에 역할 필드 추가
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin', 'super_admin')),
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- RLS 정책 업데이트
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 감사 로그는 관리자만 조회 가능
CREATE POLICY "Audit logs are viewable by admins" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- 감사 로그는 시스템만 삽입 가능 (서버 사이드에서만)
CREATE POLICY "Audit logs are insertable by service role" ON public.audit_logs
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- 기존 프로필 RLS 정책 업데이트 (역할 필드 포함)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- 민감한 필드(역할, 티어)는 관리자만 수정 가능
    AND (
      OLD.role = NEW.role
      AND OLD.tier = NEW.tier
    )
  );

-- 관리자용 프로필 관리 정책
CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- 관리자용 주문 관리 정책
CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- 관리자용 거래 내역 조회 정책
CREATE POLICY "Admins can view all trades" ON public.trades
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );
  quantity DECIMAL(20, 8) NOT NULL DEFAULT 0,
  avg_cost DECIMAL(20, 8) NOT NULL DEFAULT 0,
  current_price DECIMAL(20, 8),
  unrealized_pnl DECIMAL(20, 8),
  unrealized_pnl_percent DECIMAL(10, 4),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, account_id, symbol, market)
);

-- 8. 알림 설정
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  market TEXT NOT NULL CHECK (market IN ('krx', 'nyse', 'nasdaq', 'crypto', 'options')),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('price_above', 'price_below', 'percent_change', 'volume_spike')),
  target_value DECIMAL(20, 8) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. 거래 수수료 설정
CREATE TABLE IF NOT EXISTS public.commission_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market TEXT NOT NULL CHECK (market IN ('krx', 'nyse', 'nasdaq', 'crypto', 'options')),
  tier TEXT NOT NULL CHECK (tier IN ('basic', 'silver', 'gold', 'platinum', 'vip')),
  rate DECIMAL(10, 6) NOT NULL,
  min_commission DECIMAL(20, 8) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(market, tier)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_symbol ON public.orders(symbol);
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON public.trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_executed_at ON public.trades(executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_positions_user_id ON public.positions(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_items_user_id ON public.watchlist_items(user_id);

-- RLS 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connected_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- RLS 정책: profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS 정책: connected_accounts
CREATE POLICY "accounts_select_own" ON public.connected_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "accounts_insert_own" ON public.connected_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "accounts_update_own" ON public.connected_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "accounts_delete_own" ON public.connected_accounts FOR DELETE USING (auth.uid() = user_id);

-- RLS 정책: watchlist_groups
CREATE POLICY "watchlist_groups_select_own" ON public.watchlist_groups FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "watchlist_groups_insert_own" ON public.watchlist_groups FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "watchlist_groups_update_own" ON public.watchlist_groups FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "watchlist_groups_delete_own" ON public.watchlist_groups FOR DELETE USING (auth.uid() = user_id);

-- RLS 정책: watchlist_items
CREATE POLICY "watchlist_items_select_own" ON public.watchlist_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "watchlist_items_insert_own" ON public.watchlist_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "watchlist_items_update_own" ON public.watchlist_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "watchlist_items_delete_own" ON public.watchlist_items FOR DELETE USING (auth.uid() = user_id);

-- RLS 정책: orders
CREATE POLICY "orders_select_own" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "orders_insert_own" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders_update_own" ON public.orders FOR UPDATE USING (auth.uid() = user_id);

-- RLS 정책: trades
CREATE POLICY "trades_select_own" ON public.trades FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "trades_insert_own" ON public.trades FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS 정책: positions
CREATE POLICY "positions_select_own" ON public.positions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "positions_insert_own" ON public.positions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "positions_update_own" ON public.positions FOR UPDATE USING (auth.uid() = user_id);

-- RLS 정책: alerts
CREATE POLICY "alerts_select_own" ON public.alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "alerts_insert_own" ON public.alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "alerts_update_own" ON public.alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "alerts_delete_own" ON public.alerts FOR DELETE USING (auth.uid() = user_id);

-- 수수료 테이블은 공개 읽기 허용
ALTER TABLE public.commission_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "commission_rates_select_all" ON public.commission_rates FOR SELECT USING (true);

-- 프로필 자동 생성 트리거
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- 기본 관심종목 그룹 생성
  INSERT INTO public.watchlist_groups (user_id, name, color, sort_order)
  VALUES 
    (NEW.id, '한국 주식', '#EF4444', 0),
    (NEW.id, '미국 주식', '#3B82F6', 1),
    (NEW.id, '암호화폐', '#F59E0B', 2);
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 기본 수수료율 삽입
INSERT INTO public.commission_rates (market, tier, rate, min_commission) VALUES
  ('krx', 'basic', 0.00015, 1000),
  ('krx', 'silver', 0.00012, 1000),
  ('krx', 'gold', 0.0001, 500),
  ('krx', 'platinum', 0.00008, 0),
  ('krx', 'vip', 0.00005, 0),
  ('nyse', 'basic', 0.0025, 5),
  ('nyse', 'silver', 0.002, 5),
  ('nyse', 'gold', 0.0015, 3),
  ('nyse', 'platinum', 0.001, 0),
  ('nyse', 'vip', 0.0005, 0),
  ('nasdaq', 'basic', 0.0025, 5),
  ('nasdaq', 'silver', 0.002, 5),
  ('nasdaq', 'gold', 0.0015, 3),
  ('nasdaq', 'platinum', 0.001, 0),
  ('nasdaq', 'vip', 0.0005, 0),
  ('crypto', 'basic', 0.001, 0),
  ('crypto', 'silver', 0.0008, 0),
  ('crypto', 'gold', 0.0006, 0),
  ('crypto', 'platinum', 0.0004, 0),
  ('crypto', 'vip', 0.0002, 0),
  ('options', 'basic', 0.003, 10),
  ('options', 'silver', 0.0025, 8),
  ('options', 'gold', 0.002, 5),
  ('options', 'platinum', 0.0015, 0),
  ('options', 'vip', 0.001, 0)
ON CONFLICT (market, tier) DO NOTHING;
