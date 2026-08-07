"use client";

import { motion } from "framer-motion";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@/types/task";

interface TaskCardProps {
  task: Task;
}

const PRIORITY_COLORS: Record<Task["priority"], string> = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

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

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none">
      <motion.div
        layout 
        initial={{ opacity: 0, y: 8 }}
        animate={{
          opacity: isDragging ? 0.5 : 1,
          y: 0,
          scale: isDragging ? 1.03 : 1,
        }}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.15 }}
        className="cursor-grab rounded-lg border bg-white p-3 shadow-sm active:cursor-grabbing select-none"
      >
        <p className="text-sm font-medium text-gray-900">{task.title}</p>
        <p className="mt-1 line-clamp-2 text-xs text-gray-500">
          {task.description}
        </p>

        <div className="mt-2 flex items-center justify-between">
          <span
            className={`rounded px-2 py-0.5 text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}
          >
            {task.priority}
          </span>
          {task.assignee && (
            <span className="text-xs text-gray-400">{task.assignee.name}</span>
          )}
        </div>
      </motion.div>
    </div>
  );
}
