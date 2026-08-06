"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  passwordFormSchema,
  type PasswordFormValues,
} from "@/lib/validations/settings.schema";
import { createClient } from "@/lib/supabase/client";

export function PasswordForm() {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: PasswordFormValues) {
    setSuccessMsg(null);
    setErrorMsg(null);

    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password: values.newPassword,
    });

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setSuccessMsg("Your password updated successfully.");
    reset();

    setShowNewPassword(false);
    setShowConfirmPassword(false);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* New Password */}
      <div>
        <label className="block text-sm font-medium text-[#232323]">
          New password
        </label>

        <div className="relative mt-1">
          <input
            {...register("newPassword")}
            type={showNewPassword ? "text" : "password"}
            className="w-full rounded border border-gray-300 px-3 py-2 pr-10 text-sm text-[#232323] outline-none focus:border-[#101828] focus:ring-0.5 focus:ring-[#101828]"
          />

          <button
            type="button"
            onClick={() => setShowNewPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-[#101828]"
            aria-label={
              showNewPassword ? "Hide new password" : "Show new password"
            }
          >
            {showNewPassword ? (
              <Eye size={18} />
            ) : (
              <EyeOff size={18} />
            )}
          </button>
        </div>

        {errors.newPassword && (
          <p className="mt-1 text-xs text-red-600">
            {errors.newPassword.message}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-sm font-medium text-[#232323]">
          Confirm new password
        </label>

        <div className="relative mt-1">
          <input
            {...register("confirmPassword")}
            type={showConfirmPassword ? "text" : "password"}
            className="w-full rounded border border-gray-300 px-3 py-2 pr-10 text-sm text-[#232323] outline-none focus:border-[#101828] focus:ring-0.5 focus:ring-[#101828]"
          />

          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-[#101828]"
            aria-label={
              showConfirmPassword
                ? "Hide confirm password"
                : "Show confirm password"
            }
          >
            {showConfirmPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>

        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-red-600">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Messages */}
      {successMsg && (
        <p className="text-sm text-green-600">{successMsg}</p>
      )}

      {errorMsg && (
        <p className="text-sm text-red-600">{errorMsg}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {isSubmitting ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}