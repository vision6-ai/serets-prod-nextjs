"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactNode } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      disableTransitionOnChange={false}
      storageKey="serets-theme"
      themes={['light', 'dark']}
      value={{
        light: 'light',
        dark: 'dark',
        system: 'system'
      }}
    >
      {children}
    </NextThemesProvider>
  );
}