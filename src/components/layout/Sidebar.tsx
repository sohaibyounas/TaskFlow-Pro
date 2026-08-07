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
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={19} />,
  },
  {
    href: "/tasks",
    label: "Tasks",
    icon: <ListTodo size={19} />,
  },
  {
    href: "/tasks/board",
    label: "Board",
    icon: <Kanban size={19} />,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: <Settings size={19} />,
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
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] md:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64 flex-col
          border-r border-[#E5E7EB] bg-white
          shadow-[2px_0_12px_rgba(0,0,0,0.03)]
          transition-transform duration-200 ease-in-out
          md:static md:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Brand Header */}
        <div className="flex h-16 shrink-0 items-center border-b border-[#E5E7EB] px-5">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="w-full flex items-center justify-between gap-2.5"
          >
            <span className="text-[17px] font-semibold tracking-[-0.02em] text-[#101828]">
              TaskFlow Pro
            </span>

            <Flower size={23} strokeWidth={2.2} className="text-[#101828]" />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href === "/tasks" &&
                  pathname.startsWith("/tasks/") &&
                  pathname !== "/tasks/board");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    group flex w-full items-center justify-between
                    rounded-lg px-3 py-2.5
                    text-[15px] font-medium
                    transition-all duration-150
                    ${
                      isActive
                        ? "bg-[#101828] text-white shadow-sm"
                        : "text-[#475467] hover:bg-[#a6adad] hover:text-[#101828]"
                    }
                  `}
                >
                  <span>{item.label}</span>

                  <span
                    className={`
                      transition-colors
                      ${
                        isActive
                          ? "text-white"
                          : "text-[#667085] group-hover:text-[#101828]"
                      }
                    `}
                  >
                    {item.icon}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
}
