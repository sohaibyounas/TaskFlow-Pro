import { createClient } from "@/lib/supabase/client";

// Profile ka shape — profiles table se match karta hai
export interface Profile {
    id: string;
    username: string;
    avatarUrl: string | null;
}

export async function fetchProfiles(): Promise<Profile[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .order("username", { ascending: true });

    if (error) throw new Error(error.message);

    return data.map((row) => ({
        id: row.id,
        username: row.username,
        avatarUrl: row.avatar_url,
    }));
}