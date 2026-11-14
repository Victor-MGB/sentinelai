'use client';

import { Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  function toggleTheme() {
    const root = document.documentElement;
    const isDark = root.classList.toggle('dark');

    try {
      window.localStorage.setItem('sentinelai-theme', isDark ? 'dark' : 'light');
    } catch {
      // Storage can be unavailable in private browsing; the in-memory toggle still works.
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="relative"
      onClick={toggleTheme}
      aria-label="Toggle color theme"
    >
      <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
