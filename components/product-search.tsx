"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CATEGORY_LABELS, type Product } from "@/lib/types";

interface ProductSearchProps {
  value: Product | null;
  onSelect: (product: Product | null) => void;
  nameInput: string;
  onNameInputChange: (value: string) => void;
}

export function ProductSearch({
  value,
  onSelect,
  nameInput,
  onNameInputChange,
}: ProductSearchProps) {
  const [results, setResults] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (value) {
      setResults([]);
      return;
    }
    const term = nameInput.trim();
    if (term.length < 1) {
      setResults([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .or(`name.ilike.%${term}%,producer.ilike.%${term}%`)
        .limit(8);
      if (!cancelled) {
        setResults(data ?? []);
        setOpen(true);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [nameInput, value]);

  if (value) {
    return (
      <Card className="flex items-center justify-between p-3">
        <div>
          <p className="font-medium">{value.name}</p>
          <p className="text-xs text-muted-foreground">
            {CATEGORY_LABELS[value.category]}
            {value.producer ? ` · ${value.producer}` : ""}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onSelect(null)}
        >
          변경
        </Button>
      </Card>
    );
  }

  return (
    <div className="relative">
      <Input
        value={nameInput}
        onChange={(event) => onNameInputChange(event.target.value)}
        placeholder="술 이름을 입력하세요"
        onFocus={() => results.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md">
          {results.map((product) => (
            <button
              key={product.id}
              type="button"
              className="block w-full px-3 py-2 text-left text-sm hover:bg-accent"
              onMouseDown={() => {
                onSelect(product);
                setOpen(false);
              }}
            >
              <span className="font-medium">{product.name}</span>
              <span className="ml-2 text-xs text-muted-foreground">
                {CATEGORY_LABELS[product.category]}
                {product.producer ? ` · ${product.producer}` : ""}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
