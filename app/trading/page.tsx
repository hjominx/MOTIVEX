'use client';

import { useEffect } from 'react';
import { useMarketData } from '@/hooks/use-market-data';
import { useTradingStore } from '@/lib/stores/trading-store';
import { TradingHeader } from '@/components/trading/header';
import { WatchlistSidebar } from '@/components/trading/watchlist-sidebar';
import { PriceChart } from '@/components/trading/price-chart';
import { OrderBook } from '@/components/trading/order-book';
import { OrderPanel } from '@/components/trading/order-panel';
import { PortfolioPanel } from '@/components/trading/portfolio-panel';

export default function TradingPage() {
  // 실시간 시세 데이터 시작
  useMarketData();
  
  const { setSelectedSymbol, selectedSymbol } = useTradingStore();

  // 초기 종목 선택
  useEffect(() => {
    if (!selectedSymbol) {
      setSelectedSymbol('005930', 'krx');
    }
  }, [selectedSymbol, setSelectedSymbol]);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* 헤더 */}
      <TradingHeader />
      
      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex min-h-0 gap-3 p-3">
        {/* 좌측: 관심종목 사이드바 */}
        <WatchlistSidebar />
        
        {/* 중앙: 차트 + 포트폴리오 */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {/* 차트 */}
          <PriceChart />
          
          {/* 포트폴리오 */}
          <PortfolioPanel />
        </div>
        
        {/* 우측: 호가창 + 주문 */}
        <div className="w-83 flex flex-col gap-3 shrink-0">
          <OrderBook />
          <OrderPanel />
        </div>
      </div>
    </div>
  );
}
