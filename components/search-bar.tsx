"use client";

import { Input } from "@/components/ui/input";

interface SearchBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
}

export function SearchBar({
  query,
  onQueryChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
}: SearchBarProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="이름, 생산지, 작성자, 테이스팅 노트 검색"
        className="sm:flex-1"
      />
      <div className="flex items-center gap-2">
        <Input
          type="number"
          inputMode="numeric"
          value={minPrice}
          onChange={(event) => onMinPriceChange(event.target.value)}
          placeholder="최소가격"
          className="w-28"
        />
        <span className="text-muted-foreground">~</span>
        <Input
          type="number"
          inputMode="numeric"
          value={maxPrice}
          onChange={(event) => onMaxPriceChange(event.target.value)}
          placeholder="최대가격"
          className="w-28"
        />
      </div>
    </div>
  );
}
