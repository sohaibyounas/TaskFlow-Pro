"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginFormSchema,
  type LoginFormValues,
} from "@/lib/validations/task.schema";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff } from "lucide-react"; // 1. Eye icons import kiye

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false); // 2. Password visibility state

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setServerError(
        error.message === "Invalid login credentials"
          ? "Email ya password galat hai"
          : error.message,
      );
      return;
    }

    router.refresh();
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm space-y-4 rounded-lg bg-white p-6 shadow"
      >
        <h1 className="text-xl font-semibold text-[#232323]">
          TaskFlow Pro — Login
        </h1>

        <div>
          <label className="block text-sm font-medium text-[#232323]">
            Email
          </label>
          <input
            {...register("email")}
            type="email"
            // 3. Placeholder ka size customize karne ke liye 'placeholder:text-xs' ya 'placeholder:text-[11px]' use karein
            className="mt-1 w-full rounded border px-3 py-2 text-sm text-[#232323] placeholder:text-xs placeholder:text-gray-400"
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#232323]">
            Password
          </label>
          {/* 4. Relative wrapper container for password input & eye icon alignment */}
          <div className="relative mt-1">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"} // Dynamic type change
              className="w-full rounded border px-3 py-2 pr-10 text-sm text-[#232323]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
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

        <p className="text-center text-xs text-gray-500">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="relative inline-block text-blue-600 after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:origin-right after:scale-x-0 after:bg-blue-600 after:transition-transform after:duration-300 hover:after:origin-left hover:after:scale-x-100"
          >
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
