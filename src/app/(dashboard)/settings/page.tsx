import { createClient } from "@/lib/supabase/server";
import { SettingsClient } from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  let userEmail = "sohaib@taskflowpro.com";
  let username = "Sohaib Younas";

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      userEmail = user.email ?? userEmail;
      username = (user.user_metadata?.username as string) ?? username;
    }
  } catch {
    // fallback
  }

  return <SettingsClient username={username} userEmail={userEmail} />;
}


