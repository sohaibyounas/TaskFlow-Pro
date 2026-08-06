"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchTasksPaginated } from "@/lib/api/tasks";

const PAGE_SIZE = 5;

export function useInfiniteTasks() {
  return useInfiniteQuery({
    queryKey: ["tasks", "infinite"],
    queryFn: ({ pageParam }) => fetchTasksPaginated(pageParam, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
}
