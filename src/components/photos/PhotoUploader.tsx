"use client";

import { useCallback, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";
import { Upload } from "lucide-react";
import { toast } from "sonner";

import { uploadTripPhotos } from "@/lib/actions/photos";
import { cn } from "@/lib/utils";

const MAX_PHOTOS_PER_TRIP = 20;
const MAX_FILE_SIZE_INPUT = 20 * 1024 * 1024; // 20 MB — accept from user, compress before upload
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".webp"];

const COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
} as const;

function isAllowedFile(file: File): boolean {
  if (file.size > MAX_FILE_SIZE_INPUT) return false;
  const type = file.type?.toLowerCase();
  const name = file.name?.toLowerCase() ?? "";
  const typeOk = ALLOWED_TYPES.some((t) => t === type);
  const extOk = ALLOWED_EXT.some((e) => name.endsWith(e));
  return typeOk || extOk;
}

async function compressFiles(files: File[]): Promise<File[]> {
  return Promise.all(
    files.map((file) =>
      imageCompression(file, {
        ...COMPRESSION_OPTIONS,
        fileType: file.type || "image/jpeg",
      })
    )
  );
}

interface PhotoUploaderProps {
  tripId: string;
  existingCount: number;
  onSuccess?: () => void;
}

export function PhotoUploader({
  tripId,
  existingCount,
  onSuccess,
}: PhotoUploaderProps) {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const remaining = MAX_PHOTOS_PER_TRIP - existingCount;
  const atLimit = remaining <= 0;

  const validateFiles = useCallback(
    (files: FileList | File[]): { files: File[] } | { error: string } => {
      const list = Array.from(files);
      if (list.length === 0) return { error: "Выберите файлы" };
      if (existingCount + list.length > MAX_PHOTOS_PER_TRIP) {
        return {
          error: `Максимум ${MAX_PHOTOS_PER_TRIP} фото. Сейчас ${existingCount}, можно добавить ещё ${remaining}.`,
        };
      }
      for (const file of list) {
        if (!isAllowedFile(file)) {
          return {
            error: `Файл «${file.name}» не подходит: только JPG, PNG, WebP до 20 МБ.`,
          };
        }
      }
      return { files: list };
    },
    [existingCount, remaining]
  );

  const doUpload = useCallback(
    async (files: File[]) => {
      setIsUploading(true);
      try {
        const compressed = await compressFiles(files);
        const formData = new FormData();
        compressed.forEach((file) => formData.append("files", file));
        const result = await uploadTripPhotos(tripId, formData);
        if (result.error) {
          toast.error("Ошибка загрузки", { description: result.error });
          return;
        }
        toast.success("Фото добавлены");
        router.refresh();
        onSuccess?.();
      } catch (err) {
        toast.error(
          "Ошибка",
          { description: err instanceof Error ? err.message : "Сжатие или загрузка не удались" }
        );
      } finally {
        setIsUploading(false);
      }
    },
    [tripId, onSuccess, router]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (atLimit || isUploading) return;
      const validated = validateFiles(e.dataTransfer.files);
      if ("error" in validated) {
        toast.error(validated.error);
        return;
      }
      doUpload(validated.files);
    },
    [atLimit, isUploading, validateFiles, doUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files?.length) return;
      if (atLimit || isUploading) return;
      const validated = validateFiles(files);
      if ("error" in validated) {
        toast.error(validated.error);
        return;
      }
      doUpload(validated.files);
      e.target.value = "";
    },
    [atLimit, isUploading, validateFiles, doUpload]
  );

  const handleClick = () => {
    if (atLimit || isUploading) return;
    inputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleFileInput}
      />
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        className={cn(
          "flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors",
          atLimit || isUploading
            ? "cursor-not-allowed border-muted bg-muted/30 opacity-60"
            : isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
        )}
      >
        {atLimit ? (
          <>
            <Upload className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">Достигнут лимит 20 фото</p>
            <p className="text-xs text-muted-foreground">
              Удалите фото, чтобы добавить новые
            </p>
          </>
        ) : isUploading ? (
          <>
            <div className="size-8 animate-pulse rounded-full bg-primary/20" />
            <p className="text-sm font-medium">Сжатие и загрузка...</p>
          </>
        ) : (
          <>
            <Upload className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">
              Перетащите сюда или нажмите для выбора
            </p>
            <p className="text-xs text-muted-foreground">
              JPG, PNG, WebP до 20 МБ (сожмутся до 1 МБ) · можно добавить ещё{" "}
              {remaining} фото
            </p>
          </>
        )}
      </div>
    </div>
  );
}
