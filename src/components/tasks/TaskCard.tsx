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
  MessageSquare,
  User,
  Clock,
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

const PRIORITY_BADGES: Record<
  Task["priority"],
  { bg: string; text: string; border: string }
> = {
  low: { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200" },
  medium: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  high: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  urgent: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
};

const TAG_COLOR_MAP: Record<string, { bg: string; text: string }> = {
  "UI/UX": { bg: "bg-purple-100", text: "text-purple-700" },
  Frontend: { bg: "bg-blue-100", text: "text-blue-700" },
  Backend: { bg: "bg-emerald-100", text: "text-emerald-700" },
  Design: { bg: "bg-pink-100", text: "text-pink-700" },
  Mobile: { bg: "bg-amber-100", text: "text-amber-700" },
  Bug: { bg: "bg-rose-100", text: "text-rose-700" },
  Feature: { bg: "bg-indigo-100", text: "text-indigo-700" },
};

function getTagStyle(tag: string) {
  if (TAG_COLOR_MAP[tag]) return TAG_COLOR_MAP[tag];
  return { bg: "bg-slate-100", text: "text-slate-700" };
}

function isImage(type: string) {
  return type.startsWith("image/");
}

function formatDueDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const isOverdue = d < now;
  const formatted = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  return { formatted, isOverdue };
}

// Card popup options menu
function CardMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
        className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
        aria-label="Card options"
      >
        <MoreHorizontal size={15} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.1 }}
            className="absolute right-0 top-7 z-30 min-w-[130px] overflow-hidden rounded-xl border border-slate-100 bg-white p-1 shadow-xl"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onEdit();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <Edit2 size={13} className="text-blue-500" />
              Edit Card
            </button>
            <div className="my-1 h-px bg-slate-100" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onDelete();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
            >
              <Trash2 size={13} />
              Delete Card
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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

  const [attachments, setAttachments] = useState<TaskAttachment[]>(
    task.attachments ?? [],
  );

  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const deleteTask = useDeleteTask();
  const updateTask = useUpdateTask();

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

  const coverImage = attachments.find((a) => isImage(a.type));
  const hasAttachments = attachments.length > 0;
  const pBadge = PRIORITY_BADGES[task.priority];

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="touch-none select-none my-2"
      >
        <motion.div
          layout
          initial={{ opacity: 0, y: 6 }}
          animate={{
            opacity: isDragging ? 0.5 : 1,
            y: 0,
            scale: isDragging ? 1.03 : 1,
            rotate: isDragging ? 1.5 : 0,
          }}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          onClick={() => !isDragging && setDetailOpen(true)}
          className={`
            group relative cursor-pointer overflow-hidden rounded-xl border border-slate-200/90 bg-white
            shadow-xs transition-all duration-200 hover:border-slate-300 hover:shadow-md
            ${isDragging ? "shadow-2xl ring-2 ring-blue-500 ring-offset-2 z-50" : ""}
          `}
        >
          {/* Card Cover Banner */}
          {coverImage && (
            <div className="relative h-32 w-full overflow-hidden bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverImage.url}
                alt="cover"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          )}

          <div className="p-3.5">
            {/* Color Labels (Tags) Header */}
            {task.tags && task.tags.length > 0 && (
              <div className="mb-2.5 flex flex-wrap gap-1.5">
                {task.tags.slice(0, 3).map((tag) => {
                  const s = getTagStyle(tag);
                  return (
                    <span
                      key={tag}
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ${s.bg} ${s.text}`}
                    >
                      {tag}
                    </span>
                  );
                })}
                {task.tags.length > 3 && (
                  <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                    +{task.tags.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Task Title & Action Options Menu */}
            <div className="flex items-start justify-between gap-2">
              <h4 className="flex-1 text-sm font-semibold leading-snug text-slate-900 group-hover:text-blue-600 transition-colors">
                {task.title}
              </h4>

              <div
                className="opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <CardMenu
                  onEdit={() => setEditOpen(true)}
                  onDelete={() => setDeleteOpen(true)}
                />
              </div>
            </div>

            {/* Rich Description Snippet */}
            {task.description && (
              <div
                className="prose prose-xs mt-1.5 line-clamp-2 max-w-none text-xs text-slate-500 leading-relaxed [&>*]:my-0"
                dangerouslySetInnerHTML={{ __html: task.description }}
              />
            )}

            {/* Card Footer Metadata */}
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
              {/* Left Side: Priority & Due Date Badges */}
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${pBadge.bg} ${pBadge.text} ${pBadge.border}`}
                >
                  {task.priority}
                </span>

                {task.dueDate && (
                  <span
                    className={`flex items-center gap-1 text-[11px] font-medium ${
                      formatDueDate(task.dueDate).isOverdue && task.status !== "done"
                        ? "text-rose-600 font-bold"
                        : "text-slate-500"
                    }`}
                  >
                    <Clock size={12} />
                    {formatDueDate(task.dueDate).formatted}
                  </span>
                )}
              </div>

              {/* Right Side: Attachments, Comments & Assignee Avatar */}
              <div className="flex items-center gap-2.5">
                {hasAttachments && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                    <Paperclip size={12} />
                    {attachments.length}
                  </span>
                )}

                {task.commentsCount > 0 && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                    <MessageSquare size={12} />
                    {task.commentsCount}
                  </span>
                )}

                {task.assignee ? (
                  task.assignee.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={task.assignee.avatarUrl}
                      alt={task.assignee.name}
                      className="h-6 w-6 rounded-full object-cover ring-2 ring-white shadow-2xs"
                      title={`Assigned to ${task.assignee.name}`}
                    />
                  ) : (
                    <div
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white ring-2 ring-white"
                      title={`Assigned to ${task.assignee.name}`}
                    >
                      {task.assignee.name.charAt(0)}
                    </div>
                  )
                ) : (
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-400 border border-dashed border-slate-300"
                    title="Unassigned"
                  >
                    <User size={12} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Detail Modal */}
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

      {/* Edit Modal */}
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

      {/* Delete Confirmation */}
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

