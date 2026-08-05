import { z } from "zod";

// Status aur priority ke liye enum — Zod ka apna "enum" validator
// Ye humare types/task.ts ke TaskStatus/TaskPriority se match hona chahiye
export const taskStatusEnum = z.enum(["todo", "in-progress", "review", "done"]);
export const taskPriorityEnum = z.enum(["low", "medium", "high", "urgent"]);

// Main schema — task create/edit form isi se validate hoga
export const taskFormSchema = z.object({
  title: z
    .string()
    .min(3, "Title kam se kam 3 characters ka hona chahiye")
    .max(100, "Title 100 characters se zyada nahi ho sakta"),

  description: z
    .string()
    .min(10, "Description kam se kam 10 characters ka ho")
    .max(1000, "Description bahut lamba hai"),

  status: taskStatusEnum,

  priority: taskPriorityEnum,

  assigneeId: z.number().nullable().optional(), // form mein assignee select nahi kiya to bhi chalega

  dueDate: z
    .string()
    .nullable()
    .refine((date) => date === null || !isNaN(Date.parse(date)), {
      message: "Due date valid nahi hai",
    }),

  tags: z
    .array(z.string())
    .max(5, "Zyada se zyada 5 tags allowed hain")
    .default([]),
});

// Zod schema se TypeScript type khud generate karo — do jagah likhne ki zaroorat nahi
export type TaskFormValues = z.infer<typeof taskFormSchema>;

// Login form ke liye bhi ek schema (Week 4 mein use hoga NextAuth ke sath)
export const loginFormSchema = z.object({
  username: z.string().min(1, "Username required hai"),
  password: z.string().min(4, "Password kam se kam 4 characters ka ho"),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
