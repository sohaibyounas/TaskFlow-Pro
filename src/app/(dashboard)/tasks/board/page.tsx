"use client"; // KanbanBoard Client Component hai (dnd-kit, hooks use karta hai)

import { KanbanBoard } from "@/components/tasks/KanbanBoard";

export default function BoardPage() {
  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-[#232323] pl-[23px] pt-4">My Work Flow Board</h2>
      <KanbanBoard />
    </div>
  );
}
