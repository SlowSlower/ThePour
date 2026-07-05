"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function UsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("profiles")
      .select("id, display_name, created_at")
      .order("display_name")
      .then(({ data }) => {
        if (!cancelled) {
          setProfiles(data ?? []);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">전체 사용자</h1>
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : profiles.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          아직 사용자가 없어요.
        </p>
      ) : (
        <div className="space-y-2">
          {profiles.map((profile) => (
            <Link
              key={profile.id}
              href={`/user/${profile.id}`}
              className="block rounded-md border p-3 text-sm hover:bg-accent"
            >
              {profile.display_name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
