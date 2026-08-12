import type { Task, CreateTaskInput, UpdateTaskInput } from "@/types/task";

// In-memory "database" — module-level array, dev server ke chalte rehne tak persist karta hai
let tasks: Task[] = [
  {
    id: "1",
    title: "🚀 TaskFlow Pro 2.0 Dashboard Redesign",
    description: "<p>Implement modern <strong>Trello-inspired design architecture</strong> with dark gradient headers, glassmorphism cards, interactive metric widgets, and responsive layout.</p>",
    status: "in-progress",
    priority: "urgent",
    assignee: { id: 1, name: "Sohaib Younas", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" },
    dueDate: "2026-08-18",
    tags: ["UI/UX", "Frontend", "Next.js", "Design System"],
    commentsCount: 5,
    attachments: [
      {
        id: "att-1",
        name: "dashboard_mockup.png",
        url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
        type: "image/png",
        size: 1024500,
        addedAt: "2026-08-10T10:00:00Z",
      },
    ],
    createdAt: "2026-08-01T10:00:00Z",
    updatedAt: "2026-08-12T11:00:00Z",
  },
  {
    id: "2",
    title: "📱 Mobile Responsive Touch Navigation",
    description: "<p>Refine mobile sidebar drawer, touch gesture swipe tabs for Kanban columns, and ensure 100% responsiveness on smartphones and tablets.</p>",
    status: "in-progress",
    priority: "high",
    assignee: { id: 2, name: "Ayesha Khan", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" },
    dueDate: "2026-08-15",
    tags: ["Mobile", "Responsiveness", "TailwindCSS"],
    commentsCount: 3,
    attachments: [],
    createdAt: "2026-08-02T09:00:00Z",
    updatedAt: "2026-08-11T14:30:00Z",
  },
  {
    id: "3",
    title: "⚡ Drag & Drop Column Reordering & Animations",
    description: "<p>Enhance @dnd-kit drag-and-drop mechanics with Framer Motion spring physics, shadow elevation on drag, and drop target indicators.</p>",
    status: "todo",
    priority: "high",
    assignee: { id: 1, name: "Sohaib Younas", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" },
    dueDate: "2026-08-20",
    tags: ["Animation", "DND", "Framer Motion"],
    commentsCount: 2,
    attachments: [
      {
        id: "att-2",
        name: "animation_spec.jpg",
        url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80",
        type: "image/jpeg",
        size: 784000,
        addedAt: "2026-08-08T12:00:00Z",
      },
    ],
    createdAt: "2026-08-03T09:00:00Z",
    updatedAt: "2026-08-03T09:00:00Z",
  },
  {
    id: "4",
    title: "🔐 Supabase Auth & Realtime Sync Engine",
    description: "<p>Connect Supabase authentication with user profile state and sync task updates across active sessions in real-time.</p>",
    status: "done",
    priority: "urgent",
    assignee: { id: 3, name: "Hamza Malik", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" },
    dueDate: "2026-08-05",
    tags: ["Backend", "Supabase", "Auth", "Database"],
    commentsCount: 8,
    attachments: [],
    createdAt: "2026-07-28T10:00:00Z",
    updatedAt: "2026-08-05T16:00:00Z",
  },
  {
    id: "5",
    title: "🎨 Trello Label Color System & Tag Selector",
    description: "<p>Create dynamic label color pill generator with contrast text colors, hover tooltips, and filter-by-tag feature on board view.</p>",
    status: "review",
    priority: "medium",
    assignee: { id: 2, name: "Ayesha Khan", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" },
    dueDate: "2026-08-14",
    tags: ["Design", "UI/UX", "Feature"],
    commentsCount: 1,
    attachments: [
      {
        id: "att-3",
        name: "color_palette.png",
        url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80",
        type: "image/png",
        size: 512000,
        addedAt: "2026-08-09T15:00:00Z",
      },
    ],
    createdAt: "2026-08-04T09:00:00Z",
    updatedAt: "2026-08-11T10:00:00Z",
  },
  {
    id: "6",
    title: "📊 Analytics & Productivity Chart Widgets",
    description: "<p>Build visual task completion stats, team workload distribution meters, and productivity summary charts on the dashboard.</p>",
    status: "todo",
    priority: "medium",
    assignee: { id: 1, name: "Sohaib Younas", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" },
    dueDate: "2026-08-22",
    tags: ["Analytics", "Dashboard", "Frontend"],
    commentsCount: 0,
    attachments: [],
    createdAt: "2026-08-05T11:00:00Z",
    updatedAt: "2026-08-05T11:00:00Z",
  },
  {
    id: "7",
    title: "📎 File Attachment Preview & Dropzone",
    description: "<p>Support drag-and-drop file upload with inline previews for images, PDFs, text files, and media controls.</p>",
    status: "done",
    priority: "high",
    assignee: { id: 3, name: "Hamza Malik", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" },
    dueDate: "2026-08-09",
    tags: ["Storage", "Uploads", "Feature"],
    commentsCount: 4,
    attachments: [
      {
        id: "att-4",
        name: "architecture_diagram.png",
        url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
        type: "image/png",
        size: 1420000,
        addedAt: "2026-08-07T09:00:00Z",
      },
    ],
    createdAt: "2026-08-05T09:00:00Z",
    updatedAt: "2026-08-09T18:00:00Z",
  },
  {
    id: "8",
    title: "⚙️ User Settings & Custom Theme Selector",
    description: "<p>Allow users to customize workspace themes (Trello Slate, Ocean Blue, Sunset Glow), manage notifications, and update profile avatars.</p>",
    status: "review",
    priority: "low",
    assignee: { id: 2, name: "Ayesha Khan", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" },
    dueDate: "2026-08-16",
    tags: ["Settings", "Theme", "UI/UX"],
    commentsCount: 2,
    attachments: [],
    createdAt: "2026-08-06T14:00:00Z",
    updatedAt: "2026-08-12T08:00:00Z",
  },
  {
    id: "9",
    title: "🔍 Global Search & Task Filter Toolbar",
    description: "<p>Implement instant live search by title, tag filtering, priority toggles, and status filters across List and Board views.</p>",
    status: "todo",
    priority: "high",
    assignee: null,
    dueDate: "2026-08-25",
    tags: ["Search", "Filtering", "Frontend"],
    commentsCount: 0,
    attachments: [],
    createdAt: "2026-08-07T08:00:00Z",
    updatedAt: "2026-08-07T08:00:00Z",
  },
  {
    id: "10",
    title: "📝 Rich Text Task Editor & Formatting Toolbar",
    description: "<p>Integrate TipTap rich text editor with bold, italic, lists, code snippets, and custom color highlight support.</p>",
    status: "done",
    priority: "medium",
    assignee: { id: 1, name: "Sohaib Younas", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" },
    dueDate: "2026-08-07",
    tags: ["TipTap", "Editor", "Feature"],
    commentsCount: 3,
    attachments: [],
    createdAt: "2026-08-02T10:00:00Z",
    updatedAt: "2026-08-07T12:00:00Z",
  },
  {
    id: "11",
    title: "🧪 Automated Testing Suite with Vitest & Playwright",
    description: "<p>Write comprehensive unit tests for components and E2E automation for task creation, drag-and-drop, and edit flows.</p>",
    status: "todo",
    priority: "low",
    assignee: null,
    dueDate: "2026-08-30",
    tags: ["Testing", "Vitest", "Playwright"],
    commentsCount: 1,
    attachments: [],
    createdAt: "2026-08-08T09:00:00Z",
    updatedAt: "2026-08-08T09:00:00Z",
  },
  {
    id: "12",
    title: "🌐 Dark Mode & Accessibility Optimizations",
    description: "<p>Add full dark theme support, keyboard shortcuts for board navigation, screen reader ARIA labels, and WCAG AA color compliance.</p>",
    status: "todo",
    priority: "medium",
    assignee: { id: 3, name: "Hamza Malik", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" },
    dueDate: "2026-08-28",
    tags: ["Accessibility", "Dark Mode", "UX"],
    commentsCount: 0,
    attachments: [],
    createdAt: "2026-08-09T10:00:00Z",
    updatedAt: "2026-08-09T10:00:00Z",
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
    const { assigneeId, ...rest } = input;
    const newTask: Task = {
      ...rest,
      id: generateId(),
      commentsCount: 0,
      attachments: [],
      assignee: null, // mock DB ignores assigneeId for now
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
