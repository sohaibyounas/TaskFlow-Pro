"use client";

import { useState, useRef, useEffect } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useDeleteTask } from "@/hooks/useTaskMutations";
import { TaskForm } from "@/components/tasks/TaskForm";
import type { Task } from "@/types/task";
import { MoreVertical, Plus, Pencil, Trash2, X } from "lucide-react";

export default function TasksPage() {
  // ALL HOOKS MUST BE AT THE TOP LEVEL
  const { data: tasks, isLoading, isError } = useTasks();
  const deleteTaskMutation = useDeleteTask();

  // Create form visibility
  const [showCreateForm, setShowCreateForm] = useState(false);
  // Which task is currently being edited (null = none)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const editingTask = tasks?.find((t) => t.id === editingTaskId) ?? null;
  const [popoverOpen, setPopoverOpen] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const popoverRef = useRef<HTMLDivElement | null>(null);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setPopoverOpen(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [popoverOpen]);

  // Early returns AFTER all hooks
  if (isLoading) return <TasksListSkeleton />;

  if (isError) {
    return (
      <p className="p-6 text-sm text-red-600">
        There is no tasks to show right. Refresh the page.
      </p>
    );
  }

  function handleEditClick(task: Task) {
    setEditingTaskId((prev) => (prev === task.id ? null : task.id));
    setShowCreateForm(false);
    setPopoverOpen(null);
  }

  function handleCreateClick() {
    setShowCreateForm((prev) => !prev);
    setEditingTaskId(null);
    setPopoverOpen(null);
  }

  // Delete click ab direct delete karne ke bajaye confirmation modal open karega
  function handleDeleteClick(task: Task) {
    setTaskToDelete(task);
    setPopoverOpen(null);
  }

  // Confirm button click hone par actual deletion perform hogi
  function handleConfirmDelete() {
    if (!taskToDelete) return;
    deleteTaskMutation.mutate(taskToDelete.id, {
      onSuccess: () => {
        setTaskToDelete(null);
      },
    });
  }

  function togglePopover(taskId: string) {
    setPopoverOpen(popoverOpen === taskId ? null : taskId);
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#232323]">All Tasks</h2>
        <button
          onClick={handleCreateClick}
          className="relative inline-block p-px font-semibold leading-6 text-white bg-gray-800 shadow-2xl cursor-pointer rounded-xl shadow-zinc-900 transition-transform duration-300 ease-in-out hover:scale-105 active:scale-95"
        >
          <span className="relative z-10 block px-6 py-1.5 rounded-xl bg-gray-950">
            <div className="relative z-10 flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span className="font-medium text-[14px]">
                {showCreateForm ? "Cancel" : "New Task"}
              </span>
            </div>
          </span>
        </button>
      </div>

      {/* Create form */}
      {showCreateForm && (
        <div className="mb-4 rounded-lg border bg-white p-4">
          <TaskForm onSuccess={() => setShowCreateForm(false)} />
        </div>
      )}

      {/* Task list */}
      <div className="space-y-2">
        {tasks?.map((task) => (
          <div key={task.id}>
            {editingTaskId !== task.id ? (
              <div className="flex items-center justify-between rounded border bg-white p-3">
                <div>
                  <p className="text-sm font-medium text-[#232323]">
                    {task.title}
                  </p>
                  <div className="mt-1 flex gap-2">
                    <span className="rounded bg-gray-200 px-2 py-0.5 text-xs text-[#232323]">
                      {task.status}
                    </span>
                    <span className="rounded bg-orange-200 px-2 py-0.5 text-xs text-[#232323]">
                      {task.priority}
                    </span>
                  </div>
                </div>

                {/* Actions - Ellipsis button with popover */}
                <div
                  className="relative"
                  ref={popoverOpen === task.id ? popoverRef : null}
                >
                  <button
                    onClick={() => togglePopover(task.id)}
                    className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                    aria-label="Task actions"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>

                  {/* Popover Menu */}
                  {popoverOpen === task.id && (
                    <div className="absolute right-0 mt-2 w-30 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                      <button
                        onClick={() => handleEditClick(task)}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(task)}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div key={task.id} className="rounded-lg border border-blue-200 bg-white p-4 shadow-sm">
                <TaskForm
                  task={task}
                  onSuccess={() => setEditingTaskId(null)}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal (Matching image design) */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs">
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-gray-100">
            {/* Modal Header */}
            <div className="text-center mb-2">
              <h3 className="text-lg font-bold text-gray-900">
                Delete {taskToDelete.title}
              </h3>
              <p className="mt-1 text-sm text-gray-500 pb-1">
                Are you sure you would like to do this?
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setTaskToDelete(null)}
                className="flex-1 rounded-xl border border-gray-300 bg-white py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteTaskMutation.isPending}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteTaskMutation.isPending ? "Deleting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TasksListSkeleton() {
  return (
    <div className="p-6">
      {/* Header skeleton */}
      <div className="mb-4 flex items-center justify-between">
        <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
        <div className="h-9 w-28 animate-pulse rounded-xl bg-gray-200" />
      </div>

      {/* Task rows skeleton */}
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded border bg-gray-100"
          />
        ))}
      </div>
    </div>
  );
}
