"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useIdentity } from "@/lib/identity";
import { CATEGORY_LABELS, type Category, type TastingSearchRow } from "@/lib/types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Scope = "all" | "mine";
type RegionSort = "rating" | "repurchase";

const CATEGORY_COLORS: Record<Category, string> = {
  wine: "#7c2d12",
  whiskey: "#b45309",
  other: "#6b7280",
};

export default function StatsPage() {
  const { profile } = useIdentity();
  const [scope, setScope] = useState<Scope>("all");
  const [rows, setRows] = useState<TastingSearchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [regionSort, setRegionSort] = useState<RegionSort>("rating");

  useEffect(() => {
    if (scope === "mine" && !profile) {
      setRows([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    let query = supabase.from("tasting_search").select("*");
    if (scope === "mine" && profile) query = query.eq("profile_id", profile.id);
    query.then(({ data }) => {
      if (!cancelled) {
        setRows((data ?? []) as TastingSearchRow[]);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [scope, profile]);

  const totalCount = rows.length;

  const avgRating = useMemo(() => {
    const rated = rows.filter((r) => r.rating != null);
    if (rated.length === 0) return null;
    return rated.reduce((sum, r) => sum + (r.rating ?? 0), 0) / rated.length;
  }, [rows]);

  const categoryDistribution = useMemo(() => {
    const counts: Partial<Record<Category, number>> = {};
    for (const r of rows) {
      counts[r.product_category] = (counts[r.product_category] ?? 0) + 1;
    }
    return Object.entries(counts).map(([category, count]) => ({
      category: CATEGORY_LABELS[category as Category],
      key: category as Category,
      count: count as number,
    }));
  }, [rows]);

  const ratingTrend = useMemo(() => {
    const byMonth = new Map<string, { sum: number; count: number }>();
    for (const r of rows) {
      if (r.rating == null) continue;
      const month = r.tasted_on.slice(0, 7);
      const entry = byMonth.get(month) ?? { sum: 0, count: 0 };
      entry.sum += r.rating;
      entry.count += 1;
      byMonth.set(month, entry);
    }
    return Array.from(byMonth.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([month, { sum, count }]) => ({
        month,
        avgRating: Number((sum / count).toFixed(2)),
      }));
  }, [rows]);

  const topTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of rows) {
      for (const tag of r.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
  }, [rows]);

  const regionStats = useMemo(() => {
    const byRegion = new Map<
      string,
      { count: number; ratingSum: number; ratingCount: number; repurchaseYes: number; repurchaseAnswered: number }
    >();
    for (const r of rows) {
      const region = r.region?.trim();
      if (!region) continue;
      const entry = byRegion.get(region) ?? {
        count: 0,
        ratingSum: 0,
        ratingCount: 0,
        repurchaseYes: 0,
        repurchaseAnswered: 0,
      };
      entry.count += 1;
      if (r.rating != null) {
        entry.ratingSum += r.rating;
        entry.ratingCount += 1;
      }
      if (r.would_repurchase != null) {
        entry.repurchaseAnswered += 1;
        if (r.would_repurchase) entry.repurchaseYes += 1;
      }
      byRegion.set(region, entry);
    }
    const list = Array.from(byRegion.entries()).map(([region, entry]) => ({
      region,
      count: entry.count,
      avgRating: entry.ratingCount > 0 ? entry.ratingSum / entry.ratingCount : null,
      repurchaseRate:
        entry.repurchaseAnswered > 0
          ? entry.repurchaseYes / entry.repurchaseAnswered
          : null,
    }));
    return list.sort((a, b) => {
      if (regionSort === "rating") {
        return (b.avgRating ?? -1) - (a.avgRating ?? -1);
      }
      return (b.repurchaseRate ?? -1) - (a.repurchaseRate ?? -1);
    });
  }, [rows, regionSort]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">통계</h1>
        <Tabs value={scope} onValueChange={(v) => setScope(v as Scope)}>
          <TabsList>
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="mine">내 기록만</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {scope === "mine" && !profile ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          닉네임을 입력하면 내 통계를 볼 수 있어요.
        </p>
      ) : loading ? (
        <Skeleton className="h-64 w-full" />
      ) : totalCount === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          아직 기록이 없어요.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-md border p-4">
              <p className="text-sm text-muted-foreground">총 기록 수</p>
              <p className="text-2xl font-semibold">{totalCount}</p>
            </div>
            <div className="rounded-md border p-4">
              <p className="text-sm text-muted-foreground">평균 평점</p>
              <p className="text-2xl font-semibold">
                {avgRating != null ? avgRating.toFixed(2) : "-"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-medium">종류별 분포</h2>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    dataKey="count"
                    nameKey="category"
                    outerRadius={80}
                    label
                  >
                    {categoryDistribution.map((entry) => (
                      <Cell key={entry.key} fill={CATEGORY_COLORS[entry.key]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-medium">평점 추이</h2>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ratingTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="avgRating"
                    stroke="#7c2d12"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-medium">자주 쓴 태그</h2>
            {topTags.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                태그 기록이 없어요.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {topTags.map(([tag, count]) => (
                  <Badge key={tag} variant="secondary">
                    {tag} ({count})
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium">지역별 순위</h2>
              <Tabs
                value={regionSort}
                onValueChange={(v) => setRegionSort(v as RegionSort)}
              >
                <TabsList>
                  <TabsTrigger value="rating">별점순</TabsTrigger>
                  <TabsTrigger value="repurchase">재구매율순</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            {regionStats.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                지역 정보가 있는 기록이 없어요.
              </p>
            ) : (
              <div className="space-y-2">
                {regionStats.map((r) => (
                  <div
                    key={r.region}
                    className="flex items-center justify-between rounded-md border p-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">{r.region}</p>
                      <p className="text-xs text-muted-foreground">
                        기록 {r.count}개
                      </p>
                    </div>
                    <div className="flex gap-4 text-right">
                      <div>
                        <p className="text-xs text-muted-foreground">평균 평점</p>
                        <p>{r.avgRating != null ? r.avgRating.toFixed(2) : "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">재구매율</p>
                        <p>
                          {r.repurchaseRate != null
                            ? `${Math.round(r.repurchaseRate * 100)}%`
                            : "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
