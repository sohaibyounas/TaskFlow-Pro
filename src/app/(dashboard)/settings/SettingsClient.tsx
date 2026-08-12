"use client";

import { ProfileForm } from "@/components/settings/ProfileForm";
import { PasswordForm } from "@/components/settings/PasswordForm";
import { WorkspacePreferences } from "@/components/settings/WorkspacePreferences";
import { User, Shield } from "lucide-react";
import { motion } from "framer-motion";

import type { Variants } from "framer-motion";

interface SettingsClientProps {
  username: string;
  userEmail: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export function SettingsClient({ username, userEmail }: SettingsClientProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="h-full overflow-y-auto p-4 md:p-8 space-y-6"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
          Workspace Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your personal profile, security credentials, and workspace preferences.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Profile & Security */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <motion.section
            variants={itemVariants}
            className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs"
          >
            <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <User size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Profile Information
                </h3>
                <p className="text-xs text-slate-500">
                  Update your account username and display name
                </p>
              </div>
            </div>

            <ProfileForm initialUsername={username} email={userEmail} />
          </motion.section>

          {/* Password & Security Card */}
          <motion.section
            variants={itemVariants}
            className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs"
          >
            <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Shield size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Security Credentials
                </h3>
                <p className="text-xs text-slate-500">
                  Update your password securely
                </p>
              </div>
            </div>

            <PasswordForm />
          </motion.section>
        </div>

        {/* Right Column (1 col): Workspace Preferences & Team */}
        <motion.div variants={itemVariants} className="space-y-6">
          <WorkspacePreferences />
        </motion.div>
      </div>
    </motion.div>
  );
}

