"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  taskFormSchema,
  type TaskFormValues,
} from "@/lib/validations/task.schema";
import { useCreateTask, useUpdateTask } from "@/hooks/useTaskMutations";
import type { Task } from "@/types/task";

interface TaskFormProps {
  onSuccess?: () => void;
  task?: Task; // agar ye prop mile, form "edit mode" mein chala jayega
}

export function TaskForm({ onSuccess, task }: TaskFormProps) {
  const isEditMode = !!task;

  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();

  // Dono mutations mein se jo relevant hai uska loading/error state use karenge
  const activeMutation = isEditMode ? updateTaskMutation : createTaskMutation;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: task
      ? {
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          assigneeId: task.assignee?.id ?? null,
          dueDate: task.dueDate,
          tags: task.tags,
        }
      : {
          title: "",
          description: "",
          status: "todo",
          priority: "medium",
          assigneeId: null,
          dueDate: null,
          tags: [],
        },
  });

  // Jab task prop change ho (alag task edit karo), form reset karo nayi values se
  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assigneeId: task.assignee?.id ?? null,
        dueDate: task.dueDate,
        tags: task.tags,
      });
    }
  }, [task?.id]);

  function onSubmit(values: TaskFormValues) {
    if (isEditMode) {
      // UPDATE path
      updateTaskMutation.mutate(
        {
          id: task.id,
          input: {
            title: values.title,
            description: values.description,
            status: values.status,
            priority: values.priority,
            dueDate: values.dueDate,
            tags: values.tags,
          },
        },
        { onSuccess: () => onSuccess?.() },
      );
    } else {
      // 🎯 CREATE path
      createTaskMutation.mutate(
        {
          title: values.title,
          description: values.description,
          status: values.status,
          priority: values.priority,
          assignee: null,
          dueDate: values.dueDate,
          tags: values.tags,
        },
        {
          onSuccess: () => {
            reset();
            onSuccess?.();
          },
        },
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[#232323]">
          Title
        </label>
        <input
          {...register("title")}
          className="mt-1 w-full rounded border px-3 py-2 text-sm text-[#232323]"
          placeholder="e.g. Fix navbar overlap bug"
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-[#232323]">
          Description
        </label>
        <textarea
          {...register("description")}
          rows={3}
          className="mt-1 w-full rounded border px-3 py-2 text-sm text-[#232323]"
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-[#232323]">
            Status
          </label>
          <select
            {...register("status")}
            className="mt-1 w-full rounded border px-3 py-2 text-sm text-[#232323]"
          >
            <option value="todo">Todo</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#232323]">
            Priority
          </label>
          <select
            {...register("priority")}
            className="mt-1 w-full rounded border px-3 py-2 text-sm text-[#232323]"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={activeMutation.isPending}
        className="w-full rounded bg-black p-px py-2 text-sm font-medium text-white bg-gray-800 shadow-2xl cursor-pointer rounded-xl shadow-zinc-900 transition-transform duration-300 ease-in-out hover:scale-105 active:scale-95 disabled:opacity-50"
      >
        {activeMutation.isPending
          ? isEditMode
            ? "Updating..."
            : "Creating..."
          : isEditMode
            ? "Update Task"
            : "Create Task"}
      </button>

      {activeMutation.isError && (
        <p className="text-sm text-red-600">
          {isEditMode ? "Task update nahi hua" : "Task create nahi hua"}, dobara
          try karo
        </p>
      )}
    </form>
  );
}
