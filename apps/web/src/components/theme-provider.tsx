import { ScriptOnce } from "@tanstack/react-router";
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Theme = "dark" | "light" | "system";
const MEDIA = "(prefers-color-scheme: dark)";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  systemTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  systemTheme: "light",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "sallify-theme",
  ...props
}: ThemeProviderProps) {
  function getSystemTheme() {
    if (typeof window === "undefined") {
      return "light";
    }

    return window.matchMedia(MEDIA).matches ? "dark" : "light";
  }

  function getInitialTheme(): Theme {
    if (typeof window === "undefined") {
      return defaultTheme;
    }

    const stored = localStorage.getItem(storageKey) as Theme | null;
    if (stored) {
      return stored;
    }

    return defaultTheme;
  }

  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(
    getSystemTheme
  );

  const applyTheme = useCallback(
    (t: Theme) => {
      const root = document.documentElement;
      const resolved = t === "system" ? systemTheme : t;

      root.classList.remove("light", "dark");
      root.classList.add(resolved);
    },
    [systemTheme]
  );

  const handleMediaQuery = useCallback(
    (e: MediaQueryListEvent | MediaQueryList) => {
      const newSystem = e.matches ? "dark" : "light";
      setSystemTheme(newSystem);

      if (theme === "system") {
        applyTheme("system");
      }
    },
    [theme, applyTheme]
  );

  useEffect(() => {
    const media = window.matchMedia(MEDIA);
    media.addEventListener("change", handleMediaQuery);
    handleMediaQuery(media);

    return () => media.removeEventListener("change", handleMediaQuery);
  }, [handleMediaQuery]);

  const setTheme = useCallback(
    (t: Theme) => {
      setThemeState(t);
      localStorage.setItem(storageKey, t);
      applyTheme(t);
    },
    [applyTheme, storageKey]
  );

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  const value = useMemo(
    () => ({
      theme,
      systemTheme,
      setTheme,
    }),
    [theme, systemTheme, setTheme]
  );

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      <ScriptOnce>
        {`
    (function() {
      const stored = localStorage.getItem('${storageKey}');
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

      let resolved;
      if (!stored || stored === 'system') {
        resolved = systemPrefersDark ? 'dark' : 'light';
      } else if (stored === 'dark') {
        resolved = 'dark';
      } else {
        resolved = 'light';
      }

      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(resolved);
    })();
    `}
      </ScriptOnce>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = use(ThemeProviderContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
