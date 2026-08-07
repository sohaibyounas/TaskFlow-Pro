"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInfiniteTasks } from "@/hooks/useInfiniteTasks";
import { useDeleteTask } from "@/hooks/useTaskMutations";
import { TaskForm } from "@/components/tasks/TaskForm";
import { Modal } from "@/components/ui/Modal";
import { DeleteConfirmModal } from "@/components/ui/DeleteConfirmModal";
import type { Task, TaskPriority, TaskStatus } from "@/types/task";
import { LoaderCircle, MoreHorizontal, Edit2, Trash2 } from "lucide-react";

// ── Color maps (same as board) ────────────────────────────────────────────────

const PRIORITY_STYLES: Record<TaskPriority, { bg: string; text: string; label: string }> = {
  low:    { bg: "#F3F4F6", text: "#4B5563", label: "Low" },
  medium: { bg: "#DBEAFE", text: "#1D4ED8", label: "Medium" },
  high:   { bg: "#FFEDD4", text: "#CA3500", label: "High" },
  urgent: { bg: "#FEE2E2", text: "#DC2626", label: "Urgent" },
};

const STATUS_STYLES: Record<TaskStatus, { bg: string; text: string; label: string }> = {
  "todo":        { bg: "#F3F4F6", text: "#374151", label: "Todo" },
  "in-progress": { bg: "#DBEAFE", text: "#1D4ED8", label: "In Progress" },
  "review":      { bg: "#FEF3C7", text: "#B45309", label: "Review" },
  "done":        { bg: "#D1FAE5", text: "#065F46", label: "Done" },
};

// ── Row menu popover ──────────────────────────────────────────────────────────

function RowMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((p) => !p); }}
        className="flex h-7 w-7 items-center justify-center rounded text-gray-400 transition hover:text-gray-700 hover:cursor-pointer"
        aria-label="Row options"
      >
        <MoreHorizontal size={15} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -4 }}
            transition={{ duration: 0.1 }}
            className="absolute right-0 top-9 z-30 min-w-[130px] overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl"
          >
            <button
              onClick={(e) => { e.stopPropagation(); setOpen(false); onEdit(); }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
            >
              <Edit2 size={13} className="text-blue-500" />
              Edit
            </button>
            <div className="mx-2 h-px bg-gray-100" />
            <button
              onClick={(e) => { e.stopPropagation(); setOpen(false); onDelete(); }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 transition hover:bg-red-50"
            >
              <Trash2 size={13} />
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Skeleton row ─────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-white p-3">
      <div className="space-y-2">
        <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
        <div className="flex gap-2">
          <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200" />
          <div className="h-5 w-14 animate-pulse rounded-full bg-gray-200" />
        </div>
      </div>
      <div className="h-7 w-7 animate-pulse rounded bg-gray-200" />
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function TasksPage() {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteTasks();

  const deleteTaskMutation = useDeleteTask();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  if (isLoading) return <TasksListSkeleton />;
  if (isError)
    return <p className="p-6 text-sm text-red-600 items-center">The tasks didn't load. Please refresh the page.</p>;

  const allTasks = data?.pages.flatMap((page) => page.tasks) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  return (
    <div className="flex h-full min-h-0 flex-col p-6">
      {/* Header */}
      <div className="mb-4 flex flex-shrink-0 items-center justify-between">
        <h2 className="text-lg font-semibold text-[#232323]">
          All Tasks{" "}
          <span className="text-sm font-normal text-gray-500">
            ({allTasks.length} of {total})
          </span>
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="rounded-md bg-gray-800 px-3 py-2 text-sm font-medium text-white shadow-md transition hover:scale-105 active:scale-95"
        >
          + New Task
        </button>
      </div>

      {/* Task list */}
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
        {allTasks.map((task) => {
          const p = PRIORITY_STYLES[task.priority];
          const s = STATUS_STYLES[task.status];
          return (
            <div
              key={task.id}
              className="flex items-center justify-between rounded-lg border bg-white p-3"
            >
              <div>
                <p className="text-sm font-medium text-[#232323]">{task.title}</p>
                <div className="mt-1.5 flex gap-2">
                  <span
                    className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{ backgroundColor: s.bg, color: s.text }}
                  >
                    {s.label}
                  </span>
                  <span
                    className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{ backgroundColor: p.bg, color: p.text }}
                  >
                    {p.label}
                  </span>
                </div>
              </div>

              <RowMenu
                onEdit={() => setEditingTask(task)}
                onDelete={() => setDeletingTask(task)}
              />
            </div>
          );
        })}

        {/* Load More */}
        {hasNextPage && (
          <>
            {/* Skeleton rows while fetching */}
            {isFetchingNextPage && (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            )}
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 text-sm text-gray-600 transition hover:bg-gray-50 disabled:opacity-60"
            >
              {isFetchingNextPage ? (
                <>
                  Loading more
                  <LoaderCircle className="animate-spin" size={15} />
                </>
              ) : (
                "Load more"
              )}
            </button>
          </>
        )}
      </div>

      {/* Add Task Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add Task"
      >
        <TaskForm onSuccess={() => setShowCreateModal(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        title="Edit Task"
      >
        {editingTask && (
          <TaskForm
            task={editingTask}
            onSuccess={() => setEditingTask(null)}
          />
        )}
      </Modal>

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={!!deletingTask}
        taskTitle={deletingTask?.title ?? ""}
        isDeleting={deleteTaskMutation.isPending}
        onConfirm={() => {
          if (!deletingTask) return;
          deleteTaskMutation.mutate(deletingTask.id, {
            onSuccess: () => setDeletingTask(null),
          });
        }}
        onCancel={() => setDeletingTask(null)}
      />
    </div>
  );
}

function TasksListSkeleton() {
  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
        <div className="h-9 w-28 animate-pulse rounded-lg bg-gray-200" />
      </div>
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => <SkeletonRow key={i} />)}
      </div>
    </div>
  );
}
