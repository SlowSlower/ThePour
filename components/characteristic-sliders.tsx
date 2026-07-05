"use client";

import { Slider } from "@/components/ui/slider";
import type { CharacteristicDef } from "@/lib/tasting-templates";
import type { Characteristics } from "@/lib/types";

interface CharacteristicSlidersProps {
  defs: CharacteristicDef[];
  value: Characteristics;
  onChange: (value: Characteristics) => void;
}

export function CharacteristicSliders({
  defs,
  value,
  onChange,
}: CharacteristicSlidersProps) {
  return (
    <div className="space-y-4">
      {defs.map((def) => {
        const current = value[def.key as keyof Characteristics] ?? 2.5;
        return (
          <div key={def.key} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{def.label}</span>
              <span className="text-muted-foreground">
                {current.toFixed(1)}
              </span>
            </div>
            <Slider
              value={[current]}
              min={0}
              max={5}
              step={0.5}
              onValueChange={(next) => {
                const nextValue = Array.isArray(next) ? next[0] : next;
                onChange({ ...value, [def.key]: nextValue });
              }}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{def.lowLabel}</span>
              <span>{def.highLabel}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
