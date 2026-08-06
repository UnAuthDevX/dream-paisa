'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only fires on the client, ensuring server-client structural alignment
  useEffect(() => {
    setMounted(true);
  }, []);

  // Server/initial client skeleton matching your container size
  if (!mounted) {
    return (
      <div className="flex items-center rounded-lg border bg-muted/50 p-0.5 w-[68px] h-8" aria-label="Theme preference">
        <div className="w-7 h-7" />
        <div className="w-7 h-7" />
      </div>
    );
  }

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

