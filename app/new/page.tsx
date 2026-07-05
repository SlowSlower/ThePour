"use client";

import { IdentityGate } from "@/components/identity-gate";
import { TastingForm } from "@/components/tasting-form";
import { useIdentity } from "@/lib/identity";

export default function NewTastingPage() {
  const { profile } = useIdentity();

  return (
    <IdentityGate>
      <div className="mx-auto max-w-xl space-y-6">
        <h1 className="text-xl font-semibold">새 시음 기록</h1>
        {profile && <TastingForm mode="create" profileId={profile.id} />}
      </div>
    </IdentityGate>
  );
}
