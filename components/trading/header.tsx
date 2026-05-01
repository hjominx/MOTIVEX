'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTradingStore } from '@/lib/stores/trading-store';
import { signOut } from '@/app/auth/actions';
import {
  Bell, Settings, User, LogOut, Wallet,
  Menu, X, ChevronDown, Circle
} from 'lucide-react';

interface TradingHeaderProps {
  userEmail?: string;
}

export function TradingHeader({ userEmail }: TradingHeaderProps) {
  const { isConnected, sidebarOpen, setSidebarOpen } = useTradingStore();

  return (
    <header className="h-9 border-b border-border/50 bg-background/80 backdrop-blur-xl flex items-center justify-between px-2.5 shrink-0 sticky top-0 z-50">
      {/* Left */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-motivex-navy/5 transition-colors"
        >
          {sidebarOpen
            ? <X className="w-4 h-4 text-muted-foreground" />
            : <Menu className="w-4 h-4 text-muted-foreground" />}
        </button>

        <Link href="/trading" className="flex items-center gap-2 select-none">
          <span className="inline-block sm:hidden w-6 h-6 leading-none rounded text-center text-[12px] font-semibold text-motivex-navy">M</span>
          <span className="hidden sm:inline text-[11px] font-semibold tracking-[0.18em] text-motivex-navy leading-none">MOTIVEX</span>
        </Link>

        <div className="hidden lg:flex items-center gap-0.5 ml-2">
          <NavLink href="/trading" active>한국주식</NavLink>
          <NavLink href="/trading/us">미국주식</NavLink>
          <NavLink href="/trading/crypto">암호화폐</NavLink>
          <NavLink href="/trading/options">옵션</NavLink>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        {/* Live indicator */}
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-[0.12em] ${
          isConnected
            ? 'text-gain bg-gain/10 border border-gain/20'
            : 'text-loss bg-loss/10 border border-loss/20'
        }`}>
          <Circle className="w-1.5 h-1.5 fill-current" />
          {isConnected ? 'LIVE' : 'OFF'}
        </div>

        <Button variant="ghost" size="icon" className="w-7 h-7 relative rounded-md hover:bg-motivex-navy/5">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute top-1.25 right-1.25 w-1.5 h-1.5 bg-loss rounded-full" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-7 gap-1 px-2 rounded-md hover:bg-motivex-navy/5">
              <div className="w-5 h-5 rounded-full bg-motivex-navy flex items-center justify-center">
                <User className="w-3 h-3 text-white" />
              </div>
              <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-[0_20px_50px_rgba(17,24,39,0.08)] border-border/60 bg-background/95 backdrop-blur-xl">
            {userEmail && (
              <>
                <div className="px-3 py-2">
                  <p className="text-[13px] font-medium truncate">{userEmail}</p>
                  <p className="text-xs text-muted-foreground">Basic 등급</p>
                </div>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem asChild>
              <Link href="/trading/portfolio" className="flex items-center gap-2 text-[13px]">
                <Wallet className="w-4 h-4" /> 내 포트폴리오
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/trading/accounts" className="flex items-center gap-2 text-[13px]">
                <Settings className="w-4 h-4" /> 계좌 관리
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-loss focus:text-loss text-[13px]"
              onClick={() => signOut()}
            >
              <LogOut className="w-4 h-4 mr-2" /> 로그아웃
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function NavLink({
  href, children, active = false
}: { href: string; children: React.ReactNode; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded-lg text-[13px] font-medium tracking-[-0.01em] transition-colors ${
        active
          ? 'bg-motivex-navy/5 text-motivex-navy'
          : 'text-muted-foreground hover:text-motivex-navy hover:bg-motivex-navy/5'
      }`}
    >
      {children}
    </Link>
  );
}
