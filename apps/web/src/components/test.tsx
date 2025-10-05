import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      aria-label="Toggle theme"
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted transition hover:bg-accent"
      onClick={() => {
        setTheme(theme === "dark" ? "light" : "dark");
      }}
      type="button"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}
