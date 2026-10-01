import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Ye client Server Components, Server Actions, aur Route Handlers mein use hoga
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase environment variables are missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component se cookies.set() call hone pe ye error throw hota hai —
            // ye safe hai IGNORE karna, kyunki middleware already session refresh
            // handle kar raha hoga (agla step mein banayenge)
          }
        },
      },
    },
  );
}
