"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { BarChart2, Home } from "lucide-react";

export function NavBar() {
  const [currentPath, setCurrentPath] = useState("/");

  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:top-0 md:bottom-auto bg-background border-t md:border-b md:border-t-0 py-2 px-4">
      <div className="container mx-auto flex justify-center md:justify-start items-center gap-4">
        <a
          href="/"
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
            currentPath === "/"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          <Home className="h-4 w-4" />
          <span className="hidden md:inline">Home</span>
        </a>
        <a
          href="/analytics"
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
            currentPath === "/analytics"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          <BarChart2 className="h-4 w-4" />
          <span className="hidden md:inline">Analytics</span>
        </a>
      </div>
    </div>
  );
}
