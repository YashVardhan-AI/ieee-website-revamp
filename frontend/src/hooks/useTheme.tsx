/**
 * Light/dark theme with three states: system (the default), light and dark.
 *
 * An explicit choice is stamped onto the root element as `data-theme`, which
 * the stylesheet uses to override the system preference in both directions.
 * "System" stamps nothing, so `prefers-color-scheme` alone decides.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export type ThemeChoice = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'ieee-theme';

interface ThemeContextValue {
  choice: ThemeChoice;
  /** What is actually on screen, with "system" resolved. */
  resolved: 'light' | 'dark';
  setChoice: (choice: ThemeChoice) => void;
  /** Cycle light -> dark -> light, for the header toggle. */
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredChoice(): ThemeChoice {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch {
    // Blocked site data: fall through to the system preference.
  }
  return 'system';
}

function systemPreference(): 'light' | 'dark' {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [choice, setChoiceState] = useState<ThemeChoice>(readStoredChoice);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(systemPreference);

  // Track the system preference so "system" stays live and the toggle's icon
  // reflects what is actually showing.
  useEffect(() => {
    if (!window.matchMedia) return;
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event: MediaQueryListEvent) =>
      setSystemTheme(event.matches ? 'dark' : 'light');
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  const resolved = choice === 'system' ? systemTheme : choice;

  useEffect(() => {
    const root = document.documentElement;
    if (choice === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', choice);
    }
  }, [choice]);

  // Keep the browser UI (address bar, form controls) in step with the page.
  //
  // `index.html` ships two `theme-color` tags scoped with `prefers-color-scheme`
  // so the very first paint - before this runs - already matches. Those cannot
  // express an explicit choice, though: a visitor on a dark OS who picks the
  // light theme would still get dark browser chrome. So once JavaScript is
  // running, this takes ownership: the media-scoped tags are dropped and a
  // single unscoped tag reflects the resolved theme.
  //
  // The colour is read from the page's own surface token rather than written
  // out again here, so it cannot drift from the palette the way a hard-coded
  // hex pair silently did when the palette changed.
  useEffect(() => {
    document
      .querySelectorAll('meta[name="theme-color"][media]')
      .forEach((scoped) => scoped.remove());

    let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]:not([media])');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }

    const surface = getComputedStyle(document.documentElement)
      .getPropertyValue('--surface-page')
      .trim();
    if (surface) meta.setAttribute('content', surface);
  }, [resolved]);

  const setChoice = useCallback((next: ThemeChoice) => {
    setChoiceState(next);
    try {
      if (next === 'system') localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Not fatal: the choice simply will not persist across reloads.
    }
  }, []);

  const toggle = useCallback(() => {
    setChoice(resolved === 'dark' ? 'light' : 'dark');
  }, [resolved, setChoice]);

  const value = useMemo(
    () => ({ choice, resolved, setChoice, toggle }),
    [choice, resolved, setChoice, toggle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside a ThemeProvider');
  return context;
}
