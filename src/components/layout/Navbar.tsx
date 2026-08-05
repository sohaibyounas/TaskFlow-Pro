"use client"; 

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <header className="flex h-14 flex-shrink-0 items-center justify-between border-b bg-white px-4 md:px-6">
      <div className="flex items-center gap-3">
        {/* Hamburger — sirf mobile pe dikhega */}
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
        <h1 className="text-sm font-semibold text-[#232323]">TaskFlow Pro</h1>
      </div>
    </header>
  );
}
