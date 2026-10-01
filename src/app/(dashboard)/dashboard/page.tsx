import { createClient } from "@/lib/supabase/server";
import { mapRowToTask, type TaskRow } from "@/lib/supabase/mappers";
import { mockTaskDb } from "@/lib/mock/db";
import type { Task } from "@/types/task";
import { DashboardClient } from "./DashboardClient";

export const dynamic = "force-dynamic";

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && url.startsWith("http"));
}

export default async function DashboardPage() {
  let tasks: Task[] = [];
  let userName = "Workspace Member";

  if (!isSupabaseConfigured()) {
    tasks = await mockTaskDb.getAll();
    return <DashboardClient tasks={tasks} userName="Sohaib Younas" />;
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      userName =
        user.user_metadata?.username ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "Workspace Member";

      const { data } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) {
        tasks = (data as TaskRow[]).map(mapRowToTask);
      }
    }
  } catch (err) {
    console.error("DashboardPage fetch error:", err);
    tasks = [];
  }

  return <DashboardClient tasks={tasks} userName={userName} />;
}
