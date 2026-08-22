"use client";
import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

const emptySubscribe = () => () => {};

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const isClient = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  return (
    <NextThemesProvider
      {...props}
      {...(isClient ? { scriptProps: { type: "text/none" } } : {})}
    >
      {children}
    </NextThemesProvider>
  );
}
