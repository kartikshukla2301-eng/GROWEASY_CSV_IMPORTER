"use client";

import { useEffect, useState } from "react";

type ToastVariant = "success" | "error" | "info";

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  onDismiss: () => void;
}

const variantClasses: Record<ToastVariant, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-accent-200 bg-accent-50 text-accent-800",
};

export function Toast({ message, variant = "info", onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Small delay to allow CSS transition to play
    const showTimer = setTimeout(() => setVisible(true), 10);
    const dismissTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 4000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(dismissTimer);
    };
  }, [onDismiss]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={[
        "fixed bottom-6 right-6 z-50 max-w-sm rounded-lg border px-4 py-3 text-sm shadow-card",
        "transition-all duration-300",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
        variantClasses[variant],
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <span>{message}</span>
        <button
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="shrink-0 rounded p-0.5 opacity-60 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
