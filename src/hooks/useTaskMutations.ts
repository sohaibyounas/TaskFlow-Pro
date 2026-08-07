"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTask, updateTask, deleteTask } from "@/lib/api/tasks";
import { taskKeys } from "./useTasks";
import type { Task, CreateTaskInput, UpdateTaskInput } from "@/types/task";

// Invalidate both the board query ["tasks"] and the infinite list ["tasks","infinite"]
function invalidateAll(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: taskKeys.all });
  queryClient.invalidateQueries({ queryKey: ["tasks", "infinite"] });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(input),
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) =>
      updateTask(id, input),

    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all });
      await queryClient.cancelQueries({ queryKey: ["tasks", "infinite"] });

      const previousTasks = queryClient.getQueryData<Task[]>(taskKeys.all);

      // Optimistic update — merge input into cached task
      queryClient.setQueryData<Task[]>(taskKeys.all, (old) =>
        old?.map((task) => (task.id === id ? { ...task, ...input } : task)),
      );

      return { previousTasks };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.all, context.previousTasks);
      }
    },

    // Only invalidate if it's NOT an attachments-only update
    // (attachment updates are already optimistic in cache; invalidating causes flicker)
    onSettled: (_data, _err, variables) => {
      const keys = Object.keys(variables.input) as (keyof UpdateTaskInput)[];
      const isAttachmentsOnly =
        keys.length === 1 && keys[0] === "attachments";
      if (!isAttachmentsOnly) {
        invalidateAll(queryClient);
      }
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTask(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all });
      await queryClient.cancelQueries({ queryKey: ["tasks", "infinite"] });

      const previousTasks = queryClient.getQueryData<Task[]>(taskKeys.all);

      queryClient.setQueryData<Task[]>(taskKeys.all, (old) =>
        old?.filter((task) => task.id !== id),
      );

      return { previousTasks };
    },

    onError: (_err, _id, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.all, context.previousTasks);
      }
    },

    onSettled: () => invalidateAll(queryClient),
  });
}
