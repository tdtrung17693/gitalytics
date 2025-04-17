"use client";

import { useTheme } from "./theme-provider";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDarkMode = theme === "dark";

  // Ensure component is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full w-10 h-10 bg-background border border-border"
      aria-label={`Switch to ${isDarkMode ? "light" : "dark"} theme`}
    >
      {isDarkMode ? (
        <Sun className="h-5 w-5 text-primary transition-colors" />
      ) : (
        <Moon className="h-5 w-5 text-primary transition-colors" />
      )}
    </Button>
  );
}
