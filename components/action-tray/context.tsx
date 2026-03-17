import React, { createContext, useContext } from "react";

export type TrayDefinition = {
  contents: ((stepKey?: string, skipEntering?: boolean) => React.ReactNode)[];
  footer?: () => React.ReactNode;
};

export type TrayContextValue = {
  openTray: (id: string) => void;
  close: () => void;
  next: () => void;
  back: () => void;
  index: number;
  total: number;
  registerTray: (id: string, def: TrayDefinition) => void;
  registerFocusable: (ref: React.RefObject<any>) => void;
};

const TrayContext = createContext<TrayContextValue | null>(null);

export const useTray = () => {
  const ctx = useContext(TrayContext);
  if (!ctx) {
    throw new Error("Tray components must be used within <TrayProvider>.");
  }
  return ctx;
};

export { TrayContext };