"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Edit2,
  Trash2,
  MoreHorizontal,
  Paperclip,
  Calendar,
} from "lucide-react";
import type { Task, TaskAttachment } from "@/types/task";
import { TaskDetailModal } from "./TaskDetailModal";
import { DeleteConfirmModal } from "@/components/ui/DeleteConfirmModal";
import { Modal } from "@/components/ui/Modal";
import { TaskForm } from "./TaskForm";
import { useDeleteTask, useUpdateTask } from "@/hooks/useTaskMutations";

interface TaskCardProps {
  task: Task;
}

const PRIORITY_COLORS: Record<Task["priority"], string> = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

function isImage(type: string) {
  return type.startsWith("image/");
}

function formatDueDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// Dotted-menu popover

interface CardMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

function CardMenu({ onEdit, onDelete }: CardMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((p) => !p);
        }}
        className="flex h-6 w-6 items-center justify-center rounded text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
        aria-label="Card options"
      >
        <MoreHorizontal size={14} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -4 }}
            transition={{ duration: 0.1 }}
            className="absolute right-0 top-8 z-30 min-w-[130px] overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onEdit();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
            >
              <Edit2 size={13} className="text-blue-500" />
              Edit
            </button>
            <div className="mx-2 h-px bg-gray-100" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onDelete();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 transition hover:bg-red-50"
            >
              <Trash2 size={13} />
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Main TaskCard

export function TaskCard({ task }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // local attachments state — kept in sync so modal edits reflect on card
  const [attachments, setAttachments] = useState<TaskAttachment[]>(
    task.attachments ?? [],
  );

  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const deleteTask = useDeleteTask();
  const updateTask = useUpdateTask();

  // Sync from server only when no modal is active and task content actually changed
  const prevTaskAttachmentsRef = useRef<string>("");
  useEffect(() => {
    if (detailOpen || editOpen) return;
    const serialized = JSON.stringify(task.attachments ?? []);
    if (serialized !== prevTaskAttachmentsRef.current) {
      prevTaskAttachmentsRef.current = serialized;
      setAttachments(task.attachments ?? []);
    }
  }, [task.attachments, detailOpen, editOpen]);

  function handleAttachmentsChange(_taskId: string, updated: TaskAttachment[]) {
    setAttachments(updated);
    updateTask.mutate({
      id: task.id,
      input: { attachments: updated },
    });
  }

  function handleConfirmDelete() {
    deleteTask.mutate(task.id, {
      onSuccess: () => {
        setDeleteOpen(false);
        setDetailOpen(false);
      },
    });
  }

  // Cover = first image attachment
  const coverImage = attachments.find((a) => isImage(a.type));
  const hasAttachments = attachments.length > 0;

  return (
    <>
      {/* Card */}
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="touch-none"
      >
        <motion.div
          layout
          initial={{ opacity: 0, y: 8 }}
          animate={{
            opacity: isDragging ? 0.45 : 1,
            y: 0,
            scale: isDragging ? 1.03 : 1,
          }}
          transition={{ duration: 0.15 }}
          onClick={() => !isDragging && setDetailOpen(true)}
          className="group relative cursor-pointer select-none rounded-xl border border-gray-100 bg-white shadow-sm transition hover:border-gray-200 hover:shadow-md active:cursor-grabbing"
        >
          {/* Cover image */}
          {coverImage && (
            <div className="relative h-28 overflow-hidden rounded-t-xl bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverImage.url}
                alt="cover"
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="p-3">
            {/* Top row: title + hover edit icon (top-left) + menu (top-right) */}
            <div className="flex items-start justify-between gap-2">
              {/* edit pencil */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditOpen(true);
                }}
                className="mt-0.5 flex-shrink-0 rounded p-0.5 text-gray-300 opacity-0 transition group-hover:opacity-100 hover:bg-gray-100 hover:text-blue-500"
                aria-label="Edit task"
              >
                <Edit2 size={13} />
              </button>

              <p className="flex-1 text-sm font-medium leading-snug text-gray-900">
                {task.title}
              </p>

              {/* Dotted menu */}
              <div
                className="opacity-0 transition group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <CardMenu
                  onEdit={() => setEditOpen(true)}
                  onDelete={() => setDeleteOpen(true)}
                />
              </div>
            </div>

            {/* Description */}
            {task.description && (
              <div
                className="prose prose-sm mt-1.5 line-clamp-2 max-w-none text-xs leading-relaxed text-gray-500 [&>*]:my-0"
                dangerouslySetInnerHTML={{ __html: task.description }}
              />
            )}

            {/* Footer row */}
            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-1.5">
              {/* Priority badge */}
              <span
                className={`rounded px-2 py-0.5 text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}
              >
                {task.priority}
              </span>

              {/* Due date */}
              {task.dueDate && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Calendar size={11} />
                  {formatDueDate(task.dueDate)}
                </span>
              )}

              {/* Assignee */}
              {task.assignee && (
                <span className="text-xs text-gray-400">
                  {task.assignee.name}
                </span>
              )}
            </div>

            {/* Tags + attachment count row */}
            {(task.tags?.length > 0 || hasAttachments) && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {task.tags?.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500"
                  >
                    {tag}
                  </span>
                ))}
                {task.tags?.length > 2 && (
                  <span className="text-[11px] text-gray-400">
                    +{task.tags.length - 2}
                  </span>
                )}

                {/* Attachment count — bottom right like Trello */}
                {hasAttachments && (
                  <span className="ml-auto flex items-center gap-1 text-xs text-gray-400">
                    <Paperclip size={11} />
                    {attachments.length}
                  </span>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Detail Modal ─────────────────────────────────────────────────── */}
      <TaskDetailModal
        task={{ ...task, attachments }}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        onEdit={() => {
          setDetailOpen(false);
          setEditOpen(true);
        }}
        onDelete={() => {
          setDetailOpen(false);
          setDeleteOpen(true);
        }}
        onAttachmentsChange={handleAttachmentsChange}
      />

      {/* ── Edit Modal ───────────────────────────────────────────────────── */}
      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Task"
      >
        <TaskForm
          task={{ ...task, attachments }}
          onSuccess={() => setEditOpen(false)}
          onAttachmentsReady={(updated) => setAttachments(updated)}
        />
      </Modal>

      {/* ── Delete Confirm Modal ─────────────────────────────────────────── */}
      <DeleteConfirmModal
        isOpen={deleteOpen}
        taskTitle={task.title}
        isDeleting={deleteTask.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </>
  );
}
