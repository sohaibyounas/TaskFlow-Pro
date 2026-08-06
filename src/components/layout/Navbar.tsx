// src/components/layout/Navbar.tsx
"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Flower } from "lucide-react";

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push("/login");
  }

  return (
    <header className="flex h-14 flex-shrink-0 items-center justify-between border-b bg-white px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded p-1.5 hover:bg-gray-100 md:hidden text-[#232323]"
          aria-label="Open menu"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" />
          </svg>
        </button>
        <div className=" flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-[#232323]">
            TaskFlow Pro
          </span>
          <span>
            <Flower color="#101828" size={20} />
          </span>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="text-xs p-1 rounded-[8px] text-gray-600 hover:text-gray-900 border border-[#232323]"
      >
        Logout
      </button>
    </header>
  );
}
