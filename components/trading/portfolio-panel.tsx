'use client';

import { useMemo } from 'react';
import { useTradingStore } from '@/lib/stores/trading-store';
import { usePriceFormatter } from '@/hooks/use-market-data';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  Wallet
} from 'lucide-react';
import type { Order, Position, TickerData } from '@/types/trading';

// 모의 포지션 데이터
const MOCK_POSITIONS: Position[] = [
  {
    id: '1',
    user_id: '',
    account_id: null,
    symbol: '005930',
    market: 'krx',
    name: '삼성전자',
    quantity: 100,
    avg_cost: 71000,
    current_price: 72500,
    unrealized_pnl: 150000,
    unrealized_pnl_percent: 2.11,
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: '',
    account_id: null,
    symbol: 'AAPL',
    market: 'nasdaq',
    name: 'Apple Inc.',
    quantity: 10,
    avg_cost: 185.50,
    current_price: 198.50,
    unrealized_pnl: 130,
    unrealized_pnl_percent: 7.01,
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    user_id: '',
    account_id: null,
    symbol: 'BTC',
    market: 'crypto',
    name: 'Bitcoin',
    quantity: 0.5,
    avg_cost: 65000,
    current_price: 67450,
    unrealized_pnl: 1225,
    unrealized_pnl_percent: 3.77,
    updated_at: new Date().toISOString(),
  },
];

// 모의 주문 데이터
const MOCK_ORDERS: Order[] = [
  {
    id: '1',
    user_id: '',
    account_id: null,
    symbol: '000660',
    market: 'krx',
    order_type: 'limit',
    side: 'buy',
    quantity: 50,
    price: 125000,
    stop_price: null,
    filled_quantity: 0,
    avg_fill_price: null,
    status: 'submitted',
    external_order_id: null,
    commission: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    filled_at: null,
  },
  {
    id: '2',
    user_id: '',
    account_id: null,
    symbol: 'NVDA',
    market: 'nasdaq',
    order_type: 'limit',
    side: 'sell',
    quantity: 5,
    price: 900,
    stop_price: null,
    filled_quantity: 2,
    avg_fill_price: 898.50,
    status: 'partial',
    external_order_id: null,
    commission: 4.49,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    filled_at: null,
  },
];

function buildPortfolioSnapshot(tickers: Record<string, TickerData>) {
  const positions = MOCK_POSITIONS.map((position) => {
    const ticker = tickers[position.symbol];
    const currentPrice = ticker?.price || position.current_price || 0;
    const unrealizedPnl = (currentPrice - position.avg_cost) * position.quantity;
    const unrealizedPnlPercent = position.avg_cost > 0
      ? ((currentPrice - position.avg_cost) / position.avg_cost) * 100
      : 0;

    return {
      ...position,
      current_price: currentPrice,
      unrealized_pnl: unrealizedPnl,
      unrealized_pnl_percent: unrealizedPnlPercent,
    };
  });

  const totalValue = positions.reduce((sum, position) => {
    return sum + (position.current_price || 0) * position.quantity;
  }, 0);

  const totalCost = positions.reduce((sum, position) => {
    return sum + position.avg_cost * position.quantity;
  }, 0);

  const totalPnl = positions.reduce((sum, position) => sum + (position.unrealized_pnl || 0), 0);
  const totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  return {
    positions,
    totalValue,
    totalCost,
    totalPnl,
    totalPnlPercent,
    isPositive: totalPnl >= 0,
  };
}

export function PortfolioPanel() {
  const { setSelectedSymbol, tickers } = useTradingStore();
  const { formatPrice } = usePriceFormatter();

  // 실시간 가격으로 포지션 업데이트
  const { positions, totalValue, totalPnl, totalPnlPercent, isPositive } = useMemo(
    () => buildPortfolioSnapshot(tickers),
    [tickers]
  );

  return (
    <Card className="bg-card/50 border-border/50">
      {/* 포트폴리오 요약 */}
      <CardHeader className="py-3 px-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            내 포트폴리오
          </CardTitle>
          <div className="text-right">
            <div className="font-mono font-bold">
              ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
            <div className={`text-xs font-medium flex items-center justify-end gap-1 ${
              isPositive ? 'text-gain' : 'text-loss'
            }`}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isPositive ? '+' : ''}{totalPnl.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              ({isPositive ? '+' : ''}{totalPnlPercent.toFixed(2)}%)
            </div>
          </div>
        </div>
      </CardHeader>

      <Tabs defaultValue="positions" className="w-full">
        <TabsList className="w-full h-10 rounded-none border-b border-border bg-transparent p-0">
          <TabsTrigger 
            value="positions"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            보유종목
          </TabsTrigger>
          <TabsTrigger 
            value="orders"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            미체결
          </TabsTrigger>
          <TabsTrigger 
            value="history"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            체결내역
          </TabsTrigger>
        </TabsList>

        {/* 보유종목 */}
        <TabsContent value="positions" className="m-0">
          <ScrollArea className="h-48">
            <div className="divide-y divide-border/30">
              {positions.map((pos) => {
                const isPosPositive = (pos.unrealized_pnl || 0) >= 0;
                return (
                  <button
                    key={pos.id}
                    onClick={() => setSelectedSymbol(pos.symbol, pos.market)}
                    className="w-full p-3 text-left hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{pos.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {pos.quantity} {pos.market === 'crypto' ? '' : '주'} @ {formatPrice(pos.avg_cost, pos.market)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm">
                          {formatPrice((pos.current_price || 0) * pos.quantity, pos.market)}
                        </div>
                        <div className={`text-xs font-medium ${isPosPositive ? 'text-gain' : 'text-loss'}`}>
                          {isPosPositive ? '+' : ''}{(pos.unrealized_pnl_percent || 0).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
              {positions.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  보유 중인 종목이 없습니다
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* 미체결 주문 */}
        <TabsContent value="orders" className="m-0">
          <ScrollArea className="h-48">
            <div className="divide-y divide-border/30">
              {MOCK_ORDERS.map((order) => (
                <div key={order.id} className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={order.side === 'buy' ? 'default' : 'destructive'} className="text-xs">
                        {order.side === 'buy' ? '매수' : '매도'}
                      </Badge>
                      <span className="font-medium text-sm">{order.symbol}</span>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {order.quantity}주 @ {formatPrice(order.price || 0, order.market)}
                    </span>
                    <span>
                      체결 {order.filled_quantity}/{order.quantity}
                    </span>
                  </div>
                </div>
              ))}
              {MOCK_ORDERS.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  미체결 주문이 없습니다
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* 체결내역 */}
        <TabsContent value="history" className="m-0">
          <ScrollArea className="h-48">
            <div className="p-8 text-center text-muted-foreground text-sm">
              오늘 체결된 내역이 없습니다
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  );
}

function OrderStatusBadge({ status }: { status: Order['status'] }) {
  const config = {
    pending: { label: '대기', icon: Clock, variant: 'outline' as const },
    submitted: { label: '접수', icon: Clock, variant: 'outline' as const },
    partial: { label: '부분체결', icon: AlertCircle, variant: 'secondary' as const },
    filled: { label: '체결', icon: CheckCircle2, variant: 'default' as const },
    cancelled: { label: '취소', icon: XCircle, variant: 'destructive' as const },
    rejected: { label: '거부', icon: XCircle, variant: 'destructive' as const },
  };
  
  const { label, icon: Icon, variant } = config[status];
  
  return (
    <Badge variant={variant} className="text-xs gap-1">
      <Icon className="w-3 h-3" />
      {label}
    </Badge>
  );
}
