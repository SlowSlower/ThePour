"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  /** Previously-used/curated tags shown as one-click "add" chips. */
  suggestions?: string[];
}

export function TagInput({
  value,
  onChange,
  placeholder,
  suggestions = [],
}: TagInputProps) {
  const [draft, setDraft] = useState("");

  function commit() {
    const tag = draft.trim();
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
    setDraft("");
  }

  const pickableSuggestions = suggestions
    .filter((tag) => !value.includes(tag))
    .slice(0, 12);

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commit();
    } else if (event.key === "Backspace" && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <button
                type="button"
                onClick={() => onChange(value.filter((t) => t !== tag))}
                aria-label={`${tag} 삭제`}
              >
                <X size={12} />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <Input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commit}
        placeholder={placeholder ?? "태그 입력 후 Enter"}
      />
      {pickableSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {pickableSuggestions.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="cursor-pointer select-none"
              onClick={() => onChange([...value, tag])}
            >
              + {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
