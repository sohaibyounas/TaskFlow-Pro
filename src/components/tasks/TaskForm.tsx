"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Paperclip, X, FileText, Image as ImageIcon, Film, Music,
  Upload, Loader2, Play, Pause, FileSpreadsheet,
} from "lucide-react";
import { taskFormSchema, type TaskFormValues } from "@/lib/validations/task.schema";
import { useCreateTask, useUpdateTask } from "@/hooks/useTaskMutations";
import { useProfiles } from "@/hooks/useProfiles"; //  NAYA — assignee dropdown ke liye
import type { Task, TaskAttachment } from "@/types/task";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { uploadAttachment } from "@/lib/supabase/storage";

interface TaskFormProps {
  onSuccess?: () => void;
  task?: Task;
  onAttachmentsReady?: (attachments: TaskAttachment[]) => void;
}

// ── helpers

function isImage(t: string) { return t.startsWith("image/"); }
function isVideo(t: string) { return t.startsWith("video/"); }
function isAudio(t: string) { return t.startsWith("audio/"); }
function isPdf(t: string) { return t === "application/pdf"; }
function isDoc(t: string) {
  return t === "application/msword" ||
    t === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
}
function isSheet(t: string) {
  return t === "application/vnd.ms-excel" ||
    t === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
}
function isSlide(t: string) {
  return t === "application/vnd.ms-powerpoint" ||
    t === "application/vnd.openxmlformats-officedocument.presentationml.presentation";
}
function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function FileTypeIcon({ type, size = 22 }: { type: string; size?: number }) {
  if (isImage(type)) return <ImageIcon size={size} className="text-purple-500" />;
  if (isVideo(type)) return <Film size={size} className="text-blue-500" />;
  if (isAudio(type)) return <Music size={size} className="text-green-500" />;
  if (isPdf(type)) return <FileText size={size} className="text-red-500" />;
  if (isDoc(type)) return <FileText size={size} className="text-blue-600" />;
  if (isSheet(type)) return <FileSpreadsheet size={size} className="text-green-600" />;
  if (isSlide(type)) return <FileText size={size} className="text-orange-500" />;
  return <FileText size={size} className="text-gray-500" />;
}

// ── Attachment card (grid tile) ───────────────────────────────────────────────

function AttachmentCard({
  attachment,
  onRemove,
}: {
  attachment: TaskAttachment;
  onRemove: (id: string) => void;
}) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  function toggleVideo() {
    if (!videoRef.current) return;
    if (playing) { videoRef.current.pause(); setPlaying(false); }
    else { videoRef.current.play(); setPlaying(true); }
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
      <button
        type="button"
        onClick={() => onRemove(attachment.id)}
        className="absolute right-1.5 top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
      >
        <X size={10} />
      </button>

      {isImage(attachment.type) ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={attachment.url} alt={attachment.name} className="h-24 w-full object-cover" />
      ) : isVideo(attachment.type) ? (
        <div className="relative h-24 bg-black">
          <video ref={videoRef} src={attachment.url}
            className="h-full w-full object-contain" onEnded={() => setPlaying(false)} />
          <button
            type="button"
            onClick={toggleVideo}
            className="absolute inset-0 flex items-center justify-center bg-black/30 transition hover:bg-black/50"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white">
              {playing ? <Pause size={14} /> : <Play size={14} />}
            </span>
          </button>
        </div>
      ) : isAudio(attachment.type) ? (
        <div className="flex h-16 items-center px-3">
          <Music size={16} className="mr-2 flex-shrink-0 text-green-500" />
          <audio src={attachment.url} controls className="h-8 w-full" />
        </div>
      ) : (
        <div className="flex h-16 items-center justify-center">
          <FileTypeIcon type={attachment.type} size={28} />
        </div>
      )}

      <div className="px-2 py-1.5">
        <p className="truncate text-xs font-medium text-gray-700">{attachment.name}</p>
        <p className="text-[10px] text-gray-400">{formatBytes(attachment.size)}</p>
      </div>
    </div>
  );
}

// ── Main Form ─────────────────────────────────────────────────────────────────

