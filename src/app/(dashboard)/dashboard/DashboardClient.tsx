"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Task } from "@/types/task";
import {
  CheckCircle2,
  Clock,
  FileText,
  ListTodo,
  TrendingUp,
  Kanban,
  ArrowRight,
  Sparkles,
  Users,
  AlertTriangle,
} from "lucide-react";

interface DashboardClientProps {
  tasks: Task[];
  userName?: string;
}

import type { Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export function DashboardClient({ tasks, userName = "Workspace Member" }: DashboardClientProps) {
  const completed = tasks.filter((t) => t.status === "done").length;
  const inProgress = tasks.filter((t) => t.status === "in-progress").length;
  const review = tasks.filter((t) => t.status === "review").length;
  const todo = tasks.filter((t) => t.status === "todo").length;
  const total = tasks.length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const urgentCount = tasks.filter(
    (t) => t.priority === "urgent" || t.priority === "high",
  ).length;
  const recentTasks = tasks.slice(0, 6);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="h-full overflow-y-auto p-4 md:p-8 space-y-6"
    >
      {/* Welcome Banner */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 p-5 md:p-8 text-white shadow-xl shadow-indigo-500/10"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3 py-1 text-xs font-semibold text-blue-100 border border-white/20 mb-3">
              <Sparkles size={14} className="text-amber-300 animate-pulse" />
              Trello Workspace Dashboard
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome back, {userName}!
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-blue-100/90 max-w-xl">
              {total === 0 ? (
                "You don't have any workspace cards yet. Start organizing by creating your first task on the Kanban board."
              ) : (
                <>
                  You have{" "}
                  <span className="font-bold text-white">
                    {inProgress} tasks
                  </span>{" "}
                  in progress and{" "}
                  <span className="font-bold text-white">
                    {urgentCount} high priority
                  </span>{" "}
                  items requiring attention today.
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/tasks/board"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-900 shadow-md transition hover:bg-blue-50 hover:scale-105 active:scale-95"
            >
              <Kanban size={16} className="text-blue-600" />
              Open Kanban Board
            </Link>
          </div>
        </div>

        {/* Decorative background blur elements */}
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute right-1/3 -top-10 h-40 w-40 rounded-full bg-indigo-500/20 blur-2xl" />
      </motion.div>

      {/* Metric Cards Grid - Fully Responsive */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
      >
        {/* Card 1: Total Tasks */}
        <motion.div
          whileHover={{ y: -3 }}
          className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs transition hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Cards
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <ListTodo size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl sm:text-3xl font-black text-slate-900">
              {total}
            </p>
            <span className="text-xs font-semibold text-slate-500">
              In Workspace
            </span>
          </div>
        </motion.div>

        {/* Card 2: In Progress */}
        <motion.div
          whileHover={{ y: -3 }}
          className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs transition hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
              In Progress
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Clock size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl sm:text-3xl font-black text-slate-900">
              {inProgress}
            </p>
            <span className="text-xs font-semibold text-blue-600">
              Active Now
            </span>
          </div>
        </motion.div>

        {/* Card 3: Pending Review */}
        <motion.div
          whileHover={{ y: -3 }}
          className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs transition hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
              In Review
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <FileText size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl sm:text-3xl font-black text-slate-900">
              {review}
            </p>
            <span className="text-xs font-semibold text-amber-600">
              Awaiting QA
            </span>
          </div>
        </motion.div>

        {/* Card 4: Completed */}
        <motion.div
          whileHover={{ y: -3 }}
          className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs transition hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
              Completed
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl sm:text-3xl font-black text-slate-900">
              {completed}
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
              <TrendingUp size={14} />
              {completionRate}% Done
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* Main Grid: Progress Breakdown & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Status Breakdown & Progress Bar */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          {/* Work Completion Bar */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Sprint Completion Rate
                </h3>
                <p className="text-xs text-slate-500">
                  Overall task completion progress
                </p>
              </div>
              <span className="text-xl font-black text-blue-600">
                {completionRate}%
              </span>
            </div>

            {/* Progress Meter Bar */}
            <div className="h-4 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 border border-slate-200/60">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500"
              />
            </div>

            {/* Status Breakdown Legend Pills */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase">
                  To Do
                </p>
                <p className="text-lg font-bold text-slate-800 mt-1">{todo}</p>
              </div>
              <div className="rounded-xl bg-blue-50/60 p-3 border border-blue-100">
                <p className="text-[11px] font-bold text-blue-600 uppercase">
                  In Progress
                </p>
                <p className="text-lg font-bold text-blue-800 mt-1">
                  {inProgress}
                </p>
              </div>
              <div className="rounded-xl bg-amber-50/60 p-3 border border-amber-100">
                <p className="text-[11px] font-bold text-amber-600 uppercase">
                  Review
                </p>
                <p className="text-lg font-bold text-amber-800 mt-1">
                  {review}
                </p>
              </div>
              <div className="rounded-xl bg-emerald-50/60 p-3 border border-emerald-100">
                <p className="text-[11px] font-bold text-emerald-600 uppercase">
                  Done
                </p>
                <p className="text-lg font-bold text-emerald-800 mt-1">
                  {completed}
                </p>
              </div>
            </div>
          </div>

          {/* Workspace Quick Tools */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/tasks/board"
              className="group flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                  <Kanban size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    Interactive Kanban Board
                  </h4>
                  <p className="text-xs text-slate-500">
                    Drag and drop workspace cards
                  </p>
                </div>
              </div>
              <ArrowRight
                size={18}
                className="text-slate-400 group-hover:translate-x-1 group-hover:text-blue-600 transition-all"
              />
            </Link>

            <Link
              href="/tasks"
              className="group flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
                  <ListTodo size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    All Tasks List View
                  </h4>
                  <p className="text-xs text-slate-500">
                    Filter, search, and paginate
                  </p>
                </div>
              </div>
              <ArrowRight
                size={18}
                className="text-slate-400 group-hover:translate-x-1 group-hover:text-indigo-600 transition-all"
              />
            </Link>
          </div>
        </motion.div>

        {/* Right Column (1 col): Recent Activity Feed */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Recent Cards
              </h3>
              <Link
                href="/tasks"
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {recentTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-2">
                    <ListTodo size={22} />
                  </div>
                  <p className="text-xs font-bold text-slate-800">No cards yet</p>
                  <p className="mt-1 text-[11px] text-slate-400 max-w-[200px]">
                    Your workspace is clean. Create cards on the board to track progress.
                  </p>
                  <Link
                    href="/tasks/board"
                    className="mt-3.5 inline-flex items-center gap-1 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-100 transition"
                  >
                    <span>Open Board</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              ) : (
                recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="group flex items-start justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3 hover:bg-white hover:border-slate-200 hover:shadow-xs transition"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="truncate text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                        {task.title}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="rounded-md bg-white border border-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                          {task.status}
                        </span>
                        {task.priority === "urgent" ||
                        task.priority === "high" ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600">
                            <AlertTriangle size={10} />
                            {task.priority}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">
                            {task.priority}
                          </span>
                        )}
                      </div>
                    </div>

                    {task.assignee && (
                      <div
                        className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white"
                        title={task.assignee.name}
                      >
                        {task.assignee.name.charAt(0)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1 font-medium">
              <Users size={14} className="text-slate-400" />
              Engineering Workspace
            </span>
            <span className="font-bold text-slate-700">{total} Tasks</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
