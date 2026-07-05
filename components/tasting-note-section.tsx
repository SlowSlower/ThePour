"use client";

import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface TastingNoteSectionProps {
  label: string;
  tags: string[];
  value: string;
  onChange: (value: string) => void;
}

export function TastingNoteSection({
  label,
  tags,
  value,
  onChange,
}: TastingNoteSectionProps) {
  const activeTags = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  function toggleTag(tag: string) {
    if (activeTags.includes(tag)) {
      const next = activeTags.filter((part) => part !== tag).join(", ");
      onChange(next);
    } else {
      onChange(value.trim() ? `${value.trim()}, ${tag}` : tag);
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant={activeTags.includes(tag) ? "default" : "outline"}
            className="cursor-pointer select-none"
            onClick={() => toggleTag(tag)}
          >
            {tag}
          </Badge>
        ))}
      </div>
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="자유롭게 서술하거나 위 태그를 클릭해 채워보세요"
        rows={3}
      />
    </div>
  );
}
