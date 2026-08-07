"use client";

import { useState, useRef, useEffect } from "react";
import { type Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo2,
  Redo2,
  ChevronDown,
  Minus,
  Plus,
  Sun,
  Moon,
} from "lucide-react";

type ToolbarTheme = "dark" | "light";

interface EditorToolbarProps {
  editor: Editor;
  theme: ToolbarTheme;
  onThemeToggle?: () => void;
}

const HEADING_OPTIONS = [
  { label: "Paragraph", value: "paragraph" },
  { label: "Heading 1", value: "h1" },
  { label: "Heading 2", value: "h2" },
  { label: "Heading 3", value: "h3" },
];

// theme -> class maps
const styles = {
  dark: {
    bar: "bg-[#1a1a1a]",
    text: "text-gray-300",
    textActive: "bg-white/15 text-white",
    hover: "hover:bg-white/10",
    divider: "bg-white/10",
    dropdownBg: "bg-[#1f1f1f] border-white/10",
    dropdownItem: "text-gray-200 hover:bg-white/10",
  },
  light: {
    bar: "bg-gray-50 border-b border-gray-200",
    text: "text-gray-600",
    textActive: "bg-gray-200 text-gray-900",
    hover: "hover:bg-gray-200",
    divider: "bg-gray-200",
    dropdownBg: "bg-white border-gray-200",
    dropdownItem: "text-gray-700 hover:bg-gray-100",
  },
};

function Dropdown({
  label,
  options,
  onSelect,
  theme,
}: {
  label: string;
  options: { label: string; value: string }[];
  onSelect: (value: string) => void;
  theme: ToolbarTheme;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const s = styles[theme];

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium ${s.text} ${s.hover}`}
      >
        {label}
        <ChevronDown size={12} />
      </button>
      {open && (
        <div
          className={`absolute left-0 top-full z-30 mt-1 min-w-[140px] overflow-hidden rounded-lg border py-1 shadow-xl ${s.dropdownBg}`}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onSelect(opt.value);
                setOpen(false);
              }}
              className={`block w-full px-3 py-1.5 text-left text-xs ${s.dropdownItem}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  children,
  label,
  theme,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  label?: string;
  theme: ToolbarTheme;
}) {
  const s = styles[theme];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
        active ? s.textActive : `${s.text} ${s.hover}`
      } disabled:opacity-30 disabled:hover:bg-transparent`}
    >
      {children}
    </button>
  );
}

export function EditorToolbar({
  editor,
  theme,
  onThemeToggle,
}: EditorToolbarProps) {
  const [zoom, setZoom] = useState(100);
  const s = styles[theme];

  const Divider = () => <div className={`mx-1 h-5 w-px ${s.divider}`} />;

  const currentHeading = editor.isActive("heading", { level: 1 })
    ? "Heading 1"
    : editor.isActive("heading", { level: 2 })
      ? "Heading 2"
      : editor.isActive("heading", { level: 3 })
        ? "Heading 3"
        : "Paragraph";

  const handleHeadingSelect = (value: string) => {
    if (value === "paragraph") {
      editor.chain().focus().setParagraph().run();
    } else {
      const level = parseInt(value.replace("h", "")) as 1 | 2 | 3;
      editor.chain().focus().toggleHeading({ level }).run();
    }
  };

  const addLink = () => {
    const url = window.prompt("Enter URL");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt("Enter image URL");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div
      className={`flex flex-wrap items-center gap-1 px-3 py-2 ${s.bar}`}
    >
      {/* Zoom */}
      <button
        type="button"
        onClick={() => setZoom((z) => Math.max(50, z - 10))}
        className={`flex h-7 w-7 items-center justify-center rounded-md ${s.text} ${s.hover}`}
      >
        <Minus size={13} />
      </button>
      <span className={`w-10 text-center text-xs ${s.text}`}>{zoom}%</span>
      <button
        type="button"
        onClick={() => setZoom((z) => Math.min(200, z + 10))}
        className={`flex h-7 w-7 items-center justify-center rounded-md ${s.text} ${s.hover}`}
      >
        <Plus size={13} />
      </button>

      <Divider />

      <Dropdown
        label={currentHeading}
        options={HEADING_OPTIONS}
        onSelect={handleHeadingSelect}
        theme={theme}
      />

      <Divider />

      <ToolbarButton
        theme={theme}
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        label="Bold"
      >
        <Bold size={14} />
      </ToolbarButton>
      <ToolbarButton
        theme={theme}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        label="Italic"
      >
        <Italic size={14} />
      </ToolbarButton>
      <ToolbarButton
        theme={theme}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
        label="Underline"
      >
        <UnderlineIcon size={14} />
      </ToolbarButton>
      <ToolbarButton
        theme={theme}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        label="Strikethrough"
      >
        <Strikethrough size={14} />
      </ToolbarButton>
      <ToolbarButton
        theme={theme}
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive("code")}
        label="Code"
      >
        <Code size={14} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        theme={theme}
        onClick={addLink}
        active={editor.isActive("link")}
        label="Link"
      >
        <LinkIcon size={14} />
      </ToolbarButton>
      <ToolbarButton theme={theme} onClick={addImage} label="Image">
        <ImageIcon size={14} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        theme={theme}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        label="Bullet list"
      >
        <List size={14} />
      </ToolbarButton>
      <ToolbarButton
        theme={theme}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        label="Numbered list"
      >
        <ListOrdered size={14} />
      </ToolbarButton>
      <ToolbarButton
        theme={theme}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        label="Quote"
      >
        <Quote size={14} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        theme={theme}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        active={editor.isActive({ textAlign: "left" })}
        label="Align left"
      >
        <AlignLeft size={14} />
      </ToolbarButton>
      <ToolbarButton
        theme={theme}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        active={editor.isActive({ textAlign: "center" })}
        label="Align center"
      >
        <AlignCenter size={14} />
      </ToolbarButton>
      <ToolbarButton
        theme={theme}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        active={editor.isActive({ textAlign: "right" })}
        label="Align right"
      >
        <AlignRight size={14} />
      </ToolbarButton>

      <div className="ml-auto flex items-center gap-1">
        <ToolbarButton
          theme={theme}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          label="Undo"
        >
          <Undo2 size={14} />
        </ToolbarButton>
        <ToolbarButton
          theme={theme}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          label="Redo"
        >
          <Redo2 size={14} />
        </ToolbarButton>

        {onThemeToggle && (
          <>
            <Divider />
            <ToolbarButton
              theme={theme}
              onClick={onThemeToggle}
              label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </ToolbarButton>
          </>
        )}
      </div>
    </div>
  );
}
