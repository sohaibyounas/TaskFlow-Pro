"use client";

import { useState } from "react";
import {
  Sliders,
  Users,
  Check,
} from "lucide-react";

export function WorkspacePreferences() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [dueReminders, setDueReminders] = useState(true);
  const [autoArchive, setAutoArchive] = useState(false);
  const [defaultView, setDefaultView] = useState("board");
  const [savedSuccess, setSavedSuccess] = useState(false);

  function handleSavePreferences() {
    localStorage.setItem(
      "taskflow_prefs",
      JSON.stringify({ emailAlerts, dueReminders, autoArchive, defaultView }),
    );
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Feature 1: Notifications & Workflow Settings */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Sliders size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Workspace Preferences
            </h3>
            <p className="text-xs text-slate-500">
              Notification alerts & default workspace views
            </p>
          </div>
        </div>

        <div className="space-y-3.5 text-xs">
          {/* Default Landing View */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Default Landing Screen
            </label>
            <select
              value={defaultView}
              onChange={(e) => setDefaultView(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition"
            >
              <option value="board">Kanban Sprint Board</option>
              <option value="dashboard">Analytics Dashboard</option>
              <option value="tasks">All Tasks Table View</option>
            </select>
          </div>

          {/* Email Notifications Toggle */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="font-bold text-slate-800">Email Notifications</p>
              <p className="text-[11px] text-slate-500">
                Receive task assignment & comment alerts
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEmailAlerts(!emailAlerts)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                emailAlerts ? "bg-blue-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  emailAlerts ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Due Date Reminders */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="font-bold text-slate-800">Due Date Reminders</p>
              <p className="text-[11px] text-slate-500">
                24-hour advance alert before task due date
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDueReminders(!dueReminders)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                dueReminders ? "bg-blue-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  dueReminders ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Auto-archive Toggle */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="font-bold text-slate-800">Auto-Archive Done Cards</p>
              <p className="text-[11px] text-slate-500">
                Automatically archive tasks completed over 30 days
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAutoArchive(!autoArchive)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                autoArchive ? "bg-blue-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  autoArchive ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <button
            onClick={handleSavePreferences}
            className="w-full mt-2 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 flex items-center justify-center gap-1.5"
          >
            {savedSuccess ? (
              <>
                <Check size={14} className="text-emerald-400" />
                <span>Preferences Saved!</span>
              </>
            ) : (
              <span>Save Preferences</span>
            )}
          </button>
        </div>
      </section>

      {/* Feature 2: Active Team Members */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Users size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Workspace Team
              </h3>
              <p className="text-xs text-slate-500">3 Active Members</p>
            </div>
          </div>
        </div>

        {/* Members List */}
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 border border-slate-100">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-[10px]">
                SY
              </div>
              <div>
                <p className="font-bold text-slate-900">Sohaib Younas</p>
                <p className="text-[10px] text-slate-400">sohaib@taskflowpro.com</p>
              </div>
            </div>
            <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
              Owner
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 border border-slate-100">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-600 text-white font-bold text-[10px]">
                AK
              </div>
              <div>
                <p className="font-bold text-slate-900">Ayesha Khan</p>
                <p className="text-[10px] text-slate-400">ayesha@taskflowpro.com</p>
              </div>
            </div>
            <span className="rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
              Developer
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 border border-slate-100">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-[10px]">
                HM
              </div>
              <div>
                <p className="font-bold text-slate-900">Hamza Malik</p>
                <p className="text-[10px] text-slate-400">hamza@taskflowpro.com</p>
              </div>
            </div>
            <span className="rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
              Designer
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
