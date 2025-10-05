import { ScriptOnce } from "@tanstack/react-router";
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type Theme = "dark" | "light" | "system";
const MEDIA = "(prefers-color-scheme: dark)";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

// View Transition wrapper
function startViewTransitionSwitch(callback: () => void) {
  if (!document.startViewTransition) {
    callback();
    return;
  }

  // Simple centered transition
  document.startViewTransition(() => callback());
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
  ...props
}: ThemeProviderProps) {
  const [theme, _setTheme] = useState<Theme>(
    () =>
      (typeof window !== "undefined"
        ? (localStorage.getItem(storageKey) as Theme)
        : null) || defaultTheme
  );

  const handleMediaQuery = useCallback(
    (e: MediaQueryListEvent | MediaQueryList) => {
      if (theme !== "system") {
        return;
      }
      const root = document.documentElement;
      const targetTheme = e.matches ? "dark" : "light";
      root.classList.remove("light", "dark");
      root.classList.add(targetTheme);
    },
    [theme]
  );

  useEffect(() => {
    const media = window.matchMedia(MEDIA);
    media.addEventListener("change", handleMediaQuery);
    handleMediaQuery(media);
    return () => media.removeEventListener("change", handleMediaQuery);
  }, [handleMediaQuery]);

  useEffect(() => {
    const root = document.documentElement;
    let targetTheme: string;

    if (theme === "system") {
      localStorage.removeItem(storageKey);
      targetTheme = window.matchMedia(MEDIA).matches ? "dark" : "light";
    } else {
      localStorage.setItem(storageKey, theme);
      targetTheme = theme;
    }

    root.classList.remove("light", "dark");
    root.classList.add(targetTheme);
  }, [theme, storageKey]);

  const value = useMemo(
    () => ({
      theme,
      setTheme: (newTheme: Theme) => {
        startViewTransitionSwitch(() => _setTheme(newTheme));
      },
    }),
    [theme]
  );

  return (
    <ThemeProviderContext {...props} value={value}>
      <ScriptOnce>
        {`document.documentElement.classList.toggle(
          'dark',
          localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
        )`}
      </ScriptOnce>
      {children}
    </ThemeProviderContext>
  );
}

export const useTheme = () => {
  const context = use(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
