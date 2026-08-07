import { z } from "zod";

// Status aur priority ke liye enum — Zod ka apna "enum" validator
// Ye humare types/task.ts ke TaskStatus/TaskPriority se match hona chahiye
export const taskStatusEnum = z.enum(["todo", "in-progress", "review", "done"]);
export const taskPriorityEnum = z.enum(["low", "medium", "high", "urgent"]);

// Main schema — task create/edit form isi se validate hoga
export const taskFormSchema = z.object({
  title: z
    .string()
    .min(3, "Title should be atleast 3 characters")
    .max(100, "Title shoulde not be more then 100 characters"),

  description: z
    .string()
    .refine(
      (val) => val.replace(/<[^>]*>/g, "").trim().length >= 10,
      "Description should be atleast 10 characters"
    )
    .refine(
      (val) => val.replace(/<[^>]*>/g, "").trim().length <= 1000,
      "Description should not be more than 1000 characters"
    ),

  status: taskStatusEnum,

  priority: taskPriorityEnum,

  assigneeId: z.string().nullable().optional(), // form mein assignee select nahi kiya to bhi chalega

  dueDate: z
    .string()
    .nullable()
    .refine((date) => date === null || !isNaN(Date.parse(date)), {
      message: "Due date valid nahi hai",
    }),

  tags: z
    .array(z.string())
    .max(5, "Zyada se zyada 5 tags allowed hain")
    .optional()
    .default([]),
});

// Zod schema se TypeScript type khud generate karo — do jagah likhne ki zaroorat nahi
export type TaskFormValues = z.infer<typeof taskFormSchema>;

// Login form ke liye bhi ek schema (Week 4 mein use hoga NextAuth ke sath)
export const loginFormSchema = z.object({
  email: z.string().email("Entered valid email address"),
  password: z.string().min(6, "Password should be atleast 6 characters"),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const signupFormSchema = z
  .object({
    username: z.string().min(3, "Username should be atleast 3 characters"),
    email: z.string().email("Plaese enter the valid email"),
    password: z.string().min(6, "Password should be atleast 6 characters"),
    confirmPassword: z.string(),
  })
  // refine() yahan CROSS-FIELD validation ke liye use ho raha hai —
  // password aur confirmPassword dono ko compare karna hai
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords doesn't match",
    path: ["confirmPassword"], // error yahi field ke neeche dikhega
  });

export type SignupFormValues = z.infer<typeof signupFormSchema>;
