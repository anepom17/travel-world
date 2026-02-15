import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Calendar, Pencil, ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import type { Trip, Photo, PhotoWithUrl } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteTripButton } from "@/components/trips/DeleteTripButton";
import { PhotoUploader } from "@/components/photos/PhotoUploader";
import { PhotoGallery } from "@/components/photos/PhotoGallery";

const MOOD_LABEL: Record<string, string> = {
  amazing: "🤩 Потрясающе",
  good: "😊 Хорошо",
  neutral: "😐 Нормально",
  tough: "😤 Тяжело",
  terrible: "😢 Ужасно",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: trip } = await supabase
    .from("trips")
    .select("title, country_name")
    .eq("id", id)
    .single();

  return {
    title: trip
      ? `${trip.title || trip.country_name} — Travel World`
      : "Поездка — Travel World",
  };
}

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: trip } = await supabase
    .from("trips")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .returns<Trip[]>()
    .single();

  if (!trip) notFound();

  // Fetch photos and generate signed URLs (1 hour)
  const { data: photos } = await supabase
    .from("photos")
    .select("*")
    .eq("trip_id", trip.id)
    .eq("user_id", user!.id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
    .returns<Photo[]>();

  const signedExpiry = 60 * 60; // 1 hour
  const photosWithUrls: PhotoWithUrl[] = [];
  const photoList = photos ?? [];
  if (photoList.length > 0) {
    for (const p of photoList) {
      const { data: signed } = await supabase.storage
        .from("trip-photos")
        .createSignedUrl(p.storage_path, signedExpiry);
      photosWithUrls.push({
        ...p,
        url: signed?.signedUrl ?? "",
      });
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back link */}
      <Link
        href="/trips"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Все поездки
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {trip.title || trip.country_name}
            {trip.mood && (
              <span className="ml-2">{MOOD_LABEL[trip.mood]?.slice(0, 2)}</span>
            )}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" />
              {trip.country_name}
              {trip.city && `, ${trip.city}`}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="size-3.5" />
              {formatDate(trip.started_at)}
              {trip.ended_at && ` — ${formatDate(trip.ended_at)}`}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/trips/${trip.id}/edit`} className="gap-1.5">
              <Pencil className="size-3.5" />
              Изменить
            </Link>
          </Button>
          <DeleteTripButton tripId={trip.id} tripName={trip.title || trip.country_name} />
        </div>
      </div>

      {/* Details card */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          {/* Mood */}
          {trip.mood && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Настроение
              </p>
              <p className="mt-1 text-sm">{MOOD_LABEL[trip.mood]}</p>
            </div>
          )}

          {/* Notes */}
          {trip.notes ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Заметки
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
                {trip.notes}
              </p>
            </div>
          ) : (
            <p className="text-sm italic text-muted-foreground">
              Заметок пока нет
            </p>
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Badge variant="secondary">{trip.country_code}</Badge>
            {trip.is_public && <Badge variant="outline">Публичная</Badge>}
          </div>
        </CardContent>
      </Card>

      {/* Photos */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div>
            <h2 className="text-lg font-semibold">Фотографии</h2>
            <p className="text-sm text-muted-foreground">
              До 20 фото, JPG / PNG / WebP до 5 МБ
            </p>
          </div>
          <PhotoUploader
            tripId={trip.id}
            existingCount={photosWithUrls.length}
          />
          {photosWithUrls.length > 0 ? (
            <PhotoGallery photos={photosWithUrls} tripId={trip.id} />
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Пока нет фотографий. Перетащите файлы сюда или нажмите для выбора.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
