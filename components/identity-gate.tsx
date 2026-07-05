"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useIdentity } from "@/lib/identity";

// Wraps write-action pages (new/edit) and redirects to /welcome when there's
// no local identity yet. Read-only pages (feed, product/user pages) stay open.
export function IdentityGate({ children }: { children: React.ReactNode }) {
  const { profile, loaded } = useIdentity();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loaded && !profile) {
      router.replace(`/welcome?next=${encodeURIComponent(pathname)}`);
    }
  }, [loaded, profile, pathname, router]);

  if (!loaded || !profile) {
    return (
      <div className="flex justify-center py-20 text-sm text-muted-foreground">
        닉네임을 확인하는 중...
      </div>
    );
  }

  return <>{children}</>;
}
