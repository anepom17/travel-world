import { createClient } from "@/lib/supabase/server";
import { COUNTRIES, CONTINENTS, CONTINENT_LABELS } from "@/lib/constants/countries";
import { CountriesClient } from "./countries-client";

export const metadata = {
  title: "Мои страны — Travel World",
};

export type CountryItem = {
  code: string;
  name: string;
  continent: string;
  isVisited: boolean;
  hasTrips: boolean;
  /** true = came only from visited_countries (can be unchecked) */
  manualOnly: boolean;
};

export default async function CountriesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Parallel queries
  const [{ data: visitedRows }, { data: tripRows }] = await Promise.all([
    supabase
      .from("visited_countries")
      .select("country_code")
      .eq("user_id", user!.id),
    supabase
      .from("trips")
      .select("country_code")
      .eq("user_id", user!.id),
  ]);

  const visitedSet = new Set((visitedRows ?? []).map((r) => r.country_code));
  const tripSet = new Set((tripRows ?? []).map((r) => r.country_code));

  // Build per-continent grouped data
  const continentGroups = CONTINENTS.map((continent) => {
    const countries: CountryItem[] = COUNTRIES.filter(
      (c) => c.continent === continent
    ).map((c) => {
      const inVisited = visitedSet.has(c.code);
      const inTrips = tripSet.has(c.code);
      return {
        code: c.code,
        name: c.name,
        continent: c.continent,
        isVisited: inVisited || inTrips,
        hasTrips: inTrips,
        manualOnly: inVisited && !inTrips,
      };
    });

    const visitedCount = countries.filter((c) => c.isVisited).length;

    return {
      continent,
      label: CONTINENT_LABELS[continent] ?? continent,
      countries,
      visitedCount,
      totalCount: countries.length,
    };
  });

  const totalVisited = continentGroups.reduce(
    (sum, g) => sum + g.visitedCount,
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Мои страны</h1>
        <p className="text-sm text-muted-foreground">
          Отмечено стран: {totalVisited} из {COUNTRIES.length}
        </p>
      </div>

      <CountriesClient continentGroups={continentGroups} />
    </div>
  );
}
