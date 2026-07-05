"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { Profile, TastingSearchRow } from "@/lib/types";
import { DrinkCard } from "@/components/drink-card";
import { RatingStars } from "@/components/rating-stars";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserProfilePage() {
  const params = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tastings, setTastings] = useState<TastingSearchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      supabase
        .from("profiles")
        .select("id, display_name, created_at")
        .eq("id", params.id)
        .maybeSingle(),
      supabase
        .from("tasting_search")
        .select("*")
        .eq("profile_id", params.id)
        .order("tasted_on", { ascending: false }),
    ]).then(([profileRes, tastingsRes]) => {
      if (cancelled) return;
      if (profileRes.error) setError(profileRes.error.message);
      else if (!profileRes.data) setError("사용자를 찾을 수 없습니다.");
      else setProfile(profileRes.data);
      if (tastingsRes.error) setError(tastingsRes.error.message);
      else setTastings((tastingsRes.data ?? []) as TastingSearchRow[]);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const avgRating = useMemo(() => {
    const rated = tastings.filter((t) => t.rating != null);
    if (rated.length === 0) return null;
    return rated.reduce((sum, t) => sum + (t.rating ?? 0), 0) / rated.length;
  }, [tastings]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <p className="py-10 text-center text-sm text-destructive">
        {error ?? "사용자를 찾을 수 없습니다."}
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{profile.display_name}</h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {avgRating != null && <RatingStars value={avgRating} size={16} />}
          <span>{tastings.length}개의 기록</span>
        </div>
      </div>

      {tastings.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          아직 등록한 기록이 없어요.
        </p>
      ) : (
        <div className="space-y-3">
          {tastings.map((t) => (
            <DrinkCard key={t.id} tasting={t} />
          ))}
        </div>
      )}
    </div>
  );
}
