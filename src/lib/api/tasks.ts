// src/lib/api/tasks.ts
import { mockTaskDb } from "@/lib/mock/db";
import type { Task, CreateTaskInput, UpdateTaskInput } from "@/types/task";

// Ye "API layer" hai — hooks isi ko call karenge, kabhi mockTaskDb ya
// api.ts ko directly nahi. Kal jab real Node backend ready ho, sirf
// yahan ke andar ka implementation badlega (mockTaskDb → api.get/post/put/delete)
// Function signatures SAME rahenge, isliye upar ka poora app untouched rahega.

export async function fetchTasks(): Promise<Task[]> {
  // REAL BACKEND VERSION (future):
  // return api.get<Task[]>("/tasks");
  return mockTaskDb.getAll();
}

export async function fetchTaskById(id: string): Promise<Task | null> {
  // REAL: return api.get<Task>(`/tasks/${id}`);
  return mockTaskDb.getById(id);
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  // REAL: return api.post<Task>("/tasks", input);
  return mockTaskDb.create(input);
}

export async function updateTask(
  id: string,
  input: UpdateTaskInput,
): Promise<Task> {
  // REAL: return api.put<Task>(`/tasks/${id}`, input);
  return mockTaskDb.update(id, input);
}

export async function deleteTask(id: string): Promise<void> {
  // REAL: return api.delete<void>(`/tasks/${id}`);
  return mockTaskDb.remove(id);
}
