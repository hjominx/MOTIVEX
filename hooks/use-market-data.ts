'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useTradingStore } from '@/lib/stores/trading-store';
import { 
  generateAllTickers, 
  generateTickerData, 
  generateOrderBook,
  formatPrice as formatMarketPrice,
  formatChange as formatMarketChange,
  formatVolume as formatMarketVolume,
  KRX_STOCKS,
  US_STOCKS,
  CRYPTO_LIST
} from '@/lib/services/market-data';
import type { MarketType } from '@/types/trading';

const MARKET_SYMBOLS = [...KRX_STOCKS, ...US_STOCKS, ...CRYPTO_LIST];

// 시세 데이터 시뮬레이션 훅
// 실제 구현 시 WebSocket 또는 SSE 연동
export function useMarketData() {
  const { 
    setTickers, 
    updateTicker, 
    setIsConnected,
    selectedSymbol,
    selectedMarket,
    setOrderBook,
  } = useTradingStore();
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const orderBookIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 초기 데이터 로드
  useEffect(() => {
    const initialTickers = generateAllTickers();
    setTickers(initialTickers);
    setIsConnected(true);

    // 100ms마다 랜덤 종목 시세 업데이트 (밀리초 단위 시뮬레이션)
    intervalRef.current = setInterval(() => {
      const randomStock = MARKET_SYMBOLS[Math.floor(Math.random() * MARKET_SYMBOLS.length)];
      
      const newData = generateTickerData(randomStock.symbol, randomStock.market);
      updateTicker(randomStock.symbol, newData);
    }, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsConnected(false);
    };
  }, [setTickers, updateTicker, setIsConnected]);

  // 선택된 종목의 호가 데이터 업데이트
  useEffect(() => {
    if (!selectedSymbol || !selectedMarket) {
      if (orderBookIntervalRef.current) {
        clearInterval(orderBookIntervalRef.current);
        orderBookIntervalRef.current = null;
      }
      setOrderBook(null);
      return;
    }

    const tickers = useTradingStore.getState().tickers;
    const ticker = tickers[selectedSymbol];
    const currentPrice = ticker?.price || 50000;

    // 초기 호가 데이터
    const initialOrderBook = generateOrderBook(selectedSymbol, selectedMarket, currentPrice);
    setOrderBook(initialOrderBook);

    // 200ms마다 호가 업데이트
    orderBookIntervalRef.current = setInterval(() => {
      const latestTickers = useTradingStore.getState().tickers;
      const latestTicker = latestTickers[selectedSymbol];
      const price = latestTicker?.price || currentPrice;
      
      const newOrderBook = generateOrderBook(selectedSymbol, selectedMarket, price);
      setOrderBook(newOrderBook);
    }, 200);

    return () => {
      if (orderBookIntervalRef.current) {
        clearInterval(orderBookIntervalRef.current);
        orderBookIntervalRef.current = null;
      }
    };
  }, [selectedSymbol, selectedMarket, setOrderBook]);
}

// 특정 종목 구독 훅
export function useSubscribeSymbol(symbol: string | null, market: MarketType | null) {
  const updateTicker = useTradingStore((state) => state.updateTicker);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!symbol || !market) return;

    // 50ms마다 해당 종목 업데이트 (선택된 종목은 더 자주 업데이트)
    intervalRef.current = setInterval(() => {
      const newData = generateTickerData(symbol, market);
      updateTicker(symbol, newData);
    }, 50);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [symbol, market, updateTicker]);
}

// 시세 포맷팅 유틸리티
export function usePriceFormatter() {
  const formatPrice = useCallback((price: number, market: MarketType): string => {
    return formatMarketPrice(price, market);
  }, []);

  const formatChange = useCallback((change: number, changePercent: number, market: MarketType = 'krx'): string => {
    return formatMarketChange(change, changePercent, market);
  }, []);

  const formatVolume = useCallback((volume: number): string => {
    return formatMarketVolume(volume);
  }, []);

  return { formatPrice, formatChange, formatVolume };
}

// 차트 데이터 훅
export function useChartData(symbol: string | null) {
  // 캔들스틱 데이터 생성은 별도 API 또는 서비스에서 처리
  // 여기서는 기본 구조만 제공
  return {
    data: [],
    isLoading: !symbol,
    error: null,
  };
}
