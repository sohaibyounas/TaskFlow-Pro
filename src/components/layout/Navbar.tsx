"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Menu,
  Search,
  Bell,
  LogOut,
  AlertTriangle,
  X,
  Loader2,
  Kanban,
} from "lucide-react";

interface NavbarProps {
  onMenuClick: () => void;
}

function LogoutConfirmModal({
  isOpen,
  isLoading,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-fade-in">
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
        >
          <X size={16} />
        </button>

        <div className="mb-4 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 border border-red-100">
            <AlertTriangle size={28} />
          </div>
        </div>

        <div className="mb-6 text-center">
          <h3 className="text-lg font-bold text-slate-900">Sign Out</h3>
          <p className="mt-1 text-sm text-slate-500">
            Are you sure you want to log out of TaskFlow Pro?
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-500/20 transition hover:bg-red-700 disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <span>Logging out...</span>
                <Loader2 size={16} className="animate-spin" />
              </>
            ) : (
              <span>Logout</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function NavbarContent({ onMenuClick }: NavbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") ?? "");

  const [currentUser, setCurrentUser] = useState<{
    name: string;
    initials: string;
    role: string;
  }>({
    name: "Sohaib Younas",
    initials: "SY",
    role: "Workspace Admin",
  });

  useState(() => {
    async function checkUser() {
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (url && key && url.startsWith("http")) {
          const supabase = createClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user) {
            const name =
              user.user_metadata?.username ||
              user.user_metadata?.full_name ||
              user.email?.split("@")[0] ||
              "User";
            const initials = name
              .split(" ")
              .filter(Boolean)
              .map((w: string) => w[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);
            setCurrentUser({
              name,
              initials: initials || "U",
              role: "Workspace Member",
            });
          }
        }
      } catch {
        // Fallback
      }
    }
    checkUser();
  });

  async function handleConfirmLogout() {
    setIsLoggingOut(true);
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (url && key && url.startsWith("http")) {
        const supabase = createClient();
        await supabase.auth.signOut();
      }
    } catch {
      // Ignore error when in mock mode
    }
    router.refresh();
    router.push("/login");
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setSearchQuery(val);

    const params = new URLSearchParams(searchParams.toString());
    if (val.trim()) {
      params.set("search", val);
    } else {
      params.delete("search");
    }

    if (pathname === "/tasks") {
      router.replace(`/tasks?${params.toString()}`);
    } else {
      router.push(`/tasks?${params.toString()}`);
    }
  }

  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "Ayesha Khan commented on 'Framer Motion Animations'",
      time: "5 minutes ago",
      unread: true,
      type: "comment",
    },
    {
      id: "2",
      title: "Task 'Supabase API Fallback' was moved to Done",
      time: "30 minutes ago",
      unread: true,
      type: "task",
    },
    {
      id: "3",
      title: "Card 'Design System Specs' is due today",
      time: "2 hours ago",
      unread: true,
      type: "due",
    },
    {
      id: "4",
      title: "Hamza Malik joined Engineering Workspace",
      time: "1 day ago",
      unread: false,
      type: "member",
    },
  ]);

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    setUnreadCount(0);
  }

  return (
    <>
      <header className="relative flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-3 sm:px-6">
        {/* Left Side: Mobile Menu + Brand Logo + Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="rounded-xl p-1.5 sm:p-2 text-slate-600 hover:bg-slate-100 md:hidden transition flex-shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2 md:hidden min-w-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white flex-shrink-0">
              <Kanban size={16} />
            </div>
            <span className="text-sm sm:text-base font-bold text-slate-900 tracking-tight whitespace-nowrap truncate">
              TaskFlow Pro
            </span>
          </div>

          {/* Search Bar - Desktop & Tablet */}
          <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 min-w-[220px] md:min-w-[300px] focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <Search size={16} className="text-slate-400 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search tasks, tags, assignees..."
              className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
            />
          </div>
        </div>

        {/* Right Side: Notifications, User Avatar & Logout */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          {/* Notification Button & Popover */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-xl p-1.5 sm:p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
              )}
            </button>

            {/* Notifications Floating Card Popover */}
            {showNotifications && (
              <div className="absolute right-0 top-11 z-50 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">
                      Notifications
                    </h4>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <button
                    onClick={markAllRead}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`rounded-xl p-2.5 transition text-xs border ${
                        n.unread
                          ? "bg-blue-50/60 border-blue-100 text-slate-900 font-medium"
                          : "bg-slate-50/50 border-slate-100 text-slate-600"
                      }`}
                    >
                      <p className="leading-snug">{n.title}</p>
                      <span className="mt-1 block text-[10px] text-slate-400">
                        {n.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-5 sm:h-6 w-px bg-slate-200 mx-0.5" />

          {/* User Profile Info */}
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs ring-2 ring-blue-100 flex-shrink-0">
              {currentUser.initials}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-slate-900 leading-none">
                {currentUser.name}
              </p>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                {currentUser.role}
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 sm:px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 hover:text-red-600 transition"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <LogoutConfirmModal
        isOpen={showConfirm}
        isLoading={isLoggingOut}
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}

export function Navbar(props: NavbarProps) {
  return (
    <Suspense
      fallback={
        <header className="relative flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-3 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={props.onMenuClick}
              className="rounded-xl p-1.5 sm:p-2 text-slate-600 hover:bg-slate-100 md:hidden transition flex-shrink-0"
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-1.5 sm:gap-2 md:hidden min-w-0">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white flex-shrink-0">
                <Kanban size={16} />
              </div>
              <span className="text-sm sm:text-base font-bold text-slate-900 tracking-tight whitespace-nowrap truncate">
                TaskFlow Pro
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 min-w-[220px] md:min-w-[300px]">
              <Search size={16} className="text-slate-400 flex-shrink-0" />
              <div className="h-4 w-32 bg-slate-200 animate-pulse rounded" />
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-slate-200 animate-pulse" />
          </div>
        </header>
      }
    >
      <NavbarContent {...props} />
    </Suspense>
  );
}

