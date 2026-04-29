'use client';

import { create } from 'zustand';
import type { 
  TickerData, 
  OrderBook, 
  MarketType, 
  Position,
  Order,
  WatchlistGroup,
  WatchlistItem,
  UserProfile,
  PortfolioSummary
} from '@/types/trading';

function calculatePortfolioSummary(
  positions: Position[],
  tickers: Record<string, TickerData>
): PortfolioSummary {
  let totalValue = 0;
  let totalCost = 0;

  positions.forEach((position) => {
    const ticker = tickers[position.symbol];
    const currentPrice = ticker?.price ?? position.current_price ?? 0;
    const value = currentPrice * position.quantity;
    const cost = position.avg_cost * position.quantity;

    totalValue += value;
    totalCost += cost;
  });

  const totalPnl = totalValue - totalCost;
  const totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  return {
    totalValue,
    totalCost,
    totalPnl,
    totalPnlPercent,
    dayPnl: 0,
    dayPnlPercent: 0,
    positions,
  };
}

interface TradingState {
  // 사용자 정보
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  
  // 현재 선택된 종목
  selectedSymbol: string | null;
  selectedMarket: MarketType | null;
  setSelectedSymbol: (symbol: string, market: MarketType) => void;
  
  // 실시간 시세 데이터
  tickers: Record<string, TickerData>;
  updateTicker: (symbol: string, data: Partial<TickerData>) => void;
  setTickers: (tickers: Record<string, TickerData>) => void;
  
  // 호가 데이터
  orderBook: OrderBook | null;
  setOrderBook: (orderBook: OrderBook | null) => void;
  
  // 관심종목
  watchlistGroups: WatchlistGroup[];
  watchlistItems: WatchlistItem[];
  setWatchlistGroups: (groups: WatchlistGroup[]) => void;
  setWatchlistItems: (items: WatchlistItem[]) => void;
  selectedWatchlistGroup: string | null;
  setSelectedWatchlistGroup: (groupId: string | null) => void;
  
  // 보유종목
  positions: Position[];
  setPositions: (positions: Position[]) => void;
  
  // 주문 내역
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrder: (orderId: string, data: Partial<Order>) => void;
  
  // 연결 상태
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;
  
  // 사이드바 상태
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  
  // 주문 패널 상태
  orderPanelOpen: boolean;
  setOrderPanelOpen: (open: boolean) => void;
}

export const useTradingStore = create<TradingState>((set) => ({
  // 사용자 정보
  user: null,
  setUser: (user) => set({ user }),
  
  // 현재 선택된 종목
  selectedSymbol: null,
  selectedMarket: null,
  setSelectedSymbol: (symbol, market) => set({ 
    selectedSymbol: symbol, 
    selectedMarket: market 
  }),
  
  // 실시간 시세 데이터
  tickers: {},
  updateTicker: (symbol, data) => set((state) => ({
    tickers: {
      ...state.tickers,
      [symbol]: {
        ...state.tickers[symbol],
        ...data
      } as TickerData
    }
  })),
  setTickers: (tickers) => set({ tickers }),
  
  // 호가 데이터
  orderBook: null,
  setOrderBook: (orderBook) => set({ orderBook }),
  
  // 관심종목
  watchlistGroups: [],
  watchlistItems: [],
  setWatchlistGroups: (watchlistGroups) => set({ watchlistGroups }),
  setWatchlistItems: (watchlistItems) => set({ watchlistItems }),
  selectedWatchlistGroup: null,
  setSelectedWatchlistGroup: (groupId) => set({ selectedWatchlistGroup: groupId }),
  
  // 보유종목
  positions: [],
  setPositions: (positions) => set({ positions }),
  
  // 주문 내역
  orders: [],
  setOrders: (orders) => set({ orders }),
  addOrder: (order) => set((state) => ({ 
    orders: [order, ...state.orders] 
  })),
  updateOrder: (orderId, data) => set((state) => ({
    orders: state.orders.map((order) =>
      order.id === orderId ? { ...order, ...data } : order
    )
  })),
  
  // 연결 상태
  isConnected: false,
  setIsConnected: (isConnected) => set({ isConnected }),
  
  // 사이드바 상태
  sidebarOpen: true,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  
  // 주문 패널 상태
  orderPanelOpen: true,
  setOrderPanelOpen: (orderPanelOpen) => set({ orderPanelOpen }),
}));

// 실시간 시세 업데이트용 셀렉터
export const useSelectedTicker = () => {
  return useTradingStore((state) => {
    if (!state.selectedSymbol) return null;
    return state.tickers[state.selectedSymbol] ?? null;
  });
};

// 포트폴리오 요약용 셀렉터
export const usePortfolioSummary = () => {
  return useTradingStore((state) => calculatePortfolioSummary(state.positions, state.tickers));
};
