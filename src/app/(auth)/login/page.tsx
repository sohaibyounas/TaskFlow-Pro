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
import { toast } from "@/components/ui/Toast";
import {
  Eye,
  EyeOff,
  Kanban,
  Mail,
  Lock,
  LoaderCircle,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && url.startsWith("http"));
}

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

    // If Supabase credentials are not configured, allow demo login or show toast
    if (!isSupabaseConfigured()) {
      if (
        values.email === "sohaib@taskflowpro.com" &&
        values.password === "demo123456"
      ) {
        toast.success("Logged in with Demo Account!", "Welcome Back");
        router.refresh();
        router.push("/dashboard");
        return;
      }

      toast.info(
        "Supabase credentials not configured in .env.local. Logging into Demo Workspace...",
        "Demo Workspace",
      );
      router.refresh();
      router.push("/dashboard");
      return;
    }

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithPassword({
        email: values.email.trim(),
        password: values.password,
      });

      if (error) {
        const readableMsg =
          error.message === "Invalid login credentials"
            ? "Incorrect email or password. If you just registered, please verify your email first."
            : error.message;
        setServerError(readableMsg);
        toast.error(readableMsg, "Login Failed");
        return;
      }

      toast.success("Logged in successfully! Loading workspace...", "Welcome");
      router.refresh();
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to sign in. Please try again.";
      setServerError(msg);
      toast.error(msg, "Error");
    }
  }

  function handleFillDemo() {
    setValue("email", "sohaib@taskflowpro.com");
    setValue("password", "demo123456");
    setServerError(null);
    toast.info("Demo credentials filled! Click 'Sign In' to proceed.", "Auto Fill");
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-x-hidden overflow-y-auto bg-slate-950 p-3 sm:p-6 py-8 sm:py-12">
      {/* Ambient background glow elements */}
      <div className="absolute -left-20 -top-20 h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-blue-600/20 blur-[100px] sm:blur-[120px] pointer-events-none" />
      <div className="absolute -right-20 -bottom-20 h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-indigo-600/20 blur-[100px] sm:blur-[120px] pointer-events-none" />

      {/* Main Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[440px] rounded-3xl border border-white/10 bg-white/95 p-5 sm:p-8 md:p-9 shadow-2xl backdrop-blur-2xl"
      >
        {/* Brand Logo & Header */}
        <div className="mb-5 sm:mb-6 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
            <Kanban size={24} />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-slate-900">
            Welcome Back
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Log in to manage your Trello workspace & sprint cards
          </p>
        </div>

        {/* Quick Demo Login Banner */}
        <div className="mb-5 rounded-2xl bg-blue-50/80 p-3 border border-blue-100/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px] text-blue-900 font-medium">
            <Sparkles size={16} className="text-blue-600 flex-shrink-0" />
            <span>Test instantly with demo credentials</span>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="flex-shrink-0 rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs hover:bg-blue-700 transition active:scale-95 cursor-pointer"
          >
            Auto Fill
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          {/* Email Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                {...register("email")}
                type="email"
                placeholder="you@taskflowpro.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>
            {errors.email && (
              <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-rose-600">
                <AlertCircle size={12} />
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-10 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? <Eye size={17} /> : <EyeOff size={17} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-rose-600">
                <AlertCircle size={12} />
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Server Error Alert */}
          {serverError && (
            <div className="rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700 border border-rose-200 flex items-start gap-2">
              <AlertCircle size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
              <span className="leading-snug">{serverError}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/40 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
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
                  size={17}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-5 text-center border-t border-slate-100 pt-4">
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
