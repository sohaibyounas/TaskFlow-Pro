import { createClient } from "@/lib/supabase/client";
import type { TaskAttachment } from "@/types/task";

const BUCKET = "task-attachments";

export async function uploadAttachment(file: File): Promise<TaskAttachment> {
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
}

export async function deleteAttachment(url: string): Promise<void> {
  const supabase = createClient();

  // Extract path from public URL
  const parts = url.split(`/${BUCKET}/`);
  if (parts.length < 2) return;
  const path = parts[1];

  await supabase.storage.from(BUCKET).remove([path]);
}
