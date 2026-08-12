import { createClient } from "@/lib/supabase/server";
import { mapRowToTask, type TaskRow } from "@/lib/supabase/mappers";
import { mockTaskDb } from "@/lib/mock/db";
import { DashboardClient } from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let tasks = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      tasks = (data as TaskRow[]).map(mapRowToTask);
    } else {
      tasks = await mockTaskDb.getAll();
    }
  } catch {
    tasks = await mockTaskDb.getAll();
  }

  return <DashboardClient tasks={tasks} />;
}


