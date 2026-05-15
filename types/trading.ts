// 시장 타입
export type MarketType = 'krx' | 'nyse' | 'nasdaq' | 'crypto' | 'options';

// 주문 타입
export type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit';
export type OrderSide = 'buy' | 'sell';
export type OrderStatus = 'pending' | 'submitted' | 'partial' | 'filled' | 'cancelled' | 'rejected';

// 사용자 역할 (RBAC)
export type UserRole = 'user' | 'moderator' | 'admin' | 'super_admin';

// 사용자 등급
export type UserTier = 'basic' | 'silver' | 'gold' | 'platinum' | 'vip';

// 증권사/거래소 제공자
export type AccountProvider = 'kis' | 'kiwoom' | 'upbit' | 'binance' | 'alpaca';

// 알림 타입
export type AlertType = 'price_above' | 'price_below' | 'percent_change' | 'volume_spike';

// 감사 로그 타입
export type AuditAction =
  | 'USER_LOGIN' | 'USER_LOGOUT' | 'USER_REGISTER'
  | 'USER_DELETE' | 'USER_UPDATE' | 'USER_ROLE_CHANGE'
  | 'ORDER_CREATE' | 'ORDER_CANCEL' | 'ORDER_UPDATE'
  | 'ACCOUNT_CONNECT' | 'ACCOUNT_DISCONNECT'
  | 'ADMIN_ACCESS' | 'ADMIN_ACTION';

// 사용자 프로필
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  tier: UserTier;
  role: UserRole;
  is_verified: boolean;
  two_factor_enabled: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

// 감사 로그
export interface AuditLog {
  id: string;
  user_id: string;
  action: AuditAction;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, any>;
  ip_address: string;
  user_agent: string | null;
  created_at: string;
}

// 연결된 계좌
export interface ConnectedAccount {
  id: string;
  user_id: string;
  provider: AccountProvider;
  account_number: string | null;
  nickname: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// 관심종목 그룹
export interface WatchlistGroup {
  id: string;
  user_id: string;
  name: string;
  color: string;
  sort_order: number;
  created_at: string;
}

// 관심종목
export interface WatchlistItem {
  id: string;
  group_id: string;
  user_id: string;
  symbol: string;
  market: MarketType;
  name: string | null;
  sort_order: number;
  created_at: string;
}

// 주문
export interface Order {
  id: string;
  user_id: string;
  account_id: string | null;
  symbol: string;
  market: MarketType;
  order_type: OrderType;
  side: OrderSide;
  quantity: number;
  price: number | null;
  stop_price: number | null;
  filled_quantity: number;
  avg_fill_price: number | null;
  status: OrderStatus;
  external_order_id: string | null;
  commission: number;
  created_at: string;
  updated_at: string;
  filled_at: string | null;
}

// 거래 내역
export interface Trade {
  id: string;
  user_id: string;
  order_id: string | null;
  symbol: string;
  market: MarketType;
  side: OrderSide;
  quantity: number;
  price: number;
  total_value: number;
  commission: number;
  commission_rate: number;
  pnl: number | null;
  executed_at: string;
}

// 포지션 (보유종목)
export interface Position {
  id: string;
  user_id: string;
  account_id: string | null;
  symbol: string;
  market: MarketType;
  name: string | null;
  quantity: number;
  avg_cost: number;
  current_price: number | null;
  unrealized_pnl: number | null;
  unrealized_pnl_percent: number | null;
  updated_at: string;
}

// 알림
export interface Alert {
  id: string;
  user_id: string;
  symbol: string;
  market: MarketType;
  alert_type: AlertType;
  target_value: number;
  is_active: boolean;
  triggered_at: string | null;
  created_at: string;
}

// 수수료율
export interface CommissionRate {
  id: string;
  market: MarketType;
  tier: UserTier;
  rate: number;
  min_commission: number;
  created_at: string;
}

// 실시간 시세 데이터
export interface TickerData {
  symbol: string;
  market: MarketType;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: number;
}

// 호가 데이터
export interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
}

export interface OrderBook {
  symbol: string;
  market: MarketType;
  asks: OrderBookEntry[]; // 매도호가 (낮은 가격부터)
  bids: OrderBookEntry[]; // 매수호가 (높은 가격부터)
  timestamp: number;
}

// 체결 데이터
export interface TradeTickData {
  symbol: string;
  market: MarketType;
  price: number;
  quantity: number;
  side: OrderSide;
  timestamp: number;
}

// 캔들 데이터
export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// 차트 기간
export type ChartInterval = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1M';

// 뉴스 데이터
export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  symbols: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  publishedAt: string;
}

// 포트폴리오 요약
export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalPnl: number;
  totalPnlPercent: number;
  dayPnl: number;
  dayPnlPercent: number;
  positions: Position[];
}

// 주문 입력 폼
export interface OrderInput {
  symbol: string;
  market: MarketType;
  side: OrderSide;
  orderType: OrderType;
  quantity: number;
  price?: number;
  stopPrice?: number;
}

// API 응답 타입
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

// 페이지네이션
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
