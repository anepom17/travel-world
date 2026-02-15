import Link from "next/link";
import Image from "next/image";
import { MapPin, Calendar, ArrowRight, Images } from "lucide-react";

import type { Trip } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const MOOD_EMOJI: Record<string, string> = {
  amazing: "🤩",
  good: "😊",
  neutral: "😐",
  tough: "😤",
  terrible: "😢",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface TripCardProps {
  trip: Trip;
  /** First few photo URLs for thumbnail strip (up to 6) */
  thumbnails?: string[];
}

export function TripCard({ trip, thumbnails = [] }: TripCardProps) {
  const hasThumbnails = thumbnails.length > 0;

  return (
    <Link href={`/trips/${trip.id}`} className="group block">
      <Card className="overflow-hidden transition-all duration-200 hover:shadow-md hover:shadow-primary/5">
        {/* Thumbnail strip: small album preview */}
        {hasThumbnails ? (
          <div className="flex aspect-[16/6] w-full gap-0.5 bg-muted/30 p-1.5">
            {thumbnails.slice(0, 6).map((url, i) => (
              <div
                key={`${trip.id}-${i}`}
                className="relative flex-1 overflow-hidden rounded-sm bg-muted"
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 80px, 120px"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex aspect-[16/6] w-full items-center justify-center gap-1 bg-muted/20 px-2">
            <Images className="size-6 text-muted-foreground/50" />
            <span className="text-xs text-muted-foreground/70">
              Нет фото в альбоме
            </span>
          </div>
        )}
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-tight">
              {trip.title || trip.country_name}
              {trip.mood && (
                <span className="ml-1.5">{MOOD_EMOJI[trip.mood]}</span>
              )}
            </CardTitle>
            <ArrowRight className="mt-0.5 size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Location */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-3.5" />
            <span>
              {trip.country_name}
              {trip.city && `, ${trip.city}`}
            </span>
          </div>

          {/* Dates */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="size-3.5" />
            <span>
              {formatDate(trip.started_at)}
              {trip.ended_at && ` — ${formatDate(trip.ended_at)}`}
            </span>
          </div>

          {/* Notes preview */}
          {trip.notes && (
            <p className="line-clamp-2 text-sm text-muted-foreground/80">
              {trip.notes}
            </p>
          )}

          {/* Country badge */}
          <div className="pt-1">
            <Badge variant="secondary" className="text-xs">
              {trip.country_code}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
