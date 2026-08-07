"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInfiniteTasks } from "@/hooks/useInfiniteTasks";
import { useDeleteTask } from "@/hooks/useTaskMutations";
import { TaskForm } from "@/components/tasks/TaskForm";
import { Modal } from "@/components/ui/Modal";
import { DeleteConfirmModal } from "@/components/ui/DeleteConfirmModal";
import type { Task } from "@/types/task";
import { LoaderCircle, MoreHorizontal, Edit2, Trash2 } from "lucide-react";

// popover

function RowMenu({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((p) => !p);
        }}
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
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onEdit();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-200"
            >
              <Edit2 size={13} className="text-blue-500" />
              Edit
            </button>
            <div className="mx-2 h-px bg-gray-100" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onDelete();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 transition hover:bg-red-200"
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
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  if (isLoading) return <TasksListSkeleton />;
  if (isError)
    return (
      <p className="text-sm text-red-600">Tasks load nahi hue. Refresh karo.</p>
    );

  const allTasks = data?.pages.flatMap((page) => page.tasks) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  return (
    <div className="flex h-full min-h-0 flex-col p-6">
      {/* header */}
      <div className="mb-4 flex flex-shrink-0 items-center justify-between">
        <h2 className="text-lg font-semibold text-[#232323]">
          All Tasks{" "}
          <span className="text-sm font-normal text-gray-600">
            ({allTasks.length} of {total})
          </span>
        </h2>
        <button
          onClick={() => setShowCreateForm((prev) => !prev)}
          className="relative inline-block p-2.5 font-medium leading-5 text-white bg-gray-800 shadow-2xl px-3 cursor-pointer rounded-md shadow-zinc-900 transition-transform duration-300 ease-in-out hover:scale-105 active:scale-95"
        >
          {showCreateForm ? "Cancel" : "+ New Task"}
        </button>
      </div>

      {showCreateForm && (
        <div className="mb-6 flex-shrink-0 rounded-lg border bg-white p-4">
          <TaskForm onSuccess={() => setShowCreateForm(false)} />
        </div>
      )}

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
        {allTasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between rounded border bg-white p-3"
          >
            <div>
              <p className="text-sm font-medium text-[#232323]">{task.title}</p>
              <div className="mt-1 flex gap-2">
                <span className="rounded bg-gray-400 px-2 py-0.5 text-xs">
                  {task.status}
                </span>
                <span className="rounded bg-orange-400 px-2 py-0.5 text-xs">
                  {task.priority}
                </span>
              </div>
            </div>

            {/* Popover menu instead of plain buttons */}
            <RowMenu
              onEdit={() => setEditingTask(task)}
              onDelete={() => setDeletingTask(task)}
            />
          </div>
        ))}

        {hasNextPage && (
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="w-full rounded border py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            {isFetchingNextPage ? (
              <div className="flex items-center justify-center gap-1">
                Loading...
                <LoaderCircle className="animate-spin" size={16} />
              </div>
            ) : (
              "Load more"
            )}
          </button>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        title="Edit Task"
      >
        {editingTask && (
          <TaskForm task={editingTask} onSuccess={() => setEditingTask(null)} />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
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
        <div className="h-9 w-28 animate-pulse rounded-xl bg-gray-200" />
      </div>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded border bg-gray-100" />
        ))}
      </div>
    </div>
  );
}
