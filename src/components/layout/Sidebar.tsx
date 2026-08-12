"use client";

import {
  Kanban,
  LayoutDashboard,
  ListTodo,
  Settings,
  X,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={18} />,
  },
  {
    href: "/tasks/board",
    label: "Kanban Board",
    icon: <Kanban size={18} />,
    badge: "Live",
  },
  {
    href: "/tasks",
    label: "All Tasks",
    icon: <ListTodo size={18} />,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: <Settings size={18} />,
  },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64 flex-col
          border-r border-slate-200/80 bg-white
          shadow-[4px_0_24px_rgba(0,0,0,0.04)]
          transition-transform duration-300 ease-in-out
          md:static md:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Brand Header & Workspace Selector */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 px-4">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex items-center gap-2.5 group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Kanban size={20} strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[15px] font-bold tracking-tight text-slate-900">
                  TaskFlow Pro
                </span>
                <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-600 border border-blue-100">
                  PRO
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-400">Trello Workspace</p>
            </div>
          </Link>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 md:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Workspace Card Header */}
        <div className="mx-3 mt-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white text-xs font-bold">
                TF
              </div>
              <div className="truncate">
                <p className="truncate text-xs font-bold text-slate-800">
                  Engineering Board
                </p>
                <p className="text-[10px] text-slate-500">3 Team Members</p>
              </div>
            </div>
            <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Navigation
          </p>

          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === "/tasks/board" && pathname === "/tasks/board") ||
              (item.href === "/tasks" && pathname === "/tasks");

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  relative flex items-center justify-between rounded-xl px-3.5 py-2.5
                  text-sm font-medium transition-all duration-200 group
                  ${isActive
                    ? "bg-slate-900 text-white shadow-sm shadow-slate-900/10 font-semibold"
                    : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`transition-colors ${isActive ? "text-blue-400" : "text-slate-400 group-hover:text-slate-700"
                      }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isActive
                      ? "bg-blue-500 text-white"
                      : "bg-blue-100 text-blue-700"
                      }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer info card */}
        <div className="p-3 border-t border-slate-100">
          <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 p-3 border border-indigo-100/60">
            <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold">
              <Sparkles size={14} className="text-indigo-600 animate-pulse" />
              <span>Trello Board Sync</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500 leading-snug">
              Real-time drag and drop task management enabled.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

