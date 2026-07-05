"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

const STORAGE_KEY = "thepour:profile";

export function getCurrentProfile(): Profile | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Profile;
  } catch {
    return null;
  }
}

export function setCurrentProfile(profile: Profile) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function clearCurrentProfile() {
  window.localStorage.removeItem(STORAGE_KEY);
}

const PROFILE_COLUMNS = "id, display_name, created_at";

// Passwordless-login-free MVP identity, now guarded by a PIN: looks up a
// profile by display name, creating one if it doesn't exist yet. The PIN is
// verified (or, for legacy profiles created before this existed, claimed)
// via security-definer Postgres functions that hash it with pgcrypto — the
// raw PIN and its hash never round-trip back to the client.
export async function ensureProfile(
  displayName: string,
  pin: string,
): Promise<Profile> {
  const trimmed = displayName.trim();
  if (!trimmed) {
    throw new Error("닉네임을 입력해주세요.");
  }
  if (!pin || pin.length < 4) {
    throw new Error("PIN은 4자 이상 입력해주세요.");
  }

  const { data: existing, error: lookupError } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("display_name", trimmed)
    .maybeSingle();

  if (lookupError) throw lookupError;

  if (existing) {
    const { data: hasPin, error: hasPinError } = await supabase.rpc(
      "profile_has_pin",
      { p_profile_id: existing.id },
    );
    if (hasPinError) throw hasPinError;

    if (hasPin) {
      const { data: verified, error: verifyError } = await supabase.rpc(
        "verify_profile_pin",
        { p_profile_id: existing.id, p_pin: pin },
      );
      if (verifyError) throw verifyError;
      if (!verified) throw new Error("PIN이 일치하지 않습니다.");
    } else {
      // Legacy profile from before PINs existed — claim it with this PIN.
      const { error: setPinError } = await supabase.rpc("set_profile_pin", {
        p_profile_id: existing.id,
        p_pin: pin,
      });
      if (setPinError) throw setPinError;
    }

    setCurrentProfile(existing);
    return existing;
  }

  const { data: created, error: insertError } = await supabase
    .from("profiles")
    .insert({ display_name: trimmed })
    .select(PROFILE_COLUMNS)
    .single();
  if (insertError) throw insertError;

  const { error: setPinError } = await supabase.rpc("set_profile_pin", {
    p_profile_id: created.id,
    p_pin: pin,
  });
  if (setPinError) throw setPinError;

  setCurrentProfile(created);
  return created;
}

export function useIdentity() {
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setProfileState(getCurrentProfile());
    setLoaded(true);
  }, []);

  return {
    profile,
    loaded,
    setProfile: (p: Profile) => {
      setCurrentProfile(p);
      setProfileState(p);
    },
    clear: () => {
      clearCurrentProfile();
      setProfileState(null);
    },
  };
}
