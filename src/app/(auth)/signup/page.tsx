"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  signupFormSchema,
  type SignupFormValues,
} from "@/lib/validations/task.schema";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/Toast";
import {
  LoaderCircle,
  Eye,
  EyeOff,
  Kanban,
  User,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  MailCheck,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && url.startsWith("http"));
}

export default function SignupPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: SignupFormValues) {
    setServerError(null);

    // 1. Verify if Supabase credentials are configured in .env.local
    if (!isSupabaseConfigured()) {
      const missingConfigMsg =
        "Supabase credentials are not configured in .env.local. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable real user registration and confirmation emails.";
      setServerError(missingConfigMsg);
      toast.error(
        "Please add NEXT_PUBLIC_SUPABASE_URL & ANON_KEY in .env.local to receive confirmation emails.",
        "Supabase Config Required",
      );
      return;
    }

    try {
      const supabase = createClient();
      const redirectUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : undefined;

      const { data, error } = await supabase.auth.signUp({
        email: values.email.trim(),
        password: values.password,
        options: {
          data: {
            username: values.username.trim(),
            full_name: values.username.trim(),
          },
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        setServerError(error.message);
        toast.error(error.message, "Signup Failed");
        return;
      }

      // Check if email confirmation is required (User created but no session yet)
      if (data.user && !data.session) {
        setRegisteredEmail(values.email.trim());
        toast.success(
          `Confirmation email sent to ${values.email}. Please verify your account.`,
          "Registration Successful",
        );
        return;
      }

      // If Supabase has email confirmation disabled, user is immediately logged in
      toast.success(
        "Account created successfully! Redirecting to workspace...",
        "Welcome to TaskFlow Pro",
      );
      router.refresh();
      router.push("/dashboard");
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during signup. Please try again.";
      setServerError(errMsg);
      toast.error(errMsg, "Registration Error");
    }
  }

  async function handleResendEmail() {
    if (!registeredEmail) return;
    setIsResending(true);

    try {
      const supabase = createClient();
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: registeredEmail,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        toast.error(error.message, "Resend Failed");
      } else {
        toast.success(
          `A fresh confirmation link was sent to ${registeredEmail}`,
          "Email Resent",
        );
      }
    } catch {
      toast.error("Could not resend confirmation email.", "Error");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-x-hidden overflow-y-auto bg-slate-950 p-3 sm:p-6 py-8 sm:py-12">
      {/* Ambient background glow elements */}
      <div className="absolute -left-20 -top-20 h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-blue-600/20 blur-[100px] sm:blur-[120px] pointer-events-none" />
      <div className="absolute -right-20 -bottom-20 h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-indigo-600/20 blur-[100px] sm:blur-[120px] pointer-events-none" />

      {/* Main Glass Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[440px] rounded-3xl border border-white/10 bg-white/95 p-5 sm:p-8 md:p-9 shadow-2xl backdrop-blur-2xl"
      >
        <AnimatePresence mode="wait">
          {registeredEmail ? (
            /* Email Confirmation Sent Screen */
            <motion.div
              key="confirmation-sent"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-2"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-md shadow-emerald-500/10">
                <MailCheck size={32} />
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Verify Your Email
              </h2>

              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                We&apos;ve sent a verification link to:
              </p>
              <div className="my-2.5 inline-block rounded-xl bg-slate-100 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-slate-900 break-all border border-slate-200">
                {registeredEmail}
              </div>

              <p className="text-xs text-slate-500 leading-normal max-w-xs mx-auto">
                Please check your inbox (and spam folder) and click the link to confirm your account and activate your workspace.
              </p>

              <div className="mt-6 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={isResending}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition active:scale-95 disabled:opacity-60 cursor-pointer"
                >
                  <RefreshCw
                    size={14}
                    className={isResending ? "animate-spin" : ""}
                  />
                  <span>
                    {isResending ? "Resending..." : "Didn't receive email? Resend"}
                  </span>
                </button>

                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 px-4 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer"
                >
                  <span>Go to Login</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>
          ) : (
            /* Signup Form Screen */
            <motion.div
              key="signup-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Brand Logo & Header */}
              <div className="mb-5 sm:mb-6 text-center">
                <div className="mx-auto mb-3 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
                  <Kanban size={24} />
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-slate-900">
                  Create Account
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-slate-500">
                  Join TaskFlow Pro & start organizing sprint boards
                </p>
              </div>

              {/* Signup Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-3.5">
                {/* Username Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    User Name
                  </label>
                  <div className="relative">
                    <User
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <input
                      {...register("username")}
                      type="text"
                      placeholder="e.g. Sohaib Younas"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                  {errors.username && (
                    <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-rose-600">
                      <AlertCircle size={12} />
                      {errors.username.message}
                    </p>
                  )}
                </div>

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
                      placeholder="you@domain.com"
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
                      placeholder="At least 6 characters"
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

                {/* Confirm Password Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <input
                      {...register("confirmPassword")}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter password"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-10 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition"
                    >
                      {showConfirmPassword ? <Eye size={17} /> : <EyeOff size={17} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-rose-600">
                      <AlertCircle size={12} />
                      {errors.confirmPassword.message}
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
                      <span>Creating Account...</span>
                      <LoaderCircle size={18} className="animate-spin" />
                    </>
                  ) : (
                    <>
                      <span>Create Free Workspace</span>
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
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Log in to workspace
                  </Link>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
