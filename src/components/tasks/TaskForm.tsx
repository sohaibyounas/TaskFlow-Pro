"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Paperclip,
  X,
  FileText,
  Image as ImageIcon,
  Film,
  Music,
  Upload,
  Loader2,
  Play,
  Pause,
} from "lucide-react";
import {
  taskFormSchema,
  type TaskFormValues,
} from "@/lib/validations/task.schema";
import { useCreateTask, useUpdateTask } from "@/hooks/useTaskMutations";
import type { Task, TaskAttachment } from "@/types/task";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { uploadAttachment, deleteAttachment } from "@/lib/supabase/storage";

interface TaskFormProps {
  onSuccess?: () => void;
  task?: Task;
  onAttachmentsReady?: (attachments: TaskAttachment[]) => void;
}

function isImage(type: string) { return type.startsWith("image/"); }
function isVideo(type: string) { return type.startsWith("video/"); }
function isAudio(type: string) { return type.startsWith("audio/"); }
function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Attachment preview card ───────────────────────────────────────────────────

function AttachmentPreview({
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
    <div className="relative rounded-xl border border-gray-100 bg-gray-50 overflow-hidden">
      {/* Remove button */}
      <button
        type="button"
        onClick={() => onRemove(attachment.id)}
        className="absolute right-1.5 top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
        aria-label={`Remove ${attachment.name}`}
      >
        <X size={10} />
      </button>

      {/* Preview area */}
      {isImage(attachment.type) ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={attachment.url}
          alt={attachment.name}
          className="h-28 w-full object-cover"
        />
      ) : isVideo(attachment.type) ? (
        <div className="group/video relative h-28 bg-black">
          <video
            ref={videoRef}
            src={attachment.url}
            className="h-full w-full object-contain"
            onEnded={() => setPlaying(false)}
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover/video:opacity-100">
            <button
              type="button"
              onClick={toggleVideo}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition hover:bg-black/80"
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
          </div>
        </div>
      ) : isAudio(attachment.type) ? (
        <div className="flex h-16 items-center px-3">
          <Music size={16} className="mr-2 flex-shrink-0 text-green-500" />
          <audio src={attachment.url} controls className="w-full h-8" />
        </div>
      ) : (
        <div className="flex h-16 items-center justify-center gap-2">
          <FileText size={20} className="text-gray-400" />
        </div>
      )}

      {/* File name + size */}
      <div className="px-2 py-1.5">
        <p className="truncate text-xs font-medium text-gray-700">{attachment.name}</p>
        <p className="text-[10px] text-gray-400">{formatBytes(attachment.size)}</p>
      </div>
    </div>
  );
}

// ── Main Form ─────────────────────────────────────────────────────────────────

export function TaskForm({
  onSuccess,
  task,
  onAttachmentsReady,
}: TaskFormProps) {
  const isEditMode = !!task;

  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const activeMutation = isEditMode ? updateTaskMutation : createTaskMutation;

  const [attachments, setAttachments] = useState<TaskAttachment[]>(task?.attachments ?? []);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAttachments(task?.attachments ?? []);
  }, [task?.id]);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded = await Promise.all(files.map((f) => uploadAttachment(f)));
      setAttachments((prev) => [...prev, ...uploaded]);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
    e.target.value = "";
  }

  async function removeAttachment(id: string) {
    const att = attachments.find((a) => a.id === id);
    setAttachments((prev) => prev.filter((a) => a.id !== id));
    if (att) {
      try { await deleteAttachment(att.url); } catch {}
    }
  }

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema) as any,
    defaultValues: task
      ? {
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          assigneeId: task.assignee?.id ?? null,
          dueDate: task.dueDate,
          tags: task.tags ?? [],
        }
      : {
          title: "",
          description: "",
          status: "todo",
          priority: "medium",
          assigneeId: null,
          dueDate: null,
          tags: [],
        },
  });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assigneeId: task.assignee?.id ?? null,
        dueDate: task.dueDate,
        tags: task.tags ?? [],
      });
    }
  }, [task?.id]);

  const onSubmit: SubmitHandler<TaskFormValues> = (values) => {
    const handleDone = () => {
      onAttachmentsReady?.(attachments);
      onSuccess?.();
    };

    if (isEditMode) {
      updateTaskMutation.mutate(
        {
          id: task.id,
          input: {
            title: values.title,
            description: values.description,
            status: values.status,
            priority: values.priority,
            dueDate: values.dueDate,
            tags: values.tags,
            attachments,
          },
        },
        { onSuccess: handleDone },
      );
    } else {
      createTaskMutation.mutate(
        {
          title: values.title,
          description: values.description,
          status: values.status,
          priority: values.priority,
          assignee: null,
          dueDate: values.dueDate,
          tags: values.tags,
          attachments,
        } as any,
        {
          onSuccess: () => {
            reset();
            setAttachments([]);
            handleDone();
          },
        },
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-1 flex-col min-h-0"
    >
      {/* ── Scrollable body ── */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-[#232323]">Title</label>
          <input
            {...register("title")}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#232323] outline-none focus:border-gray-400"
            placeholder="e.g. Fix navbar overlap bug"
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-[#232323]">Description</label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <div className="mt-1">
                <RichTextEditor
                  content={field.value ?? ""}
                  onChange={field.onChange}
                  placeholder="Add task description..."
                  variant="compact"
                />
              </div>
            )}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Status + Priority */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-[#232323]">Status</label>
            <select
              {...register("status")}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#232323] outline-none focus:border-gray-400"
            >
              <option value="todo">Todo</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#232323]">Priority</label>
            <select
              {...register("priority")}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#232323] outline-none focus:border-gray-400"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
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
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 transition hover:bg-gray-200 disabled:opacity-50"
            >
              {uploading ? <Loader2 size={11} className="animate-spin" /> : <Upload size={11} />}
              {uploading ? "Uploading..." : "Add file"}
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip"
            className="hidden"
            onChange={handleFileSelect}
          />

          {attachments.length === 0 ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-5 text-xs text-gray-400 transition hover:border-gray-300 hover:text-gray-500"
            >
              <Paperclip size={14} />
              Click to attach files, images, or videos
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {attachments.map((att) => (
                <AttachmentPreview
                  key={att.id}
                  attachment={att}
                  onRemove={removeAttachment}
                />
              ))}
              {/* Add more tile */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-full min-h-[7rem] items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-200 text-xs text-gray-400 transition hover:border-gray-300 hover:text-gray-500"
              >
                <Upload size={14} />
                Add more
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Fixed footer — submit button ── */}
      <div className="flex-shrink-0 border-t border-gray-100 px-6 py-4">
        <button
          type="submit"
          disabled={activeMutation.isPending}
          className="w-full flex items-center justify-center gap-2 cursor-pointer rounded-xl bg-gray-800 py-2.5 text-sm font-medium text-white shadow-md transition hover:bg-gray-700 disabled:opacity-50"
        >
          <span>
            {activeMutation.isPending
              ? isEditMode ? "Updating..." : "Creating..."
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
