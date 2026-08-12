"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useInfiniteTasks } from "@/hooks/useInfiniteTasks";
import { useDeleteTask } from "@/hooks/useTaskMutations";
import { TaskForm } from "@/components/tasks/TaskForm";
import { TaskCard } from "@/components/tasks/TaskCard";
import { Modal } from "@/components/ui/Modal";
import { DeleteConfirmModal } from "@/components/ui/DeleteConfirmModal";
import type { Task, TaskPriority, TaskStatus } from "@/types/task";
import {
  LoaderCircle,
  Plus,
  Search,
  LayoutGrid,
  List,
  PackageOpen,
  AlertCircle,
  Edit2,
  Trash2,
} from "lucide-react";

const PRIORITY_BADGES: Record<
  TaskPriority,
  { bg: string; text: string; border: string }
> = {
  low: { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200" },
  medium: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  high: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  urgent: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
};

const STATUS_BADGES: Record<
  TaskStatus,
  { bg: string; text: string; label: string }
> = {
  todo: { bg: "bg-slate-100", text: "text-slate-700", label: "To Do" },
  "in-progress": { bg: "bg-blue-100", text: "text-blue-700", label: "In Progress" },
  review: { bg: "bg-amber-100", text: "text-amber-700", label: "Review" },
  done: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Done" },
};

function TasksContent() {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") ?? "";

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

  // Filters & Views
  const [search, setSearch] = useState(urlSearch);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // Sync search state during render phase if URL search parameter updates
  const [prevUrlSearch, setPrevUrlSearch] = useState(urlSearch);
  if (urlSearch !== prevUrlSearch) {
    setPrevUrlSearch(urlSearch);
    setSearch(urlSearch);
  }

  const allTasks = useMemo(() => {
    return data?.pages.flatMap((page) => page.tasks) ?? [];
  }, [data]);

  const filteredTasks = useMemo(() => {
    return allTasks.filter((task) => {
      const query = search.toLowerCase();
      const matchesSearch =
        task.title.toLowerCase().includes(query) ||
        task.tags?.some((tag) => tag.toLowerCase().includes(query)) ||
        task.assignee?.name.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [allTasks, search, statusFilter]);

  if (isLoading) return <TasksListSkeleton />;
  if (isError)
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 border border-rose-100">
          <AlertCircle size={28} />
        </div>
        <div>
          <p className="text-base font-bold text-slate-800">Failed to load tasks</p>
          <p className="mt-1 text-sm text-slate-500">Something went wrong. Please try refreshing.</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Refresh Page
        </button>
      </div>
    );

  return (
    <div className="flex h-full min-h-0 flex-col p-4 md:p-8 space-y-5 overflow-y-auto">
      {/* Header & Actions Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            All Workspace Cards
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage, filter, and review tasks across your Trello workspace.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Plus size={18} />
          Create New Task
        </button>
      </div>

      {/* Search, Filter & View Mode Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Left: Search input */}
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 shadow-2xs focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <Search size={16} className="text-slate-400 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter cards by title, tag, or assignee..."
            className="w-full text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent"
          />
        </div>

        {/* Middle & Right: Status Filter Pills & Grid/List Toggle */}
        <div className="flex items-center justify-between sm:justify-start gap-2">
          {/* Status Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-2xs scrollbar-hide">
            {["all", "todo", "in-progress", "review", "done"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition capitalize flex-shrink-0 ${
                  statusFilter === st
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {st === "in-progress" ? "In Progress" : st}
              </button>
            ))}
          </div>

          {/* View Mode Toggle - Visible on Mobile & Desktop */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-2xs flex-shrink-0">
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded-lg p-1.5 transition ${
                viewMode === "grid"
                  ? "bg-blue-50 text-blue-600 border border-blue-100 font-bold"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              title="Grid Card View"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-lg p-1.5 transition ${
                viewMode === "list"
                  ? "bg-blue-50 text-blue-600 border border-blue-100 font-bold"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              title="Table List View"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Task List / Grid Display */}
      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
            <PackageOpen size={32} />
          </div>
          <h3 className="text-base font-bold text-slate-800">No cards match your filter</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm">
            Try adjusting your search terms or status filters to find what you&apos;re looking for.
          </p>
          <button
            onClick={() => { setSearch(""); setStatusFilter("all"); }}
            className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === "grid" ? (

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                <TaskCard task={task} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* List View: Responsive Accordion on Mobile & Scrollable Table on Tablet/Desktop */
        <div className="space-y-4">
          {/* Mobile Accordion List View (<640px) */}
          <div className="block sm:hidden space-y-2.5">
            {filteredTasks.map((task) => {
              const s = STATUS_BADGES[task.status];
              const p = PRIORITY_BADGES[task.priority];
              const isExpanded = expandedTaskId === task.id;

              return (
                <div
                  key={task.id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs transition hover:border-slate-300"
                >
                  <div
                    onClick={() =>
                      setExpandedTaskId(isExpanded ? null : task.id)
                    }
                    className="flex items-center justify-between cursor-pointer gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm text-slate-900 truncate">
                        {task.title}
                      </p>
                      <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ${s.bg} ${s.text}`}
                        >
                          {s.label}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${p.bg} ${p.text} ${p.border}`}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </div>

                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-500">
                      {isExpanded ? "▲" : "▼"}
                    </div>
                  </div>

                  {/* Expanded Accordion Details */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-3 animate-fade-in text-xs">
                      {task.description && (
                        <p className="text-slate-600 line-clamp-3">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between gap-2 text-slate-500">
                        <span>Assignee:</span>
                        {task.assignee ? (
                          <span className="font-bold text-slate-800">
                            {task.assignee.name}
                          </span>
                        ) : (
                          <span className="italic">Unassigned</span>
                        )}
                      </div>

                      {task.tags && task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {task.tags.map((t) => (
                            <span
                              key={t}
                              className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                        <button
                          onClick={() => setEditingTask(task)}
                          className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 font-bold text-blue-600 text-xs"
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button
                          onClick={() => setDeletingTask(task)}
                          className="flex items-center gap-1 rounded-lg bg-rose-50 px-3 py-1.5 font-bold text-rose-600 text-xs"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop/Tablet Table View (>=640px) */}
          <div className="hidden sm:block overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-xs">
            <table className="w-full text-left text-sm min-w-[650px]">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Task Title</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Assignee</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.map((task) => {
                  const s = STATUS_BADGES[task.status];
                  const p = PRIORITY_BADGES[task.priority];
                  return (
                    <tr
                      key={task.id}
                      className="hover:bg-slate-50/80 transition group"
                    >
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {task.title}
                        </p>
                        {task.tags && task.tags.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {task.tags.map((t) => (
                              <span
                                key={t}
                                className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-medium text-slate-600"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ${s.bg} ${s.text}`}
                        >
                          {s.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${p.bg} ${p.text} ${p.border}`}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {task.assignee ? (
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                              {task.assignee.name.charAt(0)}
                            </div>
                            <span className="text-xs text-slate-700">{task.assignee.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditingTask(task)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition"
                            title="Edit"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => setDeletingTask(task)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Infinite Pagination Load More Button */}
      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition disabled:opacity-60"
        >
          {isFetchingNextPage ? (
            <>
              Loading more cards...
              <LoaderCircle className="animate-spin" size={16} />
            </>
          ) : (
            "Load More Tasks"
          )}
        </button>
      )}

      {/* Modals */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add Task"
      >
        <TaskForm onSuccess={() => setShowCreateModal(false)} />
      </Modal>

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

export default function TasksPage() {
  return (
    <Suspense fallback={<TasksListSkeleton />}>
      <TasksContent />
    </Suspense>
  );
}

function TasksListSkeleton() {
  return (
    <div className="p-8 space-y-4">
      <div className="h-8 w-48 bg-slate-200 animate-pulse rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-44 bg-slate-100 animate-pulse rounded-2xl" />
        ))}
      </div>
    </div>
  );
}


