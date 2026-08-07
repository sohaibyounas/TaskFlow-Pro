"use client";

import { useEffect, useRef, useState } from "react";
import {
  X,
  Paperclip,
  FileText,
  Image as ImageIcon,
  Film,
  Music,
  Download,
  Trash2,
  Edit2,
  Calendar,
  Tag,
  AlignLeft,
  Upload,
  Play,
  Pause,
  Loader2,
  Eye,
  EyeOff,
  FileType,
} from "lucide-react";
import type { Task, TaskAttachment } from "@/types/task";
import { uploadAttachment, deleteAttachment } from "@/lib/supabase/storage";

interface TaskDetailModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onAttachmentsChange: (taskId: string, attachments: TaskAttachment[]) => void;
}

const PRIORITY_COLORS: Record<Task["priority"], string> = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

const STATUS_COLORS: Record<Task["status"], string> = {
  todo: "bg-gray-100 text-gray-700",
  "in-progress": "bg-blue-100 text-blue-700",
  review: "bg-amber-100 text-amber-700",
  done: "bg-green-100 text-green-700",
};

const STATUS_LABELS: Record<Task["status"], string> = {
  todo: "To Do",
  "in-progress": "In Progress",
  review: "Review",
  done: "Done",
};

function isImage(type: string) {
  return type.startsWith("image/");
}
function isVideo(type: string) {
  return type.startsWith("video/");
}
function isAudio(type: string) {
  return type.startsWith("audio/");
}
function isPdf(type: string) {
  return type === "application/pdf";
}
function isText(type: string, name: string) {
  return type.startsWith("text/") || /\.(txt|md|csv|json|log)$/i.test(name);
}
function isOfficeDoc(type: string, name: string) {
  return /\.(docx?|xlsx?|pptx?)$/i.test(name);
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function AttachmentIcon({ type, name }: { type: string; name: string }) {
  if (isImage(type)) return <ImageIcon size={16} className="text-purple-500" />;
  if (isVideo(type)) return <Film size={16} className="text-blue-500" />;
  if (isAudio(type)) return <Music size={16} className="text-green-500" />;
  if (isPdf(type)) return <FileType size={16} className="text-red-500" />;
  if (isOfficeDoc(type, name))
    return <FileType size={16} className="text-blue-600" />;
  return <FileText size={16} className="text-gray-500" />;
}

function MediaPlayer({ attachment }: { attachment: TaskAttachment }) {
  const [playing, setPlaying] = useState(false);
  const ref = useRef<HTMLVideoElement & HTMLAudioElement>(null);

  useEffect(() => {
    setPlaying(false);
  }, [attachment.id]);

  function toggle() {
    if (!ref.current) return;
    if (playing) {
      ref.current.pause();
      setPlaying(false);
    } else {
      ref.current.play();
      setPlaying(true);
    }
  }

  if (isVideo(attachment.type)) {
    return (
      <div className="mt-2 overflow-hidden rounded-lg bg-black">
        <video
          src={attachment.url}
          controls
          className="max-h-60 w-full object-contain"
        />
      </div>
    );
  }

  if (isAudio(attachment.type)) {
    return (
      <audio
        src={attachment.url}
        controls
        className="mt-2 w-full rounded-lg"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
    );
  }

  return null;
}

// ── Text file inline preview ─────────────────────────────────────────────
function TextPreview({ attachment }: { attachment: TaskAttachment }) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetch(attachment.url)
      .then((res) => {
        if (!res.ok) throw new Error("fetch failed");
        return res.text();
      })
      .then((text) => {
        if (!cancelled) setContent(text.slice(0, 5000)); // cap preview size
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [attachment.url]);

  if (loading) {
    return (
      <div className="mt-2 flex items-center gap-2 rounded-lg bg-gray-100 p-3 text-xs text-gray-400">
        <Loader2 size={12} className="animate-spin" />
        Loading preview...
      </div>
    );
  }

  if (error) {
    return (
      <p className="mt-2 rounded-lg bg-gray-100 p-3 text-xs text-gray-400">
        Preview load nahi hui, download karke dekho.
      </p>
    );
  }

  return (
    <pre className="mt-2 max-h-52 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-gray-900 p-3 text-xs leading-relaxed text-gray-100">
      {content}
      {content &&
        content.length >= 5000 &&
        "\n\n… (truncated, download full file to view)"}
    </pre>
  );
}

// ── PDF inline preview ───────────────────────────────────────────────────
function PdfPreview({ attachment }: { attachment: TaskAttachment }) {
  return (
    <iframe
      src={attachment.url}
      title={attachment.name}
      className="mt-2 h-72 w-full rounded-lg border border-gray-200"
    />
  );
}

// Office doc preview via Google Docs Viewer
// Supabase storage URLs are public — Google Docs Viewer works even from localhost
function OfficePreview({ attachment }: { attachment: TaskAttachment }) {
  const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
    attachment.url,
  )}&embedded=true`;

  return (
    <div className="mt-2 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 shadow-sm">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-3 py-2">
        <span className="truncate text-xs font-medium text-gray-600">{attachment.name}</span>
        <a
          href={attachment.url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 flex-shrink-0 rounded p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          title="Open in new tab"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </a>
      </div>

      {/* scrolling=no suppresses Google Docs Viewer's own scrollbars */}
      <div style={{ overflow: "hidden", width: "100%" }}>
        <iframe
          src={viewerUrl}
          title={attachment.name}
          scrolling="no"
          className="h-80 w-full"
          style={{ minWidth: 0, display: "block", border: 0 }}
        />
      </div>
    </div>
  );
}

function AttachmentItem({
  attachment,
  onRemove,
}: {
  attachment: TaskAttachment;
  onRemove: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const previewable =
    isImage(attachment.type) ||
    isText(attachment.type, attachment.name) ||
    isPdf(attachment.type) ||
    isOfficeDoc(attachment.type, attachment.name);

  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {isImage(attachment.type) ? (
            <button onClick={() => setExpanded((p) => !p)} className="block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={attachment.url}
                alt={attachment.name}
                className="h-12 w-16 rounded object-cover"
              />
            </button>
          ) : (
            <div className="flex h-12 w-16 items-center justify-center rounded bg-gray-100">
              <AttachmentIcon type={attachment.type} name={attachment.name} />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-800">
            {attachment.name}
          </p>
          <p className="mt-0.5 text-xs text-gray-400">
            {formatBytes(attachment.size)} · Added{" "}
            {formatDate(attachment.addedAt)}
          </p>

          {(isVideo(attachment.type) || isAudio(attachment.type)) && (
            <MediaPlayer attachment={attachment} />
          )}

          {isImage(attachment.type) && expanded && (
            <div className="mt-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={attachment.url}
                alt={attachment.name}
                className="max-h-64 w-full rounded-lg object-contain"
              />
            </div>
          )}

          {isText(attachment.type, attachment.name) && expanded && (
            <TextPreview attachment={attachment} />
          )}

          {isPdf(attachment.type) && expanded && (
            <PdfPreview attachment={attachment} />
          )}

          {isOfficeDoc(attachment.type, attachment.name) && expanded && (
            <OfficePreview attachment={attachment} />
          )}
        </div>

        <div className="flex flex-shrink-0 items-center gap-1">
          {previewable && !isImage(attachment.type) && (
            <button
              onClick={() => setExpanded((p) => !p)}
              className="rounded p-1.5 text-gray-400 transition hover:bg-gray-200 hover:text-gray-600"
              title={expanded ? "Hide preview" : "View"}
            >
              {expanded ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
          )}
          <a
            href={attachment.url}
            download={attachment.name}
            className="rounded p-1.5 text-gray-400 transition hover:bg-gray-200 hover:text-gray-600"
            title="Download"
          >
            <Download size={14} />
          </a>
          <button
            onClick={() => onRemove(attachment.id)}
            className="rounded p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
            title="Remove"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function TaskDetailModal({
  task,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onAttachmentsChange,
}: TaskDetailModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<TaskAttachment[]>(
    task.attachments ?? [],
  );
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setAttachments(task.attachments ?? []);
  }, [task.id, task.attachments]);

  // Lock body scroll AND the Next.js <main> scroll container when modal is open
  useEffect(() => {
    const main = document.querySelector("main") as HTMLElement | null;
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (main) main.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      if (main) main.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      if (main) main.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded = await Promise.all(files.map((f) => uploadAttachment(f)));
      const updated = [...attachments, ...uploaded];
      setAttachments(updated);
      onAttachmentsChange(task.id, updated);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
    e.target.value = "";
  }

  async function handleRemoveAttachment(id: string) {
    const att = attachments.find((a) => a.id === id);
    const updated = attachments.filter((a) => a.id !== id);
    setAttachments(updated);
    onAttachmentsChange(task.id, updated);
    if (att) {
      try {
        await deleteAttachment(att.url);
      } catch { }
    }
  }

  if (!isOpen) return null;

  const coverImage = attachments.find((a) => isImage(a.type));

  return (
    <>
      {/* Backdrop — plain dark overlay, no blur to avoid color-bleed from sidebar */}
      <div
        className="fixed inset-0 z-50 bg-black/60"
        onClick={onClose}
      />

      {/* Scroll container — only THIS div scrolls, body + main are locked */}
      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 py-8">
        <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden my-auto">
        {/* Cover banner */}
        {coverImage && (
          <div className="relative h-44 w-full overflow-hidden bg-gray-200">
            <img
              src={coverImage.url}
              alt="Cover"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-0 top-0.5 z-10 rounded-full bg-white/80 p-1 text-gray-500 backdrop-blur-sm transition hover:bg-white hover:text-gray-800"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* ── Two-column body ── */}
        <div className="flex flex-col sm:flex-row">
          {/* LEFT — main content */}
          <div className="flex-1 min-w-0 p-6">
            {/* Title */}
            <h2 className="text-xl font-bold leading-snug text-gray-900 pr-8">
              {task.title}
            </h2>

            {/* Status + Priority badges */}
            <div className="mt-2 mb-5 flex flex-wrap gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[task.status]}`}
              >
                {STATUS_LABELS[task.status]}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}
              >
                {task.priority}
              </span>
            </div>

            {/* Description */}
            <section className="mb-5">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                <AlignLeft size={13} />
                Description
              </div>
              {task.description ? (
                <div
                  className="prose prose-sm max-w-none text-sm leading-relaxed text-gray-700"
                  dangerouslySetInnerHTML={{ __html: task.description }}
                />
              ) : (
                <p className="italic text-sm text-gray-400">No description</p>
              )}
            </section>

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <section className="mb-5">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  <Tag size={13} />
                  Tags
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {task.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Attachments */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  <Paperclip size={13} />
                  Attachments
                  {attachments.length > 0 && (
                    <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-gray-600">
                      {attachments.length}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-200 disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Upload size={12} />
                  )}
                  {uploading ? "Uploading..." : "Add"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.md"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

              {attachments.length === 0 ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-6 text-sm text-gray-400 transition hover:border-gray-300 hover:text-gray-500"
                >
                  <Paperclip size={16} />
                  Click to attach files, images, or videos
                </button>
              ) : (
                <div className="space-y-2">
                  {attachments.map((att) => (
                    <AttachmentItem
                      key={att.id}
                      attachment={att}
                      onRemove={handleRemoveAttachment}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* RIGHT — sidebar meta + actions */}
          <div className="w-full sm:w-52 flex-shrink-0 border-t sm:border-t-0 sm:border-l border-gray-100 bg-gray-50/60 p-5 flex flex-col gap-4">
            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => onEdit(task)}
                className="flex items-center gap-2 rounded-lg bg-white border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 cursor-pointer"
              >
                <Edit2 size={13} />
                Edit Task
              </button>
              <button
                onClick={() => onDelete(task)}
                className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-white transition bg-red-500 hover:bg-red-600 hover:border-red-200 cursor-pointer"
              >
                <Trash2 size={13} />
                Delete Task
              </button>
            </div>

            <div className="h-px bg-gray-200" />

            {/* Due Date */}
            {task.dueDate && (
              <div>
                <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  <Calendar size={11} />
                  Due Date
                </div>
                <p className="text-sm text-gray-700">
                  {formatDate(task.dueDate)}
                </p>
              </div>
            )}

            {/* Assignee */}
            {task.assignee && (
              <div>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Assignee
                </div>
                <p className="text-sm text-gray-700">{task.assignee.name}</p>
              </div>
            )}

            {/* Created */}
            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Created
              </div>
              <p className="text-xs text-gray-500">
                {formatDate(task.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
);
}
