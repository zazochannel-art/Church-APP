"use client";

import { useEffect, useState, type ReactNode } from "react";

/** A delete button that asks "Sigur?" on the first tap instead of a browser dialog. */
export function ConfirmButton({
  onConfirm,
  children,
  confirmText = "Sigur? Atinge din nou",
  className = "btn ghost sm",
  label,
}: {
  onConfirm: () => void;
  children: ReactNode;
  confirmText?: string;
  className?: string;
  label?: string;
}) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3500);
    return () => clearTimeout(t);
  }, [armed]);
  return (
    <button
      type="button"
      className={`${className} ${armed ? "danger" : ""}`}
      aria-label={armed ? confirmText : label}
      onClick={() => (armed ? (setArmed(false), onConfirm()) : setArmed(true))}
    >
      {armed ? confirmText : children}
    </button>
  );
}
