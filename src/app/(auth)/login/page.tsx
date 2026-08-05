"use client"; 

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginFormSchema,
  type LoginFormValues,
} from "@/lib/validations/task.schema";
import { api, ApiError } from "@/lib/api";

// DummyJSON /auth/login jo response deta hai, uska shape
interface LoginResponse {
  id: number;
  username: string;
  accessToken: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema), // Zod schema RHF se connect
    defaultValues: { username: "", password: "" },
  });

  // Ye function tabhi call hoga jab Zod validation PASS ho jaye
  async function onSubmit(values: LoginFormValues) {
    setServerError(null);
    try {
      const data = await api.post<LoginResponse>("/auth/login", {
        username: values.username,
        password: values.password,
        expiresInMins: 60,
      });

      localStorage.setItem("taskflow_token", data.accessToken);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(
          err.status === 400 ? "Username ya password galat hai" : err.message,
        );
      } else {
        setServerError("Kuch galat ho gaya, dobara try karo");
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm space-y-4 rounded-lg bg-white p-6 shadow"
      >
        <h1 className="text-xl font-semibold">TaskFlow Pro — Login</h1>

        <div>
          <label className="block text-sm font-medium">Username</label>
          <input
            {...register("username")}
            className="mt-1 w-full rounded border px-3 py-2 text-sm"
            placeholder="e.g. emilys"
          />
          {errors.username && (
            <p className="mt-1 text-xs text-red-600">
              {errors.username.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            {...register("password")}
            className="mt-1 w-full rounded border px-3 py-2 text-sm"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        {serverError && <p className="text-sm text-red-600">{serverError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded bg-black py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>

        <p className="text-xs text-gray-500">
          Test credentials: <b>emilys</b> / <b>emilyspass</b> (DummyJSON demo
          user)
        </p>
      </form>
    </div>
  );
}
