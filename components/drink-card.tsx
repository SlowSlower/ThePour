import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/rating-stars";
import { UserBadge } from "@/components/user-badge";
import { CATEGORY_LABELS, type TastingSearchRow } from "@/lib/types";
import { getPhotoUrl } from "@/lib/photos";

export function DrinkCard({ tasting }: { tasting: TastingSearchRow }) {
  const thumbnail = tasting.photo_paths[0]
    ? getPhotoUrl(tasting.photo_paths[0])
    : null;

  return (
    <Card className="overflow-hidden transition hover:shadow-md">
      <div className="flex gap-4 p-4">
        <Link
          href={`/drink/${tasting.id}`}
          className="block h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted"
        >
          {thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnail}
              alt={tasting.product_name}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-center text-xs text-muted-foreground">
              사진 없음
            </div>
          )}
        </Link>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {CATEGORY_LABELS[tasting.product_category]}
            </Badge>
            {tasting.vintage_or_age && (
              <span className="text-xs text-muted-foreground">
                {tasting.vintage_or_age}
              </span>
            )}
          </div>
          <Link
            href={`/drink/${tasting.id}`}
            className="block truncate font-medium leading-tight hover:underline"
          >
            {tasting.product_name}
          </Link>
          {tasting.rating != null && (
            <RatingStars value={tasting.rating} size={16} />
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <UserBadge
              profileId={tasting.profile_id}
              displayName={tasting.author_name}
            />
            <span>{tasting.tasted_on}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
