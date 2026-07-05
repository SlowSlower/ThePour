"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { CATEGORY_LABELS, type Product, type TastingSearchRow } from "@/lib/types";
import { RatingStars } from "@/components/rating-stars";
import { UserBadge } from "@/components/user-badge";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PurchasePriceChart,
  type PurchasePoint,
} from "@/components/purchase-price-chart";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [tastings, setTastings] = useState<TastingSearchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      supabase.from("products").select("*").eq("id", params.id).maybeSingle(),
      supabase
        .from("tasting_search")
        .select("*")
        .eq("product_id", params.id)
        .order("tasted_on", { ascending: false }),
    ]).then(([productRes, tastingsRes]) => {
      if (cancelled) return;
      if (productRes.error) setError(productRes.error.message);
      else if (!productRes.data) setError("제품을 찾을 수 없습니다.");
      else setProduct(productRes.data);
      if (tastingsRes.error) setError(tastingsRes.error.message);
      else setTastings((tastingsRes.data ?? []) as TastingSearchRow[]);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const grouped = useMemo(() => {
    const map = new Map<string, TastingSearchRow[]>();
    for (const t of tastings) {
      const key = t.vintage_or_age?.trim() || "빈티지 정보 없음";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return Array.from(map.entries());
  }, [tastings]);

  const purchasePoints: PurchasePoint[] = useMemo(
    () =>
      tastings
        .filter((t) => t.purchased_on && t.purchase_price != null)
        .map((t) => ({
          id: t.id,
          date: t.purchased_on as string,
          price: t.purchase_price as number,
          place: t.purchase_place,
        })),
    [tastings],
  );

  const avgRating = useMemo(() => {
    const rated = tastings.filter((t) => t.rating != null);
    if (rated.length === 0) return null;
    return (
      rated.reduce((sum, t) => sum + (t.rating ?? 0), 0) / rated.length
    );
  }, [tastings]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <p className="py-10 text-center text-sm text-destructive">
        {error ?? "제품을 찾을 수 없습니다."}
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="space-y-2">
        <Badge variant="secondary">{CATEGORY_LABELS[product.category]}</Badge>
        <h1 className="text-2xl font-semibold">{product.name}</h1>
        <p className="text-sm text-muted-foreground">
          {product.producer}
          {product.region ? ` · ${product.region}` : ""}
        </p>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {avgRating != null && <RatingStars value={avgRating} size={16} />}
          <span>{tastings.length}개의 시음 기록</span>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-medium">구매 이력</h2>
        <PurchasePriceChart points={purchasePoints} />
      </div>

      <div className="space-y-6">
        {grouped.map(([vintage, items]) => (
          <div key={vintage} className="space-y-2">
            <h2 className="text-sm font-semibold">{vintage}</h2>
            <div className="space-y-2">
              {items.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-md border p-3 text-sm"
                >
                  <div className="min-w-0 space-y-1">
                    <UserBadge
                      profileId={t.profile_id}
                      displayName={t.author_name}
                    />
                    <Link
                      href={`/drink/${t.id}`}
                      className="block truncate text-muted-foreground hover:underline"
                    >
                      {t.overall_note || "상세 보기"}
                    </Link>
                  </div>
                  <Link href={`/drink/${t.id}`} className="block text-right">
                    {t.rating != null && (
                      <RatingStars value={t.rating} size={14} />
                    )}
                    <p className="text-xs text-muted-foreground">
                      {t.tasted_on}
                    </p>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
