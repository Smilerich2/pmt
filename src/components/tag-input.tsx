"use client";

import { useState } from "react";
import { X } from "lucide-react";

const PRESET_TAGS = [
  "Grundlagen",
  "Prüfung",
  "Praxis",
  "Theorie",
  "Labor",
  "Berechnung",
  "Sicherheit",
];

interface TagInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function TagInput({ value, onChange }: TagInputProps) {
  const [input, setInput] = useState("");

  const tags = value ? value.split(",").map((t) => t.trim()).filter(Boolean) : [];

  function addTag(tag: string) {
    const trimmed = tag.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    onChange([...tags, trimmed].join(","));
  }

  function removeTag(tag: string) {
    onChange(tags.filter((t) => t !== tag).join(","));
  }

  function togglePreset(tag: string) {
    if (tags.includes(tag)) {
      removeTag(tag);
    } else {
      addTag(tag);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
      setInput("");
    }
    if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  }

  return (
    <div className="space-y-3">
      {/* Preset tags */}
      <div className="flex flex-wrap gap-1.5">
        {PRESET_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => togglePreset(tag)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              tags.includes(tag)
                ? "bg-primary text-white"
                : "bg-accent text-muted-foreground hover:bg-accent/80"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Active tags + input */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1.5 min-h-[38px]">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-primary/70 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? "Tag eingeben..." : ""}
          className="flex-1 min-w-[100px] bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
        />
      </div>
    </div>
  );
}
