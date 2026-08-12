"use client";

import { useState } from "react";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { Star, Users, Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { TaskForm } from "@/components/tasks/TaskForm";

export default function BoardPage() {
  const [starred, setStarred] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-100/60">
      {/* Trello Board Sub-header Toolbar */}
      <div className="flex flex-shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 bg-white px-4 md:px-6 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-lg md:text-xl font-extrabold tracking-tight text-slate-900">
            Engineering Sprint Board
          </h1>

          <button
            onClick={() => setStarred(!starred)}
            className={`rounded-lg p-1.5 transition ${
              starred ? "text-amber-400 hover:text-amber-500" : "text-slate-300 hover:text-slate-500"
            }`}
            title={starred ? "Unstar board" : "Star board"}
          >
            <Star size={18} fill={starred ? "currentColor" : "none"} />
          </button>

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          <span className="hidden sm:inline-flex rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-100">
            Workspace Visible
          </span>
        </div>

        {/* Right Side: Team Avatars & Add Card Button */}
        <div className="flex items-center gap-3">
          {/* Team Member Avatars */}
          <div className="flex items-center -space-x-2 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="Sohaib"
              title="Sohaib Younas"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
              alt="Ayesha"
              title="Ayesha Khan"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
              alt="Hamza"
              title="Hamza Malik"
            />
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 ring-2 ring-white text-[11px] font-bold text-slate-600">
              <Users size={14} />
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition active:scale-95 cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Card</span>
          </button>
        </div>
      </div>

      {/* Main Board Canvas */}
      <div className="min-h-0 flex-1">
        <KanbanBoard />
      </div>

      {/* Add Task Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add Card to Board"
      >
        <TaskForm onSuccess={() => setShowCreateModal(false)} />
      </Modal>
    </div>
  );
}


