"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { TaskCard } from "./TaskCard";
import type { Task, TaskStatus } from "@/types/task";
import { Plus, MoreHorizontal, Circle, Sparkles, CheckCircle2, Clock, FileText } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { TaskForm } from "./TaskForm";

interface TaskColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  onAddTask?: (status: TaskStatus) => void;
}

const COLUMN_HEADER_THEMES: Record<
  TaskStatus,
  { dot: string; bg: string; text: string; icon: React.ReactNode }
> = {
  todo: {
    dot: "bg-slate-400",
    bg: "bg-slate-100",
    text: "text-slate-700",
    icon: <Circle size={14} className="text-slate-400" />,
  },
  "in-progress": {
    dot: "bg-blue-500",
    bg: "bg-blue-50",
    text: "text-blue-700",
    icon: <Clock size={14} className="text-blue-500" />,
  },
  review: {
    dot: "bg-amber-500",
    bg: "bg-amber-50",
    text: "text-amber-700",
    icon: <FileText size={14} className="text-amber-500" />,
  },
  done: {
    dot: "bg-emerald-500",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    icon: <CheckCircle2 size={14} className="text-emerald-500" />,
  },
};

export function TaskColumn({ status, title, tasks }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const [showAddModal, setShowAddModal] = useState(false);
  const theme = COLUMN_HEADER_THEMES[status];

  return (
    <>
      <div
        ref={setNodeRef}
        className={`
          flex w-72 sm:w-80 flex-shrink-0 flex-col rounded-2xl bg-slate-100/90 p-3.5
          border border-slate-200/80 shadow-xs transition-all duration-200
          ${isOver ? "bg-blue-50/90 border-blue-300 ring-2 ring-blue-400/40 scale-[1.01]" : ""}
        `}
      >
        {/* Column Header */}
        <div className="mb-3 flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            {theme.icon}
            <h3 className="text-sm font-bold tracking-tight text-slate-800">
              {title}
            </h3>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold ${theme.bg} ${theme.text}`}
            >
              {tasks.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowAddModal(true)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
              title="Add a card"
            >
              <Plus size={16} />
            </button>
            <button
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
              title="List actions"
            >
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>

        {/* Column Tasks List */}
        <div className="min-h-[150px] flex-1 space-y-1 overflow-y-auto">
          <SortableContext
            items={tasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </SortableContext>

          {/* Empty Column Placeholder */}
          {tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 px-4 rounded-xl border border-dashed border-slate-200 bg-white/50 text-center">
              <Sparkles size={20} className="text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-500">No cards in {title}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Drag cards here or create one</p>
            </div>
          )}
        </div>

        {/* Trello Inline Quick Add Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="mt-2 flex items-center gap-2 w-full rounded-xl px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/80 hover:text-slate-900 transition text-left"
        >
          <Plus size={15} />
          <span>Add a card</span>
        </button>
      </div>

      {/* Quick Add Task Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={`Add Card to ${title}`}
      >
        <TaskForm
          onSuccess={() => setShowAddModal(false)}
          task={undefined}
        />
      </Modal>
    </>
  );
}

