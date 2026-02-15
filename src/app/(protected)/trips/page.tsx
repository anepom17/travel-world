import Link from "next/link";
import { Plus } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
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

  const { data: trips, error } = await supabase
    .from("trips")
    .select("*")
    .eq("user_id", user!.id)
    .order("started_at", { ascending: false })
    .returns<Trip[]>();

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Мои поездки</h1>
          <p className="text-sm text-muted-foreground">
            {trips.length > 0
              ? `Всего поездок: ${trips.length}`
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

      {/* Trips list or empty state */}
      {trips.length === 0 ? (
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
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}
