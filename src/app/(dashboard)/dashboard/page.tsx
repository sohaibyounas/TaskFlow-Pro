// src/app/(dashboard)/dashboard/page.tsx
// "use client" NAHI hai — ye Server Component hai, seedha server pe data fetch karega

interface DummyTodo {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
}

interface TodosResponse {
  todos: DummyTodo[];
  total: number;
}

// Server Component ke andar seedha async/await use kar sakte ho —
// ye Next.js App Router ka sabse bada feature hai
export default async function DashboardPage() {
  // Direct fetch — client-side useQuery yahan nahi chahiye kyunki
  // ye data page load hote hi HTML ke sath hi aa raha hai (SSR)
  const res = await fetch("https://dummyjson.com/todos?limit=5", {
    cache: "no-store", // har request pe fresh data (abhi ke liye; baad mein revalidate strategy sochenge)
  });

  const data: TodosResponse = await res.json();

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-[#232323] pl-[24px] pt-4">
        Dashboard
      </h2>

      <div className="grid sm:grid-cols-3 gap-4 px-[24px]">
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-xs text-[#232323]">Total Tasks</p>
          <p className="text-2xl font-bold text-[#232323]">{data.total}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-xs text-[#232323]">Completed</p>
          <p className="text-2xl font-bold text-[#232323]">
            {data.todos.filter((t) => t.completed).length}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-xs text-[#232323]">Pending</p>
          <p className="text-2xl font-bold text-[#232323]">
            {data.todos.filter((t) => !t.completed).length}
          </p>
        </div>
      </div>

      <h3 className="mb-2 mt-6 text-sm font-semibold text-[#232323] pl-[24px] pb-2">
        Recent Items
      </h3>
      <ul className="space-y-2 px-[24px]">
        {data.todos.map((todo) => (
          <li
            key={todo.id}
            className="rounded border bg-white p-3 text-sm shadow-sm text-[#232323]"
          >
            {todo.todo}
          </li>
        ))}
      </ul>
    </div>
  );
}
