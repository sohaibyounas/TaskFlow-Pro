import type { Task, CreateTaskInput, UpdateTaskInput } from "@/types/task";

// Database row ka shape — snake_case, Supabase se aisa hi aata hai
export interface TaskRow {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string | null;
  tags: string[];
  comments_count: number;
  assignee_id: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// DB row → Frontend Task type (snake_case → camelCase)
export function mapRowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status as Task["status"],
    priority: row.priority as Task["priority"],
    dueDate: row.due_date,
    tags: row.tags,
    commentsCount: row.comments_count,
    assignee: null, // 🎯 abhi simplification — Step 2 mein profiles join se real object aayega
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Frontend CreateTaskInput → DB insert payload (camelCase → snake_case)
export function mapCreateInputToRow(input: CreateTaskInput, userId: string) {
  return {
    title: input.title,
    description: input.description,
    status: input.status,
    priority: input.priority,
    due_date: input.dueDate,
    tags: input.tags,
    user_id: userId, // RLS ke liye zaroori — batata hai "ye task kisne banaya"
  };
}

// Frontend UpdateTaskInput → DB update payload
export function mapUpdateInputToRow(input: UpdateTaskInput) {
  const row: Record<string, unknown> = {};
  if (input.title !== undefined) row.title = input.title;
  if (input.description !== undefined) row.description = input.description;
  if (input.status !== undefined) row.status = input.status;
  if (input.priority !== undefined) row.priority = input.priority;
  if (input.dueDate !== undefined) row.due_date = input.dueDate;
  if (input.tags !== undefined) row.tags = input.tags;
  return row;
}
