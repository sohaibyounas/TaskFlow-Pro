// src/lib/api.ts

// Base URL — jab tumhara Node backend (TaskFlow API) ready ho,
// sirf ye ek line change karni hogi. Baaki poora app untouched rahega.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://dummyjson.com";

// Custom error class — normal Error se better hai kyunki hum
// status code bhi carry kar sakte hain (401, 404, 500 alag handle karne ke liye)
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// Generic fetch wrapper — <T> se hum kisi bhi response type ko
// type-safe bana sakte hain (Task[], Task, User, etc.)
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getStoredToken(); // niche define hai

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    // Agar server error message bhejta hai to wo nikal lo, warna generic message
    const errorBody = await response.json().catch(() => null);
    throw new ApiError(
      errorBody?.message ?? `Request failed with status ${response.status}`,
      response.status,
    );
  }

  return response.json() as Promise<T>;
}

// Token localStorage se nikalne ka helper (Week 4 mein NextAuth se replace/integrate hoga)
function getStoredToken(): string | null {
  if (typeof window === "undefined") return null; // Server Component pe window nahi hota
  return localStorage.getItem("taskflow_token");
}

// Exported methods — components/hooks inhi ko call karenge, direct fetch() kabhi nahi
export const api = {
  get: <T>(endpoint: string) => apiFetch<T>(endpoint, { method: "GET" }),

  post: <T>(endpoint: string, body: unknown) =>
    apiFetch<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body: unknown) =>
    apiFetch<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: <T>(endpoint: string) => apiFetch<T>(endpoint, { method: "DELETE" }),
};
