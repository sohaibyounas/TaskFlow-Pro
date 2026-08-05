// src/lib/mock/db.ts
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
    createdAt: "2026-08-03T09:00:00Z",
    updatedAt: "2026-08-03T09:00:00Z",
  },
];

// Real network jaisa lagao iske liye artificial delay
function delay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateId(): string {
  return (Math.max(0, ...tasks.map((t) => Number(t.id))) + 1).toString();
}

// Ye functions exactly waise dikhte hain jaise real API calls hote —
// isliye baad mein swap karna easy hoga
export const mockTaskDb = {
  async getAll(): Promise<Task[]> {
    await delay();
    return [...tasks]; // copy return karo, original array expose mat karo
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
