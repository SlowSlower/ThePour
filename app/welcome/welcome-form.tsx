"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ensureProfile } from "@/lib/identity";
import { getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function WelcomeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [displayName, setDisplayName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await ensureProfile(displayName, pin);
      router.push(searchParams.get("next") ?? "/");
    } catch (err) {
      setError(getErrorMessage(err, "닉네임을 확인하지 못했습니다."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="displayName">닉네임</Label>
        <Input
          id="displayName"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="예: 슬로우슬로워"
          autoFocus
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pin">PIN (4자 이상)</Label>
        <Input
          id="pin"
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(event) => setPin(event.target.value)}
          placeholder="처음 쓰는 닉네임이면 새로 설정돼요"
        />
        <p className="text-xs text-muted-foreground">
          이미 있는 닉네임이면 처음 설정한 PIN을 입력해야 해요. 다른 사람이
          내 닉네임을 함부로 쓰지 못하게 하는 용도입니다.
        </p>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "확인 중..." : "시작하기"}
      </Button>
    </form>
  );
}
