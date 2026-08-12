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
import {
  Eye,
  EyeOff,
  Kanban,
  Mail,
  Lock,
  LoaderCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setValue,
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
          ? "Incorrect email or password."
          : error.message,
      );
      return;
    }

    router.refresh();
    router.push("/dashboard");
  }

  function handleFillDemo() {
    setValue("email", "sohaib@taskflowpro.com");
    setValue("password", "demo123456");
    setServerError(null);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 p-4 sm:p-6 scrollbar-hide">
      {/* Ambient background glow elements */}
      <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-purple-600/10 blur-[100px] pointer-events-none" />

      {/* Main Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white/95 p-6 sm:p-10 shadow-2xl backdrop-blur-xl"
      >
        {/* Brand Logo & Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
            <Kanban size={26} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Welcome Back
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Log in to manage your Trello workspace & sprint cards
          </p>
        </div>

        {/* Quick Demo Login Banner */}
        <div className="mb-6 rounded-2xl bg-blue-50/80 p-3 border border-blue-100/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px] text-blue-900 font-medium">
            <Sparkles size={16} className="text-blue-600 flex-shrink-0" />
            <span>Test the app instantly with demo credentials</span>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="flex-shrink-0 rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs hover:bg-blue-700 transition"
          >
            Auto Fill
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                {...register("email")}
                type="email"
                placeholder="you@taskflowpro.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-xs font-semibold text-rose-600">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-10 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs font-semibold text-rose-600">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Server Error Message */}
          {serverError && (
            <div className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-600 border border-rose-100">
              {serverError}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.01] hover:shadow-blue-500/40 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <span>Signing in...</span>
                <LoaderCircle size={18} className="animate-spin" />
              </>
            ) : (
              <>
                <span>Sign In to Workspace</span>
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-6 text-center border-t border-slate-100 pt-5">
          <p className="text-xs text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Create free account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
