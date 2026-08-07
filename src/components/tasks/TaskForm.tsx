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
  Upload,
  Loader2,
} from "lucide-react";
import {
  taskFormSchema,
  type TaskFormValues,
} from "@/lib/validations/task.schema";
import { useCreateTask, useUpdateTask } from "@/hooks/useTaskMutations";
import type { Task, TaskAttachment } from "@/types/task";
import { RichTextEditor } from "@/components/editor/RichTextEditor";

interface TaskFormProps {
  onSuccess?: () => void;
  task?: Task;
  onAttachmentsReady?: (attachments: TaskAttachment[]) => void;
}

function isImage(type: string) {
  return type.startsWith("image/");
}
function isVideo(type: string) {
  return type.startsWith("video/");
}
function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AttachmentPill({
  attachment,
  onRemove,
}: {
  attachment: TaskAttachment;
  onRemove: (id: string) => void;
}) {
  const icon = isImage(attachment.type) ? (
    <ImageIcon size={12} className="text-purple-500" />
  ) : isVideo(attachment.type) ? (
    <Film size={12} className="text-blue-500" />
  ) : (
    <FileText size={12} className="text-gray-500" />
  );

  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-gray-100 bg-gray-50 px-2 py-1.5 text-xs text-gray-700">
      {isImage(attachment.type) ? (
        <img
          src={attachment.url}
          alt={attachment.name}
          className="h-5 w-7 flex-shrink-0 rounded object-cover"
        />
      ) : (
        <span className="flex-shrink-0">{icon}</span>
      )}
      <span className="max-w-[120px] truncate font-medium">
        {attachment.name}
      </span>
      <span className="flex-shrink-0 text-gray-400">
        {formatBytes(attachment.size)}
      </span>
      <button
        type="button"
        onClick={() => onRemove(attachment.id)}
        className="ml-0.5 flex-shrink-0 rounded p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
        aria-label={`Remove ${attachment.name}`}
      >
        <X size={11} />
      </button>
    </div>
  );
}

export function TaskForm({
  onSuccess,
  task,
  onAttachmentsReady,
}: TaskFormProps) {
  const isEditMode = !!task;

  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const activeMutation = isEditMode ? updateTaskMutation : createTaskMutation;

  // ── Attachments local state ───────────────────────────────────────────────
  const [attachments, setAttachments] = useState<TaskAttachment[]>(
    task?.attachments ?? [],
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAttachments(task?.attachments ?? []);
  }, [task?.id]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const newOnes: TaskAttachment[] = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type || "application/octet-stream",
      size: file.size,
      addedAt: new Date().toISOString(),
    }));
    setAttachments((prev) => [...prev, ...newOnes]);
    e.target.value = "";
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }

  // ── Form ─────────────────────────────────────────────────────────────────
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
        },
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-[#232323]">
          Title
        </label>
        <input
          {...register("title")}
          className="mt-1 w-full rounded border px-3 py-2 text-sm text-[#232323]"
          placeholder="e.g. Fix navbar overlap bug"
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Description — Tiptap editor via Controller */}
      <div>
        <label className="block text-sm font-medium text-[#232323]">
          Description
        </label>
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
          <p className="mt-1 text-xs text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Status + Priority */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-[#232323]">
            Status
          </label>
          <select
            {...register("status")}
            className="mt-1 w-full rounded border px-3 py-2 text-sm text-[#232323]"
          >
            <option value="todo">Todo</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#232323]">
            Priority
          </label>
          <select
            {...register("priority")}
            className="mt-1 w-full rounded border px-3 py-2 text-sm text-[#232323]"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* ── Attachments ──────────────────────────────────────────────────── */}
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
            className="flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 transition hover:bg-gray-200"
          >
            <Upload size={11} />
            Add file
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
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 py-4 text-xs text-gray-400 transition hover:border-gray-300 hover:text-gray-500"
          >
            <Paperclip size={14} />
            Click to attach files, images, or videos
          </button>
        ) : (
          <div className="flex flex-wrap gap-2">
            {attachments.map((att) => (
              <AttachmentPill
                key={att.id}
                attachment={att}
                onRemove={removeAttachment}
              />
            ))}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 rounded-lg border border-dashed border-gray-200 px-2 py-1.5 text-xs text-gray-400 transition hover:border-gray-300 hover:text-gray-500"
            >
              <Upload size={11} />
              Add more
            </button>
          </div>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={activeMutation.isPending}
        className="w-full flex items-center justify-center gap-2 cursor-pointer rounded-xl bg-gray-800 py-2 text-sm font-medium text-white shadow-2xl shadow-zinc-900 transition hover:bg-gray-700 disabled:opacity-50"
      >
        <span>
          {activeMutation.isPending
            ? isEditMode
              ? "Updating..."
              : "Creating..."
            : isEditMode
              ? "Update Task"
              : "Create Task"}
        </span>
        {activeMutation.isPending && (
          <Loader2 size={16} className="animate-spin" />
        )}
      </button>

      {activeMutation.isError && (
        <p className="text-sm text-red-600">
          {isEditMode ? "Task didn't updated" : "Task didn't created"}, try
          again
        </p>
      )}
    </form>
  );
}
