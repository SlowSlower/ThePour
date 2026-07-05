"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  className?: string;
  showValue?: boolean;
}

export function RatingStars({
  value,
  onChange,
  size = 20,
  className,
  showValue = true,
}: RatingStarsProps) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: 5 }).map((_, index) => {
        const fillPercent =
          Math.round(Math.max(0, Math.min(1, value - index)) * 100);

        return (
          <span
            key={index}
            className="relative inline-block"
            style={{ width: size, height: size }}
          >
            <Star size={size} className="text-muted-foreground/30" />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fillPercent}%` }}
            >
              <Star size={size} className="fill-amber-500 text-amber-500" />
            </span>
            {onChange && (
              <span className="absolute inset-0 flex">
                <button
                  type="button"
                  aria-label={`${index + 0.5}점`}
                  className="h-full w-1/2"
                  onClick={() => onChange(index + 0.5)}
                />
                <button
                  type="button"
                  aria-label={`${index + 1}점`}
                  className="h-full w-1/2"
                  onClick={() => onChange(index + 1)}
                />
              </span>
            )}
          </span>
        );
      })}
      {showValue && (
        <span className="ml-1 text-sm text-muted-foreground">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}
