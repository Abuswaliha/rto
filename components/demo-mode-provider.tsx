"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type DemoModeContextValue = { enabled: boolean; setEnabled: (enabled: boolean) => void };
const DemoModeContext = createContext<DemoModeContextValue>({ enabled: true, setEnabled: () => undefined });

export function DemoModeProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabledState] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setEnabledState(localStorage.getItem("smart-rto-demo-mode") !== "off"), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const value = useMemo(() => ({
    enabled,
    setEnabled: (next: boolean) => {
      localStorage.setItem("smart-rto-demo-mode", next ? "on" : "off");
      setEnabledState(next);
    },
  }), [enabled]);

  return <DemoModeContext.Provider value={value}>{children}</DemoModeContext.Provider>;
}

export function useDemoMode() {
  return useContext(DemoModeContext);
}
