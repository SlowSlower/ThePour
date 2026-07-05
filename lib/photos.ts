import { supabase, DRINK_PHOTOS_BUCKET } from "@/lib/supabase/client";

export function getPhotoUrl(path: string): string {
  return supabase.storage.from(DRINK_PHOTOS_BUCKET).getPublicUrl(path).data
    .publicUrl;
}

export function photoStoragePath(profileId: string, tastingId: string, fileName: string) {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${profileId}/${tastingId}/${Date.now()}-${safeName}`;
}
