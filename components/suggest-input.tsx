"use client";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface SuggestInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  maxSuggestions?: number;
}

/**
 * Text input backed by clickable "pick again" chips (curated examples +
 * previously entered values). Clicking a chip fills the input; the input
 * itself stays editable so typing a new value is always the manual-entry path.
 */
export function SuggestInput({
  value,
  onChange,
  suggestions,
  placeholder,
  maxSuggestions = 10,
}: SuggestInputProps) {
  const visible = suggestions.slice(0, maxSuggestions);

  return (
    <div className="space-y-1.5">
      {visible.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {visible.map((option) => (
            <Badge
              key={option}
              variant={value === option ? "default" : "outline"}
              className="cursor-pointer select-none"
              onClick={() => onChange(value === option ? "" : option)}
            >
              {option}
            </Badge>
          ))}
        </div>
      )}
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder ?? "직접 입력"}
      />
    </div>
  );
}
