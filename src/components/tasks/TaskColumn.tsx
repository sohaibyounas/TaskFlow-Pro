"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { TaskCard } from "./TaskCard";
import type { Task, TaskStatus } from "@/types/task";

interface TaskColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
}

const COLUMN_HEADER_COLORS: Record<TaskStatus, string> = {
  todo: "border-t-gray-400",
  "in-progress": "border-t-blue-400",
  review: "border-t-amber-400",
  done: "border-t-green-400",
};

export function TaskColumn({ status, title, tasks }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`flex w-72 flex-shrink-0 flex-col rounded-lg border-t-4 bg-gray-50 p-3 ${COLUMN_HEADER_COLORS[status]} ${
        isOver ? "bg-blue-50 ring-2 ring-blue-200" : ""
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600">
          {tasks.length}
        </span>
      </div>

      {/* SortableContext — is column ke andar jitne cards hain,
          unko ek "sortable group" bana deta hai (reorder karne ke liye) */}
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
          {tasks.length === 0 && (
            <p className="py-8 text-center text-xs text-gray-400">
              There is no task added here.
            </p>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
