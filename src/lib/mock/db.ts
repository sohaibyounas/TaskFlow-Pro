import type { Task, CreateTaskInput, UpdateTaskInput } from "@/types/task";

// In-memory "database" — module-level array, dev server ke chalte rehne tak persist karta hai
let tasks: Task[] = [
  {
    id: "1",
    title: "Setup Next.js project",
    description: "Initialize project with TypeScript and Tailwind",
    status: "done",
    priority: "high",
    assignee: { id: 1, name: "Sohaib", avatarUrl: "" },
    dueDate: "2026-08-01",
    tags: ["setup"],
    commentsCount: 2,
    attachments: [],
    createdAt: "2026-07-28T10:00:00Z",
    updatedAt: "2026-08-01T12:00:00Z",
  },
  {
    id: "2",
    title: "Build Kanban board UI",
    description: "Drag and drop columns with Framer Motion",
    status: "in-progress",
    priority: "urgent",
    assignee: { id: 1, name: "Sohaib", avatarUrl: "" },
    dueDate: "2026-08-10",
    tags: ["frontend", "ui"],
    commentsCount: 0,
    attachments: [],
    createdAt: "2026-08-02T09:00:00Z",
    updatedAt: "2026-08-02T09:00:00Z",
  },
  {
    id: "3",
    title: "Write unit tests for TaskCard",
    description: "Jest + React Testing Library coverage",
    status: "todo",
    priority: "medium",
    assignee: null,
    dueDate: null,
    tags: ["testing"],
    commentsCount: 0,
    attachments: [],
    createdAt: "2026-08-03T09:00:00Z",
    updatedAt: "2026-08-03T09:00:00Z",
  },
  {
    id: "4",
    title: "Setup NextAuth credentials provider",
    description: "Connect login flow with DummyJSON auth endpoint",
    status: "todo",
    priority: "high",
    assignee: null,
    dueDate: "2026-08-15",
    tags: ["auth"],
    commentsCount: 0,
    attachments: [],
    createdAt: "2026-08-03T10:00:00Z",
    updatedAt: "2026-08-03T10:00:00Z",
  },
  {
    id: "5",
    title: "Add Framer Motion page transitions",
    description: "Smooth transitions between dashboard routes",
    status: "review",
    priority: "low",
    assignee: { id: 1, name: "Sohaib", avatarUrl: "" },
    dueDate: null,
    tags: ["animation"],
    commentsCount: 1,
    attachments: [],
    createdAt: "2026-08-04T09:00:00Z",
    updatedAt: "2026-08-04T09:00:00Z",
  },
  {
    id: "6",
    title: "Write Playwright E2E test for task flow",
    description: "Login -> create task -> drag to done",
    status: "todo",
    priority: "medium",
    assignee: null,
    dueDate: "2026-08-20",
    tags: ["testing", "e2e"],
    commentsCount: 0,
    attachments: [],
    createdAt: "2026-08-04T11:00:00Z",
    updatedAt: "2026-08-04T11:00:00Z",
  },
  {
    id: "7",
    title: "Setup GitHub Actions CI pipeline",
    description: "Run lint, type-check, and tests on push",
    status: "todo",
    priority: "medium",
    assignee: null,
    dueDate: null,
    tags: ["ci-cd"],
    commentsCount: 0,
    attachments: [],
    createdAt: "2026-08-05T09:00:00Z",
    updatedAt: "2026-08-05T09:00:00Z",
  },
];

// Real network jaisa lage iske liye artificial delay
function delay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateId(): string {
  return (Math.max(0, ...tasks.map((t) => Number(t.id))) + 1).toString();
}

// Ye functions exactly waise dikhte hain jaise real API calls hote —
// isliye baad mein swap karna easy hoga
export const mockTaskDb = {
  // Poora list — Kanban board ke liye (status-wise grouping ke liye sab tasks chahiye)
  async getAll(): Promise<Task[]> {
    await delay();
    return [...tasks]; // copy return karo, original array expose mat karo
  },

  // Paginated version — Tasks list page ke liye (infinite scroll / load more)
  async getPaginated(
    page: number,
    limit: number,
  ): Promise<{
    tasks: Task[];
    nextPage: number | null;
    total: number;
  }> {
    await delay();
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedTasks = tasks.slice(start, end);
    const hasMore = end < tasks.length;

    return {
      tasks: paginatedTasks,
      nextPage: hasMore ? page + 1 : null, // null = "aur pages nahi hain"
      total: tasks.length,
    };
  },

  async getById(id: string): Promise<Task | null> {
    await delay(200);
    return tasks.find((t) => t.id === id) ?? null;
  },

  async create(input: CreateTaskInput): Promise<Task> {
    await delay();
    const now = new Date().toISOString();
    const newTask: Task = {
      ...input,
      id: generateId(),
      commentsCount: 0,
      attachments: [],
      createdAt: now,
      updatedAt: now,
    };
    tasks = [newTask, ...tasks];
    return newTask;
  },

  async update(id: string, input: UpdateTaskInput): Promise<Task> {
    await delay();
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) throw new Error("Task not found");

    const updated: Task = {
      ...tasks[index],
      ...input,
      updatedAt: new Date().toISOString(),
    } as Task;

    tasks = [...tasks.slice(0, index), updated, ...tasks.slice(index + 1)];
    return updated;
  },

  async remove(id: string): Promise<void> {
    await delay(300);
    tasks = tasks.filter((t) => t.id !== id);
  },
};
