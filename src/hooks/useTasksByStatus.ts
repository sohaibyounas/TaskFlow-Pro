"use client";

import { useMemo } from "react";
import { useTasks } from "./useTasks";
import type { Task, TaskStatus } from "@/types/task";

const COLUMN_ORDER: TaskStatus[] = ["todo", "in-progress", "review", "done"];

export interface GroupedTasks {
  status: TaskStatus;
  title: string;
  tasks: Task[];
}

const COLUMN_TITLES: Record<TaskStatus, string> = {
  todo: "To Do",
  "in-progress": "In Progress",
  review: "Review",
  done: "Done",
};

export function useTasksByStatus() {
  const { data: tasks, isLoading, isError } = useTasks();

  // useMemo — tasks list jab tak change na ho, ye grouping dobara calculate nahi hogi
  const columns = useMemo<GroupedTasks[]>(() => {
    if (!tasks) return [];

    return COLUMN_ORDER.map((status) => ({
      status,
      title: COLUMN_TITLES[status],
      tasks: tasks.filter((task) => task.status === status),
    }));
  }, [tasks]);

  return { columns, isLoading, isError };
}
