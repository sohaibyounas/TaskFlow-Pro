// Status ke fixed values — union type, kisi aur string ki allowed nahi
export type TaskStatus = "todo" | "in-progress" | "review" | "done";

// Priority levels
export type TaskPriority = "low" | "medium" | "high" | "urgent";

// Ek user/assignee ka shape (chhota version — DummyJSON /users se aayega)
export interface Assignee {
  id: number;
  name: string;
  avatarUrl: string;
}

// Comment ka basic shape (abhi count hi use karenge, full comments baad mein)
export interface TaskComment {
  id: string;
  authorId: number;
  text: string;
  createdAt: string; // ISO date string
}

// Attachment — locally uploaded file ya media
export interface TaskAttachment {
  id: string;
  name: string;         // original file name
  url: string;          // object URL (local) ya remote URL
  type: string;         // MIME type e.g. "image/png", "video/mp4", "application/pdf"
  size: number;         // bytes
  addedAt: string;      // ISO date string
}

// Main Task interface — pura data model
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: Assignee | null; // null ho sakta hai — koi assign na ho
  dueDate: string | null; // ISO date string, ya null agar set nahi
  tags: string[]; // e.g. ["frontend", "urgent-fix"]
  commentsCount: number;
  attachments: TaskAttachment[]; // locally uploaded files / media
  createdAt: string;
  updatedAt: string;
}

// Task create karte waqt user sirf kuch fields deta hai —
// id, createdAt, updatedAt, commentsCount, attachments ye server/mock API generate karega
export type CreateTaskInput = Omit<
  Task,
  "id" | "createdAt" | "updatedAt" | "commentsCount" | "attachments"
>;

// Update ke liye — sab fields optional (partial update allowed)
export type UpdateTaskInput = Partial<CreateTaskInput> & { attachments?: TaskAttachment[] };

// Kanban board ke columns ka shape — status ko group karne ke liye
export interface TaskColumn {
  id: TaskStatus;
  title: string;
  taskIds: string[]; // sirf IDs rakhenge, actual task data alag se — normalized state pattern
}
