import type React from "react";
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider>
      <div className="corner-shape corner-shape-top-left"></div>
      <div className="corner-shape corner-shape-top-right"></div>
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="pb-16 md:pb-0 md:pt-16">{children}</div>
    </ThemeProvider>
  );
}
