'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  if (!mounted) return <div className="h-8 w-[68px] rounded-lg border bg-muted/50" aria-label="Theme preference" />;
  return (
    <div className="flex items-center rounded-lg border bg-muted/50 p-0.5" aria-label="Theme preference">
      <Button
        type="button"
        variant={theme === 'light' ? 'secondary' : 'ghost'}
        size="icon-xs"
        aria-label="Use light theme"
        aria-pressed={theme === 'light'}
        onClick={() => setTheme('light')}
      >
        <Sun />
      </Button>
      <Button
        type="button"
        variant={theme === 'dark' ? 'secondary' : 'ghost'}
        size="icon-xs"
        aria-label="Use dark theme"
        aria-pressed={theme === 'dark'}
        onClick={() => setTheme('dark')}
      >
        <Moon />
      </Button>
    </div>
  );
}
