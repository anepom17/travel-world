import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import {
  COUNTRIES,
  CONTINENTS,
  COUNTRY_BY_CODE,
  TOTAL_COUNTRIES,
} from "@/lib/constants/countries";
import { DashboardClient } from "./dashboard-client";
import { StatsPanel, type DashboardStats } from "@/components/stats/StatsPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Моя карта — Travel World",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: trips }, { data: visitedRows }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user!.id)
        .single(),
      supabase
        .from("trips")
        .select("country_code, started_at")
        .eq("user_id", user!.id)
        .order("started_at", { ascending: true }),
      supabase
        .from("visited_countries")
        .select("country_code")
        .eq("user_id", user!.id),
    ]);

  const displayName =
    profile?.display_name ||
    user?.user_metadata?.full_name ||
    "Путешественник";

  const tripList = trips ?? [];
  const tripCodes = [...new Set(tripList.map((t) => t.country_code))];
  const manualVisitedCodes = (visitedRows ?? []).map((r) => r.country_code);
  const visitedCodes = [...new Set([...tripCodes, ...manualVisitedCodes])];
  const totalCountries = visitedCodes.length;
  const percentWorld =
    TOTAL_COUNTRIES > 0
      ? (totalCountries / TOTAL_COUNTRIES) * 100
      : 0;

  const continentTotals = CONTINENTS.reduce(
    (acc, name) => {
      acc[name] = COUNTRIES.filter((c) => c.continent === name).length;
      return acc;
    },
    {} as Record<string, number>
  );

  const continentVisited = CONTINENTS.reduce(
    (acc, name) => {
      acc[name] = visitedCodes.filter(
        (code) => COUNTRY_BY_CODE[code]?.continent === name
      ).length;
      return acc;
    },
    {} as Record<string, number>
  );

  const continents: DashboardStats["continents"] = CONTINENTS.map((name) => ({
    name,
    visited: continentVisited[name] ?? 0,
    total: continentTotals[name] ?? 0,
  }));

  const countByCountry = tripList.reduce<Record<string, number>>(
    (acc, t) => {
      acc[t.country_code] = (acc[t.country_code] ?? 0) + 1;
      return acc;
    },
    {}
  );

  const topCountryCode = Object.entries(countByCountry).sort(
    (a, b) => b[1] - a[1]
  )[0];
  const mostVisitedCountry = topCountryCode
    ? {
        code: topCountryCode[0],
        name: COUNTRY_BY_CODE[topCountryCode[0]]?.name ?? topCountryCode[0],
        count: topCountryCode[1],
      }
    : null;

  const dates = tripList.map((t) => t.started_at).filter(Boolean);
  const firstTripDate =
    dates.length > 0 ? dates[0]! : null;
  const lastTripDate =
    dates.length > 0 ? dates[dates.length - 1]! : null;

  const stats: DashboardStats = {
    totalCountries,
    percentWorld,
    continents,
    totalTrips: tripList.length,
    mostVisitedCountry,
    firstTripDate,
    lastTripDate,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Моя карта</h1>
        <p className="text-muted-foreground">
          Добро пожаловать, {displayName}!
        </p>
      </div>

      {tripList.length === 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <div className="text-5xl">🗺️</div>
            <div>
              <h2 className="text-lg font-semibold">
                Карта ждёт ваших приключений
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Добавьте первую поездку, чтобы отметить страны на карте
              </p>
            </div>
            <Button asChild>
              <Link href="/trips/new">Добавить первую поездку</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <DashboardClient
        visitedCodes={visitedCodes}
        tripCodes={tripCodes}
        stats={stats}
        displayName={displayName}
      />

      <StatsPanel stats={stats} />
    </div>
  );
}
