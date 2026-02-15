import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { COUNTRY_BY_CODE } from "@/lib/constants/countries";
import type { Trip } from "@/types";
import { Button } from "@/components/ui/button";
import { TripCard } from "@/components/trips/TripCard";

export const metadata = {
  title: "Мои поездки — Travel World",
};

export default async function TripsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: trips, error }, { data: visitedRows }] = await Promise.all([
    supabase
      .from("trips")
      .select("*")
      .eq("user_id", user!.id)
      .order("started_at", { ascending: false })
      .returns<Trip[]>(),
    supabase
      .from("visited_countries")
      .select("country_code")
      .eq("user_id", user!.id),
  ]);

  // Thumbnails for trip cards: first 6 photos per trip with signed URLs
  const tripIds = (trips ?? []).map((t) => t.id);
  const thumbnailsByTripId: Record<string, string[]> = {};
  if (tripIds.length > 0) {
    const { data: photos } = await supabase
      .from("photos")
      .select("id, trip_id, storage_path, sort_order, created_at")
      .in("trip_id", tripIds)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    const byTrip = new Map<string, { storage_path: string }[]>();
    for (const p of photos ?? []) {
      const list = byTrip.get(p.trip_id) ?? [];
      if (list.length < 6) list.push({ storage_path: p.storage_path });
      byTrip.set(p.trip_id, list);
    }

    const signedExpiry = 60 * 60;
    const allPaths = Array.from(byTrip.values()).flat();
    const signed = await Promise.all(
      allPaths.map(({ storage_path }) =>
        supabase.storage
          .from("trip-photos")
          .createSignedUrl(storage_path, signedExpiry)
      )
    );

    let idx = 0;
    for (const [tid, list] of byTrip) {
      thumbnailsByTripId[tid] = list
        .map(() => signed[idx++]?.data?.signedUrl ?? "")
        .filter(Boolean);
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-destructive/20 bg-destructive/5 py-16 text-center">
        <p className="text-sm font-medium text-destructive">
          Ошибка загрузки: {error.message}
        </p>
        <p className="text-xs text-muted-foreground">
          Проверьте соединение и попробуйте ещё раз
        </p>
        <Button asChild variant="outline">
          <Link href="/trips">Попробовать снова</Link>
        </Button>
      </div>
    );
  }

  // Countries with trip details
  const tripCountryCodes = new Set((trips ?? []).map((t) => t.country_code));

  // Countries marked visited but without any trip details
  const suggestedCountries = (visitedRows ?? [])
    .map((r) => r.country_code)
    .filter((code) => !tripCountryCodes.has(code))
    .map((code) => ({
      code,
      name: COUNTRY_BY_CODE[code]?.name ?? code,
    }))
    .slice(0, 5); // Show up to 5 suggestions

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Мои поездки</h1>
          <p className="text-sm text-muted-foreground">
            {(trips ?? []).length > 0
              ? `Всего поездок: ${(trips ?? []).length}`
              : "Пока нет поездок"}
          </p>
        </div>
        <Button asChild>
          <Link href="/trips/new" className="gap-1.5">
            <Plus className="size-4" />
            Добавить
          </Link>
        </Button>
      </div>

      {/* Suggestion banner for visited countries without trips */}
      {suggestedCountries.length > 0 && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-foreground">
                Вы побывали в{" "}
                {suggestedCountries.map((c, i) => (
                  <span key={c.code}>
                    {i > 0 && ", "}
                    <strong>{c.name}</strong>
                  </span>
                ))}
                , но пока не рассказали детали. Может, добавим поездку?
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {suggestedCountries.map((c) => (
                  <Button key={c.code} asChild size="xs" variant="outline">
                    <Link href={`/trips/new?country=${c.code}`}>
                      + {c.name}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trips list or empty state */}
      {(trips ?? []).length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border bg-card py-16 text-center">
          <div className="text-5xl">🗺️</div>
          <div>
            <h2 className="text-lg font-semibold">
              Карта ждёт ваших приключений
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Добавьте свою первую поездку, чтобы начать
            </p>
          </div>
          <Button asChild>
            <Link href="/trips/new">Добавить первую поездку</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(trips ?? []).map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              thumbnails={thumbnailsByTripId[trip.id] ?? []}
            />
          ))}
        </div>
      )}
    </div>
  );
}
