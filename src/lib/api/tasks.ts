import { createClient } from "@/lib/supabase/client";
import {
  mapRowToTask,
  mapCreateInputToRow,
  mapUpdateInputToRow,
  type TaskRow,
} from "@/lib/supabase/mappers";
import type { Task, CreateTaskInput, UpdateTaskInput } from "@/types/task";

export async function fetchTasks(): Promise<Task[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data as TaskRow[]).map(mapRowToTask);
}

export async function fetchTasksPaginated(page: number, limit: number) {
  const supabase = createClient();

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // { count: "exact" } se total rows bhi milte hain, ek hi query mein
  const { data, error, count } = await supabase
    .from("tasks")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  const total = count ?? 0;
  const hasMore = to < total - 1;

  return {
    tasks: (data as TaskRow[]).map(mapRowToTask),
    nextPage: hasMore ? page + 1 : null,
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
