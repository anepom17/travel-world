"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteTripPhoto } from "@/lib/actions/photos";
import type { PhotoWithUrl } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

interface PhotoGalleryProps {
  photos: PhotoWithUrl[];
  tripId: string; // for consistent API; revalidate uses it server-side
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const router = useRouter();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(photoId: string) {
    startTransition(async () => {
      const result = await deleteTripPhoto(photoId);
      if (result.error) {
        toast.error("Ошибка удаления", { description: result.error });
        return;
      }
      toast.success("Фото удалено");
      setLightboxIndex(null);
      router.refresh();
    });
  }

  if (photos.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            className="group relative aspect-square overflow-hidden rounded-lg border bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
            onClick={() => setLightboxIndex(index)}
          >
            <Image
              src={photo.url}
              alt={photo.caption ?? `Фото ${index + 1}`}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            />
            <span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
            <span className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="size-8"
                aria-label="Удалить фото"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDelete(photo.id);
                }}
                disabled={isPending}
              >
                <Trash2 className="size-4" />
              </Button>
            </span>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      <Dialog
        open={lightboxIndex !== null}
        onOpenChange={(open) => !open && setLightboxIndex(null)}
      >
        <DialogContent className="max-h-[90vh] max-w-[90vw] border-0 bg-black/95 p-0">
          <DialogTitle className="sr-only">
            Просмотр фото
          </DialogTitle>
          {lightboxIndex !== null && photos[lightboxIndex] && (
            <div className="relative flex min-h-[50vh] items-center justify-center p-4">
              <Image
                src={photos[lightboxIndex].url}
                alt={photos[lightboxIndex].caption ?? "Фото"}
                width={1200}
                height={800}
                className="max-h-[85vh] w-auto object-contain"
                unoptimized
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-4 top-4"
                aria-label="Удалить фото"
                onClick={() => handleDelete(photos[lightboxIndex].id)}
                disabled={isPending}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
