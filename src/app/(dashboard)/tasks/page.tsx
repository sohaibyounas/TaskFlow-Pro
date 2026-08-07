"use client";

import { useState } from "react";
import { useInfiniteTasks } from "@/hooks/useInfiniteTasks";
import { useDeleteTask } from "@/hooks/useTaskMutations";
import { TaskForm } from "@/components/tasks/TaskForm";
import { Modal } from "@/components/ui/Modal";
import type { Task } from "@/types/task";
import { LoaderCircle } from "lucide-react";

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

  if (isLoading) return <TasksListSkeleton />;
  if (isError)
    return (
      <p className="text-sm text-red-600">Tasks load nahi hue. Refresh karo.</p>
    );

  // Saare pages ke tasks ko ek flat array mein combine karo
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
            <div className="flex gap-3">
              <button
                onClick={() => setEditingTask(task)}
                className="text-xs text-blue-600 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => deleteTaskMutation.mutate(task.id)}
                className="text-xs text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {/* Load More button */}
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

      <Modal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        title="Edit Task"
      >
        {editingTask && (
          <TaskForm task={editingTask} onSuccess={() => setEditingTask(null)} />
        )}
      </Modal>
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
