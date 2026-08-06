"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  profileFormSchema,
  type ProfileFormValues,
} from "@/lib/validations/settings.schema";
import { createClient } from "@/lib/supabase/client";

interface ProfileFormProps {
  initialUsername: string;
  email: string;
}

export function ProfileForm({ initialUsername, email }: ProfileFormProps) {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { username: initialUsername },
  });

  async function onSubmit(values: ProfileFormValues) {
    setSuccessMsg(null);
    setErrorMsg(null);
    const supabase = createClient();

    // user_metadata update karta hai
    const { error } = await supabase.auth.updateUser({
      data: { username: values.username },
    });

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setSuccessMsg("Profile updated successfully");

    setTimeout(() => {
      setSuccessMsg(null);
    }, 1000);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[#232323]">
          Email
        </label>
        <input
          value={email}
          disabled
          className="mt-1 w-full rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-[#6A7282]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#232323]">
          Display name
        </label>
        <input
          {...register("username")}
          className="mt-1 w-full rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-[#6A7282] outline-none focus:border-[#101828] focus:ring-0.5 focus:ring-[#101828]"
        />
        {errors.username && (
          <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>
        )}
      </div>

      {successMsg && <p className="text-sm text-green-600">{successMsg}</p>}
      {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {isSubmitting ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
