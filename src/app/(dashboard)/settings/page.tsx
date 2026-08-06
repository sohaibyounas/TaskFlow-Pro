import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { PasswordForm } from "@/components/settings/PasswordForm";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login"); 

  const username = (user.user_metadata?.username as string) ?? "";

  return (
    <div className="h-full overflow-y-auto p-6">
      <h2 className="mb-4 text-lg font-semibold text-[#232323]">Settings</h2>

      <div className="w-full flex flex-col gap-5">
        <section className="rounded-lg border bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-[#232323]">Profile</h3>
          <ProfileForm initialUsername={username} email={user.email ?? ""} />
        </section>

        <section className="rounded-lg border bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-[#232323]">Password</h3>
          <PasswordForm />
        </section>
      </div>
    </div>
  );
}
