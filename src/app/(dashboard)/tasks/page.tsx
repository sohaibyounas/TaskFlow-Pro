"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useInfiniteTasks } from "@/hooks/useInfiniteTasks";
import { useDeleteTask } from "@/hooks/useTaskMutations";
import { TaskForm } from "@/components/tasks/TaskForm";
import { Modal } from "@/components/ui/Modal";
import { DeleteConfirmModal } from "@/components/ui/DeleteConfirmModal";
import type { Task, TaskPriority, TaskStatus } from "@/types/task";
import { LoaderCircle, MoreHorizontal, Edit2, Trash2, PackageOpen, AlertCircle } from "lucide-react";

// Color maps 

const PRIORITY_STYLES: Record<TaskPriority, { bg: string; text: string; label: string }> = {
  low: { bg: "#F3F4F6", text: "#4B5563", label: "Low" },
  medium: { bg: "#DBEAFE", text: "#1D4ED8", label: "Medium" },
  high: { bg: "#FFEDD4", text: "#CA3500", label: "High" },
  urgent: { bg: "#FEE2E2", text: "#DC2626", label: "Urgent" },
};

const STATUS_STYLES: Record<TaskStatus, { bg: string; text: string; label: string }> = {
  "todo": { bg: "#F3F4F6", text: "#374151", label: "Todo" },
  "in-progress": { bg: "#DBEAFE", text: "#1D4ED8", label: "In Progress" },
  "review": { bg: "#FEF3C7", text: "#B45309", label: "Review" },
  "done": { bg: "#D1FAE5", text: "#065F46", label: "Done" },
};

// menu popover

function RowMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  function handleOpen(e: React.MouseEvent) {
    e.stopPropagation();
    if (!btnRef.current) { setOpen((p) => !p); return; }
    const rect = btnRef.current.getBoundingClientRect();
    const MENU_H = 80;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < MENU_H + 8;
    setMenuStyle({
      position: "fixed",
      right: window.innerWidth - rect.right,
      ...(openUpward
        ? { bottom: window.innerHeight - rect.top + 4 }
        : { top: rect.bottom + 4 }),
      zIndex: 9999,
    });
    setOpen((p) => !p);
  }

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="flex h-7 w-7 items-center justify-center rounded text-gray-400 transition hover:text-gray-700 hover:cursor-pointer"
        aria-label="Row options"
      >
        <MoreHorizontal size={15} />
      </button>

      {/* Portal: AnimatePresence inside portal so motion.div is tracked directly */}
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={menuRef}
              style={menuStyle}
              initial={{ opacity: 0, scale: 0.92, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -4 }}
              transition={{ duration: 0.1 }}
              className="min-w-[130px] overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl"
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
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

// Skeleton row 

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
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <AlertCircle size={28} className="text-red-400" />
        </div>
        <div>
          <p className="text-base font-semibold text-gray-800">Failed to load tasks</p>
          <p className="mt-1 text-sm text-gray-500">Something went wrong. Please try refreshing the page.</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
        >
          Refresh Page
        </button>
      </div>
    );

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
        {allTasks.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
              <PackageOpen size={32} className="text-gray-400" />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-700">No tasks yet</p>
              <p className="mt-1 text-sm text-gray-400">Create your first task to get started</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-gray-700"
            >
              + New Task
            </button>
          </div>
        ) : (
          <>
            {allTasks.map((task) => {
              const p = PRIORITY_STYLES[task.priority];
              const s = STATUS_STYLES[task.status];
              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-lg border bg-white p-3 transition hover:shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#232323]">{task.title}</p>
                    <div className="mt-1.5 flex flex-wrap gap-2">
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
