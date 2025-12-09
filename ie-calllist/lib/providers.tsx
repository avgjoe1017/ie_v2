'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  const applyTheme = useCallback((theme: string) => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System preference
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, []);

  useEffect(() => {
    // Defer setState to avoid synchronous state update in effect
    setTimeout(() => {
      setMounted(true);
    }, 0);
    
    // Read initial theme from localStorage
    try {
      const stored = localStorage.getItem('ie-theme');
      if (stored) {
        const parsed = JSON.parse(stored);
        applyTheme(parsed.state?.theme || 'system');
      } else {
        applyTheme('system');
      }
    } catch {
      applyTheme('system');
    }

    // Listen for storage changes (theme updates from settings page)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'ie-theme' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          applyTheme(parsed.state?.theme || 'system');
        } catch {
          // ignore
        }
      }
    };

    // Listen for custom theme change events
    const handleThemeChange = (e: CustomEvent) => {
      applyTheme(e.detail);
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('theme-change', handleThemeChange as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('theme-change', handleThemeChange as EventListener);
    };
  }, [applyTheme]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>{children}</ThemeProvider>
    </QueryClientProvider>
  );
}
