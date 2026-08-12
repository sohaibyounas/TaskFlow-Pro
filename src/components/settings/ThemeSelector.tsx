"use client";

import { useEffect, useState } from "react";
import { Check, Palette, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export type BoardTheme = "ocean" | "slate" | "sunset";

interface ThemeOption {
  id: BoardTheme;
  name: string;
  description: string;
  gradientClass: string;
  borderActive: string;
}

const THEMES: ThemeOption[] = [
  {
    id: "ocean",
    name: "Default Trello Ocean",
    description: "Vibrant cyan-blue workspace backdrop",
    gradientClass: "from-blue-600 to-indigo-600",
    borderActive: "border-blue-500 ring-2 ring-blue-200",
  },
  {
    id: "slate",
    name: "Midnight Slate",
    description: "Sleek dark mode environment",
    gradientClass: "from-slate-900 to-slate-800",
    borderActive: "border-slate-800 ring-2 ring-slate-400",
  },
  {
    id: "sunset",
    name: "Sunset Glow",
    description: "Deep violet workspace canvas",
    gradientClass: "from-purple-800 to-indigo-900",
    borderActive: "border-purple-500 ring-2 ring-purple-200",
  },
];

function applyTheme(theme: BoardTheme) {
  if (typeof window === "undefined") return;
  document.documentElement.classList.remove(
    "theme-ocean",
    "theme-slate",
    "theme-sunset",
  );
  document.documentElement.classList.add(`theme-${theme}`);

  const mainElement = document.querySelector("main");
  if (mainElement) {
    if (theme === "slate") {
      mainElement.style.backgroundColor = "#0f172a";
    } else if (theme === "sunset") {
      mainElement.style.backgroundColor = "#1e1b4b";
    } else {
      mainElement.style.backgroundColor = "";
    }
  }
}

export function ThemeSelector() {
  const [activeTheme, setActiveTheme] = useState<BoardTheme>(() => {
    if (typeof window === "undefined") return "ocean";
    const saved = localStorage.getItem("taskflow_theme") as BoardTheme;
    if (saved && (saved === "ocean" || saved === "slate" || saved === "sunset")) {
      return saved;
    }
    return "ocean";
  });

  useEffect(() => {
    applyTheme(activeTheme);
  }, [activeTheme]);

  function handleThemeChange(theme: BoardTheme) {
    setActiveTheme(theme);
    localStorage.setItem("taskflow_theme", theme);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette size={18} className="text-purple-600" />
          <h3 className="text-sm font-bold text-slate-900">Workspace Theme</h3>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-600 border border-purple-100">
          <Sparkles size={10} /> Live Color Switch
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {THEMES.map((theme) => {
          const isSelected = activeTheme === theme.id;
          return (
            <motion.div
              key={theme.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleThemeChange(theme.id)}
              className={`
                relative cursor-pointer overflow-hidden rounded-2xl border-2 p-4 transition-all duration-200
                bg-gradient-to-r ${theme.gradientClass} text-white shadow-xs
                ${isSelected
                  ? `${theme.borderActive} shadow-md`
                  : "border-transparent opacity-85 hover:opacity-100"
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold tracking-tight">
                    {theme.name}
                  </h4>
                  <p className="text-xs text-white/80 mt-0.5">
                    {theme.description}
                  </p>
                </div>

                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full transition ${isSelected
                      ? "bg-white text-slate-900 shadow-md"
                      : "bg-white/20 text-white/50"
                    }`}
                >
                  {isSelected && <Check size={14} strokeWidth={3} />}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
