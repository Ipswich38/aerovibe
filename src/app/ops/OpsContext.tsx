"use client";

import { createContext, useContext } from "react";

interface OpsContextValue {
  token: string;
  logout: () => void;
}

export const OpsContext = createContext<OpsContextValue | null>(null);

export function useOps(): OpsContextValue {
  const ctx = useContext(OpsContext);
  if (!ctx) throw new Error("useOps must be used inside /ops");
  return ctx;
}
