"use client";

import {
  Flower,
  Kanban,
  LayoutDashboard,
  ListTodo,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard /> },
  { href: "/tasks", label: "Tasks", icon: <ListTodo /> },
  { href: "/tasks/board", label: "Board", icons: <Kanban /> },
  { href: "/settings", label: "Settings", icon: <Settings /> },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {mobileOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-56 flex-shrink-0 border-r bg-white
          transition-transform duration-200 ease-in-out
          md:static md:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex h-14 items-center border-b px-4 md:hidden">
          <div className="w-full flex items-center justify-between gap-1">
            <span className="text-sm font-semibold text-[#232323]">
              TaskFlow Pro
            </span>
            <span>
              <Flower color="#101828" size={20} />
            </span>
          </div>
        </div>

        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`block rounded px-3 py-2 text-sm ${
                  isActive
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
