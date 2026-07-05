import Link from "next/link";

export function UserBadge({
  profileId,
  displayName,
}: {
  profileId: string;
  displayName: string;
}) {
  return (
    <Link
      href={`/user/${profileId}`}
      className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline"
    >
      {displayName}
    </Link>
  );
}
