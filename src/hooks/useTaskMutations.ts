"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTask, updateTask, deleteTask } from "@/lib/api/tasks";
import { taskKeys } from "./useTasks";
import type { Task, CreateTaskInput, UpdateTaskInput } from "@/types/task";

// CREATE — simple mutation, koi optimistic update nahi
// (naya task turant list mein dikhana zaroori nahi, thoda wait chalega)
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(input),
    onSuccess: () => {
      // Task create hone ke baad, "tasks" list ko stale mark karo —
      // TanStack Query automatically refetch kar lega
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

// UPDATE — ye wala OPTIMISTIC hai (drag-drop ke liye critical)
// Jab user task ko "todo" se "in-progress" column mein drag kare,
// UI TURANT update honi chahiye — server response ka wait nahi karna
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) =>
      updateTask(id, input),

    // onMutate — server call se PEHLE chalta hai
    onMutate: async ({ id, input }) => {
      // Step 1: Pending refetches cancel karo (taake wo purana data overwrite na kar de)
      await queryClient.cancelQueries({ queryKey: taskKeys.all });

      // Step 2: Current cache ka snapshot le lo (rollback ke liye zaroori)
      const previousTasks = queryClient.getQueryData<Task[]>(taskKeys.all);

      // Step 3: Cache ko turant manually update karo (optimistic!)
      queryClient.setQueryData<Task[]>(taskKeys.all, (old) =>
        old?.map((task) => (task.id === id ? { ...task, ...input } : task)),
      );

      // Ye return value onError mein "context" ke through milega
      return { previousTasks };
    },

    // Agar server call FAIL ho jaye — rollback karo
    onError: (_err, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.all, context.previousTasks);
      }
    },

    // Chahe success ho ya fail, end mein hamesha real data se sync kar lo
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

// DELETE — isme bhi optimistic update (task turant list se gayab ho, "vanish" feel)
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTask(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all });
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

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}
