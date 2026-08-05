"use client"; // Hooks jo useQuery use karte hain, unhe Client Component context mein hi chalna hota hai

import { useQuery } from "@tanstack/react-query";
import { fetchTasks, fetchTaskById } from "@/lib/api/tasks";

// Query keys ko ek jagah define karna best practice hai —
// isse typo se bachte ho aur invalidation (cache refresh) reliable hoti hai
export const taskKeys = {
  all: ["tasks"] as const,
  detail: (id: string) => ["tasks", id] as const,
};

export function useTasks() {
  return useQuery({
    queryKey: taskKeys.all,
    queryFn: fetchTasks,
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => fetchTaskById(id),
    enabled: !!id, // agar id empty ho to query hi mat chalao
  });
}
