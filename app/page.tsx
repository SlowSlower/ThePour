"use client";

import { useEffect, useMemo, useState } from "react";
import { useIdentity } from "@/lib/identity";
import { fetchTastings, type SortOption } from "@/lib/queries";
import type { Category, TastingSearchRow } from "@/lib/types";
import { DrinkCard } from "@/components/drink-card";
import { SearchBar } from "@/components/search-bar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

type Scope = "all" | "mine";

export default function HomePage() {
  const { profile } = useIdentity();
  const [scope, setScope] = useState<Scope>("all");
  const [category, setCategory] = useState<Category | "all">("all");
  const [sort, setSort] = useState<SortOption>("recent");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [rows, setRows] = useState<TastingSearchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const filters = useMemo(
    () => ({
      query: debouncedQuery,
      category,
      profileId: scope === "mine" ? profile?.id : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sort,
    }),
    [debouncedQuery, category, scope, profile?.id, minPrice, maxPrice, sort],
  );

  useEffect(() => {
    if (scope === "mine" && !profile) {
      setRows([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchTastings(filters)
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "기록을 불러오지 못했습니다.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filters, scope, profile]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={scope} onValueChange={(v) => setScope(v as Scope)}>
          <TabsList>
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="mine">내 기록만</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-2">
          <Select
            value={category}
            onValueChange={(v) => setCategory(v as Category | "all")}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="종류" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 종류</SelectItem>
              <SelectItem value="wine">와인</SelectItem>
              <SelectItem value="whiskey">위스키</SelectItem>
              <SelectItem value="other">기타</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="정렬" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">최신순</SelectItem>
              <SelectItem value="rating_desc">평점 높은순</SelectItem>
              <SelectItem value="rating_asc">평점 낮은순</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <SearchBar
        query={query}
        onQueryChange={setQuery}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onMinPriceChange={setMinPrice}
        onMaxPriceChange={setMaxPrice}
      />

      {scope === "mine" && !profile ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          닉네임을 입력하면 내 기록을 볼 수 있어요.
        </p>
      ) : error ? (
        <p className="py-10 text-center text-sm text-destructive">{error}</p>
      ) : loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          아직 기록이 없어요. 첫 시음 기록을 남겨보세요.
        </p>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <DrinkCard key={row.id} tasting={row} />
          ))}
        </div>
      )}
    </div>
  );
}
