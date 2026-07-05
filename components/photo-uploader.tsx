"use client";

import { useRef, useState } from "react";
import { X } from "lucide-react";
import { supabase, DRINK_PHOTOS_BUCKET } from "@/lib/supabase/client";
import { getPhotoUrl, photoStoragePath } from "@/lib/photos";
import { getErrorMessage } from "@/lib/utils";

interface PhotoUploaderProps {
  profileId: string;
  tastingId: string;
  value: string[];
  onChange: (paths: string[]) => void;
}

export function PhotoUploader({
  profileId,
  tastingId,
  value,
  onChange,
}: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const uploadedPaths: string[] = [];
      for (const file of Array.from(files)) {
        const path = photoStoragePath(profileId, tastingId, file.name);
        const { error: uploadError } = await supabase.storage
          .from(DRINK_PHOTOS_BUCKET)
          .upload(path, file);
        if (uploadError) throw uploadError;
        uploadedPaths.push(path);
      }
      onChange([...value, ...uploadedPaths]);
    } catch (err) {
      setError(getErrorMessage(err, "사진 업로드에 실패했습니다."));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removePhoto(path: string) {
    onChange(value.filter((p) => p !== path));
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((path) => (
          <div
            key={path}
            className="relative h-20 w-20 overflow-hidden rounded-md border"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getPhotoUrl(path)}
              alt=""
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => removePhoto(path)}
              className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white"
              aria-label="사진 삭제"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-20 w-20 items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground hover:bg-accent"
        >
          {uploading ? "업로드 중" : "+ 사진"}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
