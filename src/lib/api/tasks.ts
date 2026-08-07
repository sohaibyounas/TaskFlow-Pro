import { createClient } from "@/lib/supabase/client";
import {
  mapRowToTask,
  mapCreateInputToRow,
  mapUpdateInputToRow,
  type TaskRow,
} from "@/lib/supabase/mappers";
import type { Task, CreateTaskInput, UpdateTaskInput } from "@/types/task";

const TASK_SELECT_WITH_ASSIGNEE = `
  *,
  assignee:profiles(id, username, avatar_url)
`;

export async function fetchTasks(): Promise<Task[]> {
  const supabase = createClient();
  let data: unknown[] | null = null;
  let error = null;

  const withJoin = await supabase
    .from("tasks")
    .select(TASK_SELECT_WITH_ASSIGNEE)
    .order("created_at", { ascending: false });

  if (withJoin.error) {
    const plain = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });
    data = plain.data;
    error = plain.error;
  } else {
    data = withJoin.data;
    error = withJoin.error;
  }

  if (error) throw new Error((error as { message: string }).message);
  return (data as unknown as TaskRow[]).map(mapRowToTask);
}

export async function fetchTasksPaginated(page: number, limit: number) {
  const supabase = createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Try with profiles join first; fall back to plain select if it fails (e.g. RLS on profiles)
  let data: unknown[] | null = null;
  let count: number | null = null;
  let error = null;

  const withJoin = await supabase
    .from("tasks")
    .select(TASK_SELECT_WITH_ASSIGNEE, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (withJoin.error) {
    // Fallback: plain select without profiles join
    const plain = await supabase
      .from("tasks")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);
    data = plain.data;
    count = plain.count;
    error = plain.error;
  } else {
    data = withJoin.data;
    count = withJoin.count;
    error = withJoin.error;
  }

  if (error) throw new Error((error as { message: string }).message);

  const total = count ?? 0;
  return {
    tasks: (data as unknown as TaskRow[]).map(mapRowToTask),
    nextPage: to < total - 1 ? page + 1 : null,
    total,
  };
}

export async function fetchTaskById(id: string): Promise<Task | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", id)
    .maybeSingle(); // single() ki tarah, but agar na mile to error nahi, null return karta hai

  if (error) throw new Error(error.message);
  if (!data) return null;

  return mapRowToTask(data as TaskRow);
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const supabase = createClient();

  //  Current logged-in user ka ID chahiye (RLS policy isi se match karegi)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Aap logged in nahi hain");

  const { data, error } = await supabase
    .from("tasks")
    .insert(mapCreateInputToRow(input, user.id))
    .select()
    .single();

  if (error) throw new Error(error.message);

  return mapRowToTask(data as TaskRow);
}

export async function updateTask(
  id: string,
  input: UpdateTaskInput,
): Promise<Task> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("tasks")
    .update(mapUpdateInputToRow(input))
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return mapRowToTask(data as TaskRow);
}

export async function deleteTask(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) throw new Error(error.message);
}
