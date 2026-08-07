import type { Task, CreateTaskInput, UpdateTaskInput } from "@/types/task";

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
  // Ye "joined" data hai — jab query mein profiles join karenge, ye field milega
  assignee?: { id: string; username: string; avatar_url: string | null } | null;
}

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
    // Attachments are stored in Supabase storage — not a DB column.
    // They are stored as JSON in the task record when saved via updateTask.
    attachments: (row as unknown as { attachments?: import("@/types/task").TaskAttachment[] }).attachments ?? [],
    // Agar joined assignee data mila hai, use karo — warna null
    assignee: row.assignee
      ? { id: Number(row.assignee.id) || 0, name: row.assignee.username, avatarUrl: row.assignee.avatar_url ?? "" }
      : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapCreateInputToRow(input: CreateTaskInput, userId: string) {
  return {
    title: input.title,
    description: input.description,
    status: input.status,
    priority: input.priority,
    due_date: input.dueDate,
    tags: input.tags,
    assignee_id: input.assigneeId, // naya
    user_id: userId,
  };
}

export function mapUpdateInputToRow(input: UpdateTaskInput) {
  const row: Record<string, unknown> = {};
  if (input.title !== undefined) row.title = input.title;
  if (input.description !== undefined) row.description = input.description;
  if (input.status !== undefined) row.status = input.status;
  if (input.priority !== undefined) row.priority = input.priority;
  if (input.dueDate !== undefined) row.due_date = input.dueDate;
  if (input.tags !== undefined) row.tags = input.tags;
  if (input.assigneeId !== undefined) row.assignee_id = input.assigneeId; // 🎯 naya
  return row;
}