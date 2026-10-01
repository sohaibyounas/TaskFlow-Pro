import { createClient } from "@/lib/supabase/client";
import type { TaskAttachment } from "@/types/task";

const BUCKET = "task-attachments";

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && url.startsWith("http"));
}

export async function uploadAttachment(file: File): Promise<TaskAttachment> {
  if (!isSupabaseConfigured()) {
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type || "application/octet-stream",
      size: file.size,
      addedAt: new Date().toISOString(),
    };
  }

  try {
    const supabase = createClient();

    // Unique path: userId/timestamp-filename
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const path = `${user?.id ?? "anon"}/${fileName}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: false });

    if (error) throw new Error(error.message);

    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(path);

    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: file.name,
      url: urlData.publicUrl,
      type: file.type || "application/octet-stream",
      size: file.size,
      addedAt: new Date().toISOString(),
    };
  } catch {
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type || "application/octet-stream",
      size: file.size,
      addedAt: new Date().toISOString(),
    };
  }
}

export async function deleteAttachment(url: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  try {
    const supabase = createClient();

    // Extract path from public URL
    const parts = url.split(`/${BUCKET}/`);
    if (parts.length < 2) return;
    const path = parts[1]!;

    await supabase.storage.from(BUCKET).remove([path]);
  } catch {
    // Ignore deletion errors in fallback mode
  }
}
