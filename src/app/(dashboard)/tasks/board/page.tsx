"use client"; // KanbanBoard Client Component hai (dnd-kit, hooks use karta hai)

import { KanbanBoard } from "@/components/tasks/KanbanBoard";

export default function BoardPage() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <h2 className="flex-shrink-0 px-6 pt-5 pb-2 text-lg font-semibold text-[#232323]">
        My Work Flow Board
      </h2>
      <div className="min-h-0 flex-1">
        <KanbanBoard />
      </div>
    </div>
  );
}

