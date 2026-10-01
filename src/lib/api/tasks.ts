import { createClient } from "@/lib/supabase/client";
import {
  mapRowToTask,
  mapCreateInputToRow,
  mapUpdateInputToRow,
  type TaskRow,
} from "@/lib/supabase/mappers";
import type { Task, CreateTaskInput, UpdateTaskInput } from "@/types/task";
import { mockTaskDb } from "@/lib/mock/db";

const TASK_SELECT_WITH_ASSIGNEE = `
  *,
  assignee:profiles(id, username, avatar_url)
`;

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && url.startsWith("http"));
}

export async function fetchTasks(): Promise<Task[]> {
  if (!isSupabaseConfigured()) {
    return mockTaskDb.getAll();
  }

  try {
    const supabase = createClient();
    const withJoin = await supabase
      .from("tasks")
      .select(TASK_SELECT_WITH_ASSIGNEE)
      .order("created_at", { ascending: false });

    if (withJoin.error) {
      const plain = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (plain.error || !plain.data || plain.data.length === 0) {
        return mockTaskDb.getAll();
      }
      return (plain.data as unknown as TaskRow[]).map(mapRowToTask);
    }

    if (!withJoin.data || withJoin.data.length === 0) {
      return mockTaskDb.getAll();
    }

    return (withJoin.data as unknown as TaskRow[]).map(mapRowToTask);
  } catch {
    return mockTaskDb.getAll();
  }
}

export async function fetchTasksPaginated(page: number, limit: number) {
  if (!isSupabaseConfigured()) {
    return mockTaskDb.getPaginated(page, limit);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  try {
    const supabase = createClient();
    const withJoin = await supabase
      .from("tasks")
      .select(TASK_SELECT_WITH_ASSIGNEE, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    let data: unknown[] | null = null;
    let count: number | null = null;

    if (withJoin.error) {
      const plain = await supabase
        .from("tasks")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);
      data = plain.data;
      count = plain.count;
    } else {
      data = withJoin.data;
      count = withJoin.count;
    }

    if (!data || data.length === 0) {
      return mockTaskDb.getPaginated(page, limit);
    }

    const total = count ?? 0;
    return {
      tasks: (data as unknown as TaskRow[]).map(mapRowToTask),
      nextPage: to < total - 1 ? page + 1 : null,
      total,
    };
  } catch {
    return mockTaskDb.getPaginated(page, limit);
  }
}

export async function fetchTaskById(id: string): Promise<Task | null> {
  if (!isSupabaseConfigured()) {
    return mockTaskDb.getById(id);
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      return mockTaskDb.getById(id);
    }

    return mapRowToTask(data as TaskRow);
  } catch {
    return mockTaskDb.getById(id);
  }
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  if (!isSupabaseConfigured()) {
    return mockTaskDb.create(input);
  }

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return mockTaskDb.create(input);
    }

    const { data, error } = await supabase
      .from("tasks")
      .insert(mapCreateInputToRow(input, user.id))
      .select()
      .single();

    if (error || !data) {
      return mockTaskDb.create(input);
    }

    return mapRowToTask(data as TaskRow);
  } catch {
    return mockTaskDb.create(input);
  }
}

export async function updateTask(
  id: string,
  input: UpdateTaskInput,
): Promise<Task> {
  if (!isSupabaseConfigured()) {
    return mockTaskDb.update(id, input);
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("tasks")
      .update(mapUpdateInputToRow(input))
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      return mockTaskDb.update(id, input);
    }

    return mapRowToTask(data as TaskRow);
  } catch {
    return mockTaskDb.update(id, input);
  }
}

export async function deleteTask(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    return mockTaskDb.remove(id);
  }

  try {
    const supabase = createClient();
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) {
      return mockTaskDb.remove(id);
    }
  } catch {
    return mockTaskDb.remove(id);
  }
}
