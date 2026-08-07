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
      // Cancel any in-flight refetches for both query keys
      await queryClient.cancelQueries({ queryKey: taskKeys.all });
      await queryClient.cancelQueries({ queryKey: ["tasks", "infinite"] });

      // Snapshot for rollback
      const previousTasks = queryClient.getQueryData<Task[]>(taskKeys.all);

      // Optimistic update on the board cache
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

    onSettled: () => invalidateAll(queryClient),
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
