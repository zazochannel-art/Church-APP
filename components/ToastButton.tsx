"use client";

import type { ReactNode } from "react";
import { useToast } from "./Toast";

/** Placeholder action until the backend exists: shows what would happen. */
export function ToastButton({ message, className = "btn ghost sm", children }: { message: string; className?: string; children: ReactNode }) {
  const toast = useToast();
  return (
    <button type="button" className={className} onClick={() => toast(message)}>
      {children}
    </button>
  );
}
