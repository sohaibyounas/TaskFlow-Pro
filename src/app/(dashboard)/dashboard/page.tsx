import { createClient } from "@/lib/supabase/server";
import { mapRowToTask, type TaskRow } from "@/lib/supabase/mappers";
import { Package } from "lucide-react";

// Ye page ko har request pe FRESH render karne ke liye majboor karta hai —
// warna Next.js kabhi kabhi Server Component output cache kar sakta hai
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();

  // RLS automatically sirf current user ke tasks return karega —
  // humein manually .eq("user_id", ...) likhne ki zaroorat nahi
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <p className="p-6 text-sm text-red-600">
        Dashboard load nahi hua: {error.message}
      </p>
    );
  }

  const tasks = (data as TaskRow[]).map(mapRowToTask);
  const completed = tasks.filter((t) => t.status === "done").length;
  const pending = tasks.length - completed;
  const recentTasks = tasks.slice(0, 5); // already sorted by newest first

  return (
    <div className="h-full overflow-y-auto p-6">
      <h2 className="mb-4 text-lg font-semibold text-[#232323]">Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-[#232323]">Total Tasks</p>
          <p className="text-2xl font-bold text-[#232323]">{tasks.length}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-[#232323]">Completed</p>
          <p className="text-2xl font-bold text-[#232323]">{completed}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-[#232323]">Pending</p>
          <p className="text-2xl font-bold text-[#232323]">{pending}</p>
        </div>
      </div>

      <h3 className="mb-2 mt-6 text-sm font-medium text-gray-600">
        Recent Items
      </h3>

      {recentTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center pt-6 sm:pt-10 md:pt-16 lg:pt-20">
          <Package color="grey" size={28} />
          <p className="pt-4 text-[12px] sm:text-[16px] text-[#232323]">
            Ready to get organized? Create your first task now.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {recentTasks.map((task) => (
            <li
              key={task.id}
              className="rounded border bg-white p-3 text-sm text-[#232323] shadow-sm"
            >
              {task.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
