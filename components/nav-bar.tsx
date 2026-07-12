"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useIdentity } from "@/lib/identity";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/", label: "피드" },
  { href: "/products", label: "제품" },
  { href: "/users", label: "사용자" },
  { href: "/stats", label: "통계" },
];

interface NavBarProps {
  /** "package.json version · short commit SHA" (SHA is "dev" locally), shown
   * top-right so it's obvious which build is actually live. */
  version: string;
}

export function NavBar({ version }: NavBarProps) {
  const { profile, loaded, clear } = useIdentity();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          ThePour
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded px-2 py-1 hover:bg-accent"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/new"
            className="rounded px-2 py-1 font-medium hover:bg-accent"
          >
            + 기록
          </Link>
        </nav>
        <div className="flex items-center gap-2 text-sm">
          {loaded && profile ? (
            <>
              <span className="text-muted-foreground">{profile.display_name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  clear();
                  router.push("/welcome");
                }}
              >
                전환
              </Button>
            </>
          ) : loaded ? (
            <Button size="sm" onClick={() => router.push("/welcome")}>
              닉네임 입력
            </Button>
          ) : null}
          <span
            className="font-mono text-xs text-muted-foreground"
            title="버전 · 배포된 커밋"
          >
            v{version}
          </span>
        </div>
      </div>
    </header>
  );
}
