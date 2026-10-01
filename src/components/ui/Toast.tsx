"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  X,
} from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, "id">) => void;
  removeToast: (id: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let globalToastHandler: ((toast: Omit<ToastItem, "id">) => void) | null = null;

export const toast = {
  success: (message: string, title?: string) => {
    globalToastHandler?.({ type: "success", message, title });
  },
  error: (message: string, title?: string) => {
    globalToastHandler?.({ type: "error", message, title });
  },
  info: (message: string, title?: string) => {
    globalToastHandler?.({ type: "info", message, title });
  },
  warning: (message: string, title?: string) => {
    globalToastHandler?.({ type: "warning", message, title });
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (item: Omit<ToastItem, "id">) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newToast: ToastItem = { ...item, id };
      setToasts((prev) => [...prev, newToast]);

      const duration = item.duration ?? 5000;
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast],
  );

  React.useEffect(() => {
    globalToastHandler = showToast;
    return () => {
      globalToastHandler = null;
    };
  }, [showToast]);

  const success = useCallback(
    (message: string, title?: string) => showToast({ type: "success", message, title }),
    [showToast],
  );
  const error = useCallback(
    (message: string, title?: string) => showToast({ type: "error", message, title }),
    [showToast],
  );
  const info = useCallback(
    (message: string, title?: string) => showToast({ type: "info", message, title }),
    [showToast],
  );
  const warning = useCallback(
    (message: string, title?: string) => showToast({ type: "warning", message, title }),
    [showToast],
  );

  return (
    <ToastContext.Provider
      value={{ showToast, removeToast, success, error, info, warning }}
    >
      {children}

      {/* Floating Toast Container */}
      <aside
        aria-label="Notifications"
        className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 w-full max-w-[92vw] sm:max-w-md pointer-events-none"
      >
        <AnimatePresence mode="sync">
          {toasts.map((item) => (
            <ToastCard key={item.id} item={item} onDismiss={() => removeToast(item.id)} />
          ))}
        </AnimatePresence>
      </aside>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}

function ToastCard({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: () => void;
}) {
  const config = {
    success: {
      border: "border-emerald-500/40 bg-slate-900/95 text-slate-100",
      iconColor: "text-emerald-400 bg-emerald-500/10",
      accent: "bg-emerald-500",
      Icon: CheckCircle2,
      defaultTitle: "Success",
    },
    error: {
      border: "border-rose-500/40 bg-slate-900/95 text-slate-100",
      iconColor: "text-rose-400 bg-rose-500/10",
      accent: "bg-rose-500",
      Icon: AlertCircle,
      defaultTitle: "Error",
    },
    warning: {
      border: "border-amber-500/40 bg-slate-900/95 text-slate-100",
      iconColor: "text-amber-400 bg-amber-500/10",
      accent: "bg-amber-500",
      Icon: AlertTriangle,
      defaultTitle: "Warning",
    },
    info: {
      border: "border-blue-500/40 bg-slate-900/95 text-slate-100",
      iconColor: "text-blue-400 bg-blue-500/10",
      accent: "bg-blue-500",
      Icon: Info,
      defaultTitle: "Information",
    },
  }[item.type];

  const IconComponent = config.Icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.15 } }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      role="alert"
      className={`pointer-events-auto relative flex items-start gap-3 rounded-2xl border p-3.5 sm:p-4 shadow-2xl backdrop-blur-xl ${config.border}`}
    >
      <div
        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${config.iconColor}`}
      >
        <IconComponent size={20} />
      </div>

      <div className="flex-1 min-w-0 pr-2">
        <h4 className="text-xs sm:text-sm font-bold tracking-tight text-white">
          {item.title ?? config.defaultTitle}
        </h4>
        <p className="mt-0.5 text-xs text-slate-300 leading-relaxed break-words">
          {item.message}
        </p>
      </div>

      <button
        onClick={onDismiss}
        aria-label="Close notification"
        className="flex-shrink-0 rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}
