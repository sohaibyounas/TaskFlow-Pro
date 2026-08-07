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
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b bg-white px-4 md:px-6">
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
          <span className="text-[17px] font-semibold text-[#232323]">
            TaskFlow Pro
          </span>
          <span>
            <Flower size={23} strokeWidth={2.2} className="text-[#101828]" />
          </span>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        Logout
      </button>
    </header>
  );
}
