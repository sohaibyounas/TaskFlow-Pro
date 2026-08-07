"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { EditorToolbar } from "./EditorToolbar";

type ToolbarTheme = "dark" | "light";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  variant?: "page" | "compact";
  /** initial toolbar theme, user can still toggle it via the button */
  defaultTheme?: ToolbarTheme;
  /** hide the toggle button if you want to force one theme */
  allowThemeToggle?: boolean;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder,
  variant = "page",
  defaultTheme = "dark",
  allowThemeToggle = true,
}: RichTextEditorProps) {
  const [theme, setTheme] = useState<ToolbarTheme>(defaultTheme);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-blue-600 underline cursor-pointer" },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: placeholder ?? "Start writing..." }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          variant === "page"
            ? "prose prose-sm sm:prose-base focus:outline-none min-h-[300px] max-w-none"
            : "prose prose-sm focus:outline-none min-h-[120px] max-w-none px-3 py-2",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  if (variant === "compact") {
    return (
      <div
        className={`overflow-hidden rounded-lg border ${
          theme === "dark"
            ? "border-gray-800 bg-white"
            : "border-gray-200 bg-white"
        }`}
      >
        <EditorToolbar
          editor={editor}
          theme={theme}
          onThemeToggle={allowThemeToggle ? toggleTheme : undefined}
        />
        <EditorContent editor={editor} />
      </div>
    );
  }

  // "page" variant
  return (
    <div className="overflow-hidden rounded-xl border border-gray-800">
      <EditorToolbar
        editor={editor}
        theme={theme}
        onThemeToggle={allowThemeToggle ? toggleTheme : undefined}
      />
      <div
        className={`max-h-[500px] overflow-y-auto px-6 py-8 ${
          theme === "dark" ? "bg-[#0d0d0d]" : "bg-gray-100"
        }`}
      >
        <div className="mx-auto max-w-2xl rounded-lg bg-white px-10 py-8 shadow-2xl">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
