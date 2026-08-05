"use client";

export default function SettingsPage() {
  return (
    <div className="h-full overflow-y-auto p-6">
      <h2 className="mb-4 text-lg font-semibold text-[#232323]">Settings</h2>
      <div className="max-w-md space-y-4 rounded-lg border bg-white p-4">
        <div>
          <label className="block text-sm font-medium text-[#232323]">Display name</label>
          <input
            className="mt-1 w-full rounded border px-3 py-2 text-sm text-[#232323]"
            placeholder="Sohaib Younas"
          />
        </div>
        <p className="text-xs text-[#232323]">
          Baaki settings options Week 4 mein auth ke sath add karenge.
        </p>
      </div>
    </div>
  );
}
