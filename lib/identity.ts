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

// Passwordless MVP identity: looks up a profile by display name, creating one
// if it doesn't exist yet. Anyone can "become" an existing display name since
// there is no password — acceptable for a small trusted group, to be replaced
// once real login is added.
export async function ensureProfile(displayName: string): Promise<Profile> {
  const trimmed = displayName.trim();
  if (!trimmed) {
    throw new Error("닉네임을 입력해주세요.");
  }

  const { data: existing, error: lookupError } = await supabase
    .from("profiles")
    .select("*")
    .eq("display_name", trimmed)
    .maybeSingle();

  if (lookupError) throw lookupError;
  if (existing) {
    setCurrentProfile(existing);
    return existing;
  }

  const { data: created, error: insertError } = await supabase
    .from("profiles")
    .insert({ display_name: trimmed })
    .select("*")
    .single();

  if (insertError) throw insertError;
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
