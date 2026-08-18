'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutGrid, Wallet, ArrowLeftRight, TrendingUp,
  LineChart, Settings, LogOut, Menu, X, LoaderCircle,
} from 'lucide-react';
import LogoLongLight from '../Asserts/logo long light.png';
import LogoLongDark from '../Asserts/logo long dark.png';
import { Button } from '@/components/ui/button';
import { logout } from '@/app/auth-actions';
import { ThemeToggle } from '@/components/theme-toggle';
import { useState, useEffect, useRef, type MouseEvent } from 'react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/accounts', label: 'Accounts', icon: Wallet },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/assets', label: 'Assets', icon: TrendingUp },
  { href: '/investments', label: 'Investments', icon: LineChart },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function NavSlide() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [navigationTarget, setNavigationTarget] = useState<string | null>(null);
  const navigationLock = useRef(false);

  useEffect(() => {
    if (navigationTarget === pathname) {
      navigationLock.current = false;
    }
  }, [navigationTarget, pathname]);

  const isNavigating = navigationTarget !== null && navigationTarget !== pathname;

  function handleNavigation(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (navigationLock.current || pathname === href) {
      event.preventDefault();
      return;
    }

    navigationLock.current = true;
    setNavigationTarget(href);
    setOpen(false);
  }

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const navLinks = (
    <nav className="flex flex-col gap-1.5">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== '/dashboard' && pathname?.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={(event) => handleNavigation(event, item.href)}
            aria-disabled={isNavigating}
            className={`flex items-center gap-3.5 px-3 py-2.5 rounded-2xl transition-all duration-200 ${
              isActive
                ? 'bg-blue-50/90 dark:bg-blue-950/60 shadow-sm border border-blue-100 dark:border-blue-900/50'
                : 'hover:bg-muted/60 text-slate-600 dark:text-slate-400'
            }`}
          >
            <div
              className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-2 ring-blue-600/20'
                  : 'bg-muted/80 text-slate-600 dark:text-slate-400'
              }`}
            >
              {isNavigating && navigationTarget === item.href ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Icon className="h-5 w-5 stroke-[2.2]" />}
            </div>
            <span
              className={`font-semibold text-sm ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* ── Mobile hamburger button ── */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-card/90 backdrop-blur-md border border-border shadow-md"
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle navigation"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* ── Backdrop for mobile drawer ── */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-xs"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* ── Sidebar (drawer on mobile, static on desktop) ── */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-40
          w-64 h-screen
          border-r bg-card/60 backdrop-blur-md
          flex flex-col justify-between p-4
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:block shrink-0
        `}
      >
        <div className="space-y-6">
          {/* Logo */}
          <div className="px-2 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src={LogoLongLight}
                alt="DreamPaisa Logo"
                className="dark:hidden max-h-10 w-auto object-contain"
                priority
              />
              <Image
                src={LogoLongDark}
                alt="DreamPaisa Logo"
                className="hidden dark:block max-h-10 w-auto object-contain"
                priority
              />
            </Link>
          </div>

          {navLinks}
        </div>

        <div className="pt-4 border-t border-border/50 flex flex-col gap-3">
          <div className="flex justify-center w-full">
            <ThemeToggle />
          </div>
          <Button
            variant="outline"
            className="w-full flex items-center gap-2 justify-center border-destructive/30 text-destructive hover:bg-destructive/10"
            onClick={() => logout()}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* ── Mobile bottom nav ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-card/95 backdrop-blur-md border-t border-border flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname?.startsWith(item.href));

          return (
            <Link
            key={item.href}
            href={item.href}
            onClick={(event) => handleNavigation(event, item.href)}
            aria-disabled={isNavigating}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div
                className={`p-1.5 rounded-lg transition-all ${
                  isActive ? 'bg-blue-100 dark:bg-blue-950' : ''
                }`}
              >
                {isNavigating && navigationTarget === item.href ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Icon className="h-5 w-5 stroke-[2]" />}
              </div>
              <span className="text-[10px] font-semibold leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
