// src/components/layout/Navbar.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Flower, AlertTriangle, X, Loader2 } from "lucide-react";

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
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-600 transition hover:bg-gray-100"
        >
          <X size={16} />
        </button>

        <div className="mb-4 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle size={28} className="text-red-500" />
          </div>
        </div>

        <div className="mb-6 text-center">
          <p className="mt-2 text-sm text-gray-500">
            Are you sure you want to logout ?
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-600 disabled:opacity-70"
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

export function Navbar({ onMenuClick }: NavbarProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleConfirmLogout() {
    setIsLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push("/login");
  }

  return (
    <>
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
          <div className="flex items-center justify-between gap-2">
            <span className="text-[17px] font-semibold text-[#232323]">
              TaskFlow Pro
            </span>
            <Flower size={23} strokeWidth={2.2} className="text-[#101828]" />
          </div>
        </div>

        <button
          onClick={() => setShowConfirm(true)}
          className="rounded bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          Logout
        </button>
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
