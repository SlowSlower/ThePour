"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useIdentity } from "@/lib/identity";
import { CATEGORY_LABELS, type Product, type TastingSearchRow } from "@/lib/types";
import { CHARACTERISTICS_BY_CATEGORY } from "@/lib/tasting-templates";
import { RatingStars } from "@/components/rating-stars";
import { UserBadge } from "@/components/user-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPhotoUrl } from "@/lib/photos";
import { TastingForm } from "@/components/tasting-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function DrinkDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { profile } = useIdentity();

  const [row, setRow] = useState<TastingSearchRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    supabase
      .from("tasting_search")
      .select("*")
      .eq("id", params.id)
      .maybeSingle()
      .then(({ data, error: fetchError }) => {
        if (cancelled) return;
        if (fetchError) setError(fetchError.message);
        else if (!data) setError("기록을 찾을 수 없습니다.");
        else setRow(data as TastingSearchRow);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  async function handleDelete() {
    if (!row) return;
    if (!confirm("이 기록을 삭제할까요?")) return;
    setDeleting(true);
    const { error: deleteError } = await supabase
      .from("tastings")
      .delete()
      .eq("id", row.id);
    setDeleting(false);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    router.push("/");
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !row) {
    return (
      <p className="py-10 text-center text-sm text-destructive">
        {error ?? "기록을 찾을 수 없습니다."}
      </p>
    );
  }

  const isOwner = profile?.id === row.profile_id;

  if (editing) {
    const product: Product = {
      id: row.product_id,
      name: row.product_name,
      category: row.product_category,
      producer: row.producer,
      region: row.region,
      created_by: null,
      created_at: row.created_at,
    };

    return (
      <div className="mx-auto max-w-xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">기록 수정</h1>
          <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
            취소
          </Button>
        </div>
        <TastingForm
          mode="edit"
          profileId={row.profile_id}
          product={product}
          initial={row}
        />
      </div>
    );
  }

  const characteristicDefs = CHARACTERISTICS_BY_CATEGORY[row.product_category];
  const characteristics = row.characteristics as Record<string, number>;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {CATEGORY_LABELS[row.product_category]}
          </Badge>
          {row.vintage_or_age && (
            <span className="text-sm text-muted-foreground">
              {row.vintage_or_age}
            </span>
          )}
        </div>
        <h1 className="text-2xl font-semibold">{row.product_name}</h1>
        <p className="text-sm text-muted-foreground">
          {row.producer}
          {row.region ? ` · ${row.region}` : ""}
        </p>
        <Link
          href={`/product/${row.product_id}`}
          className="inline-block text-sm text-primary hover:underline"
        >
          이 술의 다른 기록 보기
        </Link>
      </div>

      {row.photo_paths.length > 0 && (
        <div className="flex gap-2 overflow-x-auto">
          {row.photo_paths.map((path) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={path}
              src={getPhotoUrl(path)}
              alt={row.product_name}
              className="h-40 w-40 flex-shrink-0 rounded-md object-cover"
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {row.rating != null && <RatingStars value={row.rating} size={22} />}
          {row.would_repurchase != null && (
            <Badge variant={row.would_repurchase ? "default" : "outline"}>
              재구매 의사 {row.would_repurchase ? "있음" : "없음"}
            </Badge>
          )}
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <UserBadge profileId={row.profile_id} displayName={row.author_name} />
          <div>{row.tasted_on}</div>
        </div>
      </div>

      {(row.abv != null ||
        row.purchased_on ||
        row.purchase_place ||
        row.purchase_price != null) && (
        <div className="grid grid-cols-2 gap-3 rounded-md border p-4 text-sm sm:grid-cols-4">
          {row.abv != null && (
            <div>
              <p className="text-muted-foreground">도수</p>
              <p>{row.abv}%</p>
            </div>
          )}
          {row.purchased_on && (
            <div>
              <p className="text-muted-foreground">구입일</p>
              <p>{row.purchased_on}</p>
            </div>
          )}
          {row.purchase_place && (
            <div>
              <p className="text-muted-foreground">구입처</p>
              <p>{row.purchase_place}</p>
            </div>
          )}
          {row.purchase_price != null && (
            <div>
              <p className="text-muted-foreground">구입 가격</p>
              <p>{row.purchase_price.toLocaleString()}원</p>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        {row.nose_note && <NoteBlock label="Nose (향)" text={row.nose_note} />}
        {row.palate_note && (
          <NoteBlock label="Palate (맛)" text={row.palate_note} />
        )}
        {row.finish_note && (
          <NoteBlock label="Finish (피니시)" text={row.finish_note} />
        )}
        {row.overall_note && <NoteBlock label="총평" text={row.overall_note} />}
      </div>

      {characteristicDefs.some((def) => characteristics[def.key] != null) && (
        <div className="space-y-2 rounded-md border p-4">
          <p className="text-sm font-medium">특성</p>
          {characteristicDefs.map((def) => {
            const v = characteristics[def.key];
            if (v == null) return null;
            return (
              <div key={def.key} className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>{def.label}</span>
                  <span className="text-muted-foreground">
                    {v.toFixed(1)} / 5
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted">
                  <div
                    className="h-1.5 rounded-full bg-primary"
                    style={{ width: `${(v / 5) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {row.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {row.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {isOwner && (
        <div className="flex gap-2 border-t pt-4">
          <Button variant="outline" onClick={() => setEditing(true)}>
            수정
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "삭제 중..." : "삭제"}
          </Button>
        </div>
      )}
    </div>
  );
}

function NoteBlock({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="text-sm font-medium">{label}</p>
      <p className="whitespace-pre-wrap text-sm text-muted-foreground">
        {text}
      </p>
    </div>
  );
}
