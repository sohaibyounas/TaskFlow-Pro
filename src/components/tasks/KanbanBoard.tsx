"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { AlertCircle, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TaskColumn } from "./TaskColumn";
import { TaskCard } from "./TaskCard";
import { useTasksByStatus } from "@/hooks/useTasksByStatus";
import { useUpdateTask } from "@/hooks/useTaskMutations";
import type { Task, TaskStatus } from "@/types/task";
import { TaskCardSkeleton } from "./TaskCardSkeleton";

type FilterTab = "all" | TaskStatus;

export function KanbanBoard() {
  const { columns, isLoading, isError } = useTasksByStatus();
  const updateTaskMutation = useUpdateTask();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedMobileTab, setSelectedMobileTab] = useState<FilterTab>("all");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragStart(event: DragStartEvent) {
    const task = columns
      .flatMap((c) => c.tasks)
      .find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTaskId = active.id as string;
    const overId = over.id as string;

    const allTasks = columns.flatMap((c) => c.tasks);
    const draggedTask = allTasks.find((t) => t.id === activeTaskId);
    if (!draggedTask) return;

    const validStatuses: TaskStatus[] = [
      "todo",
      "in-progress",
      "review",
      "done",
    ];
    const targetStatus = validStatuses.includes(overId as TaskStatus)
      ? (overId as TaskStatus)
      : allTasks.find((t) => t.id === overId)?.status;

    if (!targetStatus || targetStatus === draggedTask.status) return;

    updateTaskMutation.mutate({
      id: activeTaskId,
      input: { status: targetStatus },
    });
  }

  if (isError)
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 border border-rose-100">
          <AlertCircle size={28} />
        </div>
        <div>
          <p className="text-base font-bold text-slate-800">Failed to load board</p>
          <p className="mt-1 text-sm text-slate-500">Something went wrong while fetching workspace cards.</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Refresh Board
        </button>
      </div>
    );

  const displayedColumns = selectedMobileTab === "all"
    ? columns
    : columns.filter((col) => col.status === selectedMobileTab);

  return (
    <div className="flex h-full flex-col">
      {/* Mobile Responsive Column Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto px-4 py-2 sm:hidden border-b border-slate-200/80 bg-white/90 backdrop-blur-xs scrollbar-hide">
        <button
          onClick={() => setSelectedMobileTab("all")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition flex-shrink-0 ${
            selectedMobileTab === "all"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Layers size={13} />
          All Columns
        </button>
        {columns.map((col) => (
          <button
            key={col.status}
            onClick={() => setSelectedMobileTab(col.status)}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition flex-shrink-0 ${
              selectedMobileTab === col.status
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span>{col.title}</span>
            <span className="rounded-full bg-black/10 px-1.5 py-0.2 text-[10px]">
              {col.tasks.length}
            </span>
          </button>
        ))}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-1 min-h-0 gap-4 overflow-x-auto p-4 md:p-6 scrollbar-hide">
          {isLoading ? (
            <>
              {[1, 2, 3, 4].map((colIndex) => (
                <div
                  key={colIndex}
                  className="flex w-72 sm:w-80 flex-shrink-0 flex-col rounded-2xl bg-slate-100/90 p-4 border border-slate-200/80 animate-pulse"
                >
                  <div className="h-5 w-28 rounded-lg bg-slate-200 mb-4" />
                  <div className="space-y-3">
                    <TaskCardSkeleton />
                    <TaskCardSkeleton />
                  </div>
                </div>
              ))}
            </>
          ) : (
            <AnimatePresence mode="popLayout">
              {displayedColumns.map((column) => (
                <motion.div
                  key={column.status}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-shrink-0"
                >
                  <TaskColumn
                    status={column.status}
                    title={column.title}
                    tasks={column.tasks}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="rotate-2 scale-105 opacity-90 shadow-2xl">
              <TaskCard task={activeTask} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

