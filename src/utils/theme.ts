export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentColor = 'teal' | 'blue' | 'emerald' | 'amber' | 'purple';

let systemMediaQueryListener: ((e: MediaQueryListEvent) => void) | null = null;
let currentSystemMql: MediaQueryList | null = null;

/**
 * Dynamically applies the chosen theme mode (Light / Dark / System) and Accent Color
 * to the document root, body, and CSS variables across the entire Unidwell application.
 */
export function applyThemeToDocument(mode: ThemeMode = 'light', accent: AccentColor = 'teal') {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  const root = document.documentElement;
  const body = document.body;
  const mql = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  const isDarkSystem = mql ? mql.matches : false;

  // Manage system media query listener for real-time OS theme tracking
  if (currentSystemMql && systemMediaQueryListener) {
    if (currentSystemMql.removeEventListener) {
      currentSystemMql.removeEventListener('change', systemMediaQueryListener);
    } else if ((currentSystemMql as any).removeListener) {
      (currentSystemMql as any).removeListener(systemMediaQueryListener);
    }
    systemMediaQueryListener = null;
    currentSystemMql = null;
  }

  if (mode === 'system' && mql) {
    systemMediaQueryListener = () => {
      applyThemeToDocument('system', accent);
    };
    if (mql.addEventListener) {
      mql.addEventListener('change', systemMediaQueryListener);
    } else if ((mql as any).addListener) {
      (mql as any).addListener(systemMediaQueryListener);
    }
    currentSystemMql = mql;
  }

  let activeTheme = mode;
  if (mode === 'system') {
    activeTheme = isDarkSystem ? 'dark' : 'light';
  }

  // Clear existing theme classes & attributes from both <html> and <body>
  root.classList.remove('dark', 'theme-dark', 'theme-light');
  root.removeAttribute('data-theme');
  if (body) {
    body.classList.remove('dark', 'theme-dark', 'theme-light');
    body.removeAttribute('data-theme');
  }

  if (activeTheme === 'dark') {
    root.classList.add('dark', 'theme-dark');
    root.setAttribute('data-theme', 'dark');
    if (body) {
      body.classList.add('dark', 'theme-dark');
      body.setAttribute('data-theme', 'dark');
    }
    root.style.colorScheme = 'dark';
  } else {
    root.classList.add('theme-light');
    root.setAttribute('data-theme', 'light');
    if (body) {
      body.classList.add('theme-light');
      body.setAttribute('data-theme', 'light');
    }
    root.style.colorScheme = 'light';
  }

  // Accent Color Mapping (Brand Default: Teal #0EA5A4 & Blue #2563EB)
  const accentColors: Record<AccentColor, { primary: string; secondary: string; glow: string }> = {
    teal: { primary: '#0EA5A4', secondary: '#2563EB', glow: 'rgba(14, 165, 164, 0.4)' },
    blue: { primary: '#2563EB', secondary: '#4F46E5', glow: 'rgba(37, 99, 235, 0.4)' },
    emerald: { primary: '#22C55E', secondary: '#0EA5A4', glow: 'rgba(34, 197, 94, 0.4)' },
    amber: { primary: '#F59E0B', secondary: '#D97706', glow: 'rgba(245, 158, 11, 0.4)' },
    purple: { primary: '#8B5CF6', secondary: '#6366F1', glow: 'rgba(139, 92, 246, 0.4)' },
  };

  const selected = accentColors[accent] || accentColors.teal;

  root.style.setProperty('--color-primary', selected.primary);
  root.style.setProperty('--color-secondary', selected.secondary);
  root.style.setProperty('--color-accent-glow', selected.glow);
  root.style.setProperty('--btn-primary-gradient', `linear-gradient(135deg, ${selected.primary} 0%, ${selected.secondary} 100%)`);

  // Update theme-color meta tag for mobile & WebView
  try {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      if (activeTheme === 'dark') {
        metaThemeColor.setAttribute('content', '#0F172A');
      } else {
        metaThemeColor.setAttribute('content', '#F8FAFC');
      }
    }
    localStorage.setItem('unidwell-theme', mode);
    localStorage.setItem('unidwell-accent', accent);
  } catch (e) {
    // Non-critical persistence failure
  }
}

/**
 * Initializes the saved theme immediately on startup.
 */
export function getSavedTheme(): { mode: ThemeMode; accent: AccentColor } {
  try {
    const savedMode = (localStorage.getItem('unidwell-theme') as ThemeMode) || 'light';
    const savedAccent = (localStorage.getItem('unidwell-accent') as AccentColor) || 'teal';
    return { mode: savedMode, accent: savedAccent };
  } catch (e) {
    return { mode: 'light', accent: 'teal' };
  }
}