export function TaskForm({ onSuccess, task, onAttachmentsReady }: TaskFormProps) {
  const isEditMode = !!task;
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const activeMutation = isEditMode ? updateTaskMutation : createTaskMutation;

  const { data: profiles, isLoading: profilesLoading } = useProfiles(); //   NAYA

  const [attachments, setAttachments] = useState<TaskAttachment[]>(task?.attachments ?? []);
  const [uploadingIds, setUploadingIds] = useState<Set<string>>(new Set());
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setAttachments(task?.attachments ?? []); }, [task?.id]);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadError(null);

    await Promise.all(
      files.map(async (file) => {
        const tempId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        setUploadingIds((p) => new Set(p).add(tempId));
        try {
          const uploaded = await uploadAttachment(file);
          setAttachments((p) => [...p, uploaded]);
        } catch {
          setUploadError(`${file.name} upload failed, try again.`);
        } finally {
          setUploadingIds((p) => { const n = new Set(p); n.delete(tempId); return n; });
        }
      }),
    );
    e.target.value = "";
  }

  function removeAttachment(id: string) {
    setAttachments((p) => p.filter((a) => a.id !== id));
  }

  const { register, control, handleSubmit, reset, formState: { errors } } =
    useForm<TaskFormValues>({
      resolver: zodResolver(taskFormSchema) as any,
      defaultValues: task
        ? {
          title: task.title, description: task.description, status: task.status,
          priority: task.priority,
          assigneeId: task.assignee?.id != null ? String(task.assignee.id) : null,
          dueDate: task.dueDate, tags: task.tags ?? []
        }
        : {
          title: "", description: "", status: "todo", priority: "medium",
          assigneeId: null, dueDate: null, tags: []
        },
    });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title, description: task.description, status: task.status,
        priority: task.priority,
        assigneeId: task.assignee?.id != null ? String(task.assignee.id) : null,
        dueDate: task.dueDate, tags: task.tags ?? []
      });
    }
  }, [task?.id]);

  const onSubmit: SubmitHandler<TaskFormValues> = (values) => {
    const handleDone = () => { onAttachmentsReady?.(attachments); onSuccess?.(); };

    //   NAYA — empty string ("Unassigned" option) ko null treat karo
    const assigneeId = values.assigneeId || null;

    if (isEditMode) {
      updateTaskMutation.mutate(
        {
          id: task.id, input: {
            title: values.title, description: values.description,
            status: values.status, priority: values.priority,
            dueDate: values.dueDate, tags: values.tags, attachments,
            assigneeId
          }
        }, //   NAYA
        { onSuccess: handleDone },
      );
    } else {
      createTaskMutation.mutate(
        {
          title: values.title, description: values.description, status: values.status,
          priority: values.priority, dueDate: values.dueDate,
          tags: values.tags, attachments,
          assigneeId
        }, //   NAYA — "assignee: null" ki jagah
        { onSuccess: () => { reset(); setAttachments([]); handleDone(); } },
      );
    }
  };

  const isUploading = uploadingIds.size > 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-4">

        <div>
          <label className="block text-sm font-medium text-[#232323]">Title</label>
          <input {...register("title")}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#232323] outline-none focus:border-gray-400"
            placeholder="e.g. Fix navbar overlap bug" />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#232323]">Description</label>
          <Controller name="description" control={control}
            render={({ field }) => (
              <div className="mt-1">
                <RichTextEditor content={field.value ?? ""} onChange={field.onChange}
                  placeholder="Add task description..." variant="compact" />
              </div>
            )} />
          {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-[#232323]">Status</label>
            <select {...register("status")}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#232323] outline-none focus:border-gray-400">
              <option value="todo">Todo</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#232323]">Priority</label>
            <select {...register("priority")}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#232323] outline-none focus:border-gray-400">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/*   NAYA — Assignee dropdown */}
        <div>
          <label className="block text-sm font-medium text-[#232323]">Assignee</label>
          <select
            {...register("assigneeId")}
            disabled={profilesLoading}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#232323] outline-none focus:border-gray-400"
          >
            <option value="">Unassigned</option>
            {profiles?.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.username}
              </option>
            ))}
          </select>
        </div>

        {/* Attachments */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-sm font-medium text-[#232323]">
              <Paperclip size={14} />
              Attachments
              {attachments.length > 0 && (
                <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
                  {attachments.length}
                </span>
              )}
            </label>
            <button type="button" onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 transition hover:bg-gray-200 disabled:opacity-50">
              {isUploading ? <Loader2 size={11} className="animate-spin" /> : <Upload size={11} />}
              {isUploading ? "Uploading..." : "Add file"}
            </button>
          </div>

          <input ref={fileInputRef} type="file" multiple className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.md"
            onChange={handleFileSelect} />

          {uploadError && <p className="mb-2 text-xs text-red-600">{uploadError}</p>}

          {attachments.length === 0 && !isUploading ? (
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-5 text-xs text-gray-400 transition hover:border-gray-300 hover:text-gray-500">
              <Paperclip size={14} />
              Click to attach files, images, videos, PDFs, docs…
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {attachments.map((att) => (
                <AttachmentCard key={att.id} attachment={att} onRemove={removeAttachment} />
              ))}
              {Array.from(uploadingIds).map((id) => (
                <div key={id} className="flex h-24 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50">
                  <Loader2 size={20} className="animate-spin text-gray-400" />
                </div>
              ))}
              <button type="button" onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex min-h-[6rem] items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-200 text-xs text-gray-400 transition hover:border-gray-300 hover:text-gray-500 disabled:opacity-50">
                <Upload size={14} />
                Add more
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 border-t border-gray-100 px-6 py-4">
        <button type="submit" disabled={activeMutation.isPending || isUploading}
          className="flex w-full items-center justify-center gap-2 cursor-pointer rounded-xl bg-gray-800 py-2.5 text-sm font-medium text-white shadow-md transition hover:bg-gray-700 disabled:opacity-50">
          <span>
            {activeMutation.isPending
              ? isEditMode ? "Updating..." : "Creating..."
              : isUploading ? "Waiting for uploads..."
                : isEditMode ? "Update Task" : "Create Task"}
          </span>
          {activeMutation.isPending && <Loader2 size={16} className="animate-spin" />}
        </button>
        {activeMutation.isError && (
          <p className="mt-2 text-center text-xs text-red-600">
            {isEditMode ? "Task didn't update" : "Task didn't create"}, try again
          </p>
        )}
      </div>
    </form>
  );
}