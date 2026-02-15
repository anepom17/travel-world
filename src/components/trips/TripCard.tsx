import Link from "next/link";
import { MapPin, Calendar, ArrowRight } from "lucide-react";

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
}

export function TripCard({ trip }: TripCardProps) {
  return (
    <Link href={`/trips/${trip.id}`} className="group block">
      <Card className="transition-all duration-200 hover:shadow-md hover:shadow-primary/5">
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
