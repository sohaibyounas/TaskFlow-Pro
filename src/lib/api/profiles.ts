import { createClient } from "@/lib/supabase/client";

// Profile ka shape — profiles table se match karta hai
export interface Profile {
  id: string;
  username: string;
  avatarUrl: string | null;
}

const MOCK_PROFILES: Profile[] = [
  {
    id: "1",
    username: "Sohaib Younas",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: "2",
    username: "Ayesha Khan",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: "3",
    username: "Hamza Malik",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
  },
];

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && url.startsWith("http"));
}

export async function fetchProfiles(): Promise<Profile[]> {
  if (!isSupabaseConfigured()) {
    return MOCK_PROFILES;
  }

  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .order("username", { ascending: true });

    if (error || !data || data.length === 0) {
      return MOCK_PROFILES;
    }

    return data.map((row) => ({
      id: row.id,
      username: row.username,
      avatarUrl: row.avatar_url,
    }));
  } catch {
    return MOCK_PROFILES;
  }
}