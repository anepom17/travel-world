import { Globe, MapPin, Calendar, Plane } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const CONTINENT_LABELS: Record<string, string> = {
  Africa: "Африка",
  Asia: "Азия",
  Europe: "Европа",
  "North America": "Северная Америка",
  "South America": "Южная Америка",
  Oceania: "Океания",
};

export interface ContinentStat {
  name: string;
  visited: number;
  total: number;
}

export interface DashboardStats {
  totalCountries: number;
  percentWorld: number;
  continents: ContinentStat[];
  totalTrips: number;
  mostVisitedCountry: { name: string; code: string; count: number } | null;
  firstTripDate: string | null;
  lastTripDate: string | null;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function StatsPanel({ stats }: { stats: DashboardStats }) {
  const {
    totalCountries,
    percentWorld,
    continents,
    totalTrips,
    mostVisitedCountry,
    firstTripDate,
    lastTripDate,
  } = stats;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* Total countries + % world */}
      <Card className="transition-shadow duration-200 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Посещено стран
          </CardTitle>
          <Globe className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCountries}</div>
          <p className="text-xs text-muted-foreground">
            {percentWorld.toFixed(1)}% мира (из 195)
          </p>
        </CardContent>
      </Card>

      {/* Total trips */}
      <Card className="transition-shadow duration-200 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Всего поездок
          </CardTitle>
          <Plane className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTrips}</div>
        </CardContent>
      </Card>

      {/* Most visited country */}
      <Card className="transition-shadow duration-200 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Чаще всего
          </CardTitle>
          <MapPin className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {mostVisitedCountry ? (
            <>
              <div className="text-2xl font-bold">{mostVisitedCountry.name}</div>
              <p className="text-xs text-muted-foreground">
                {mostVisitedCountry.count}{" "}
                {mostVisitedCountry.count === 1
                  ? "поездка"
                  : mostVisitedCountry.count < 5
                    ? "поездки"
                    : "поездок"}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Пока нет данных</p>
          )}
        </CardContent>
      </Card>

      {/* First & last trip */}
      <Card className="transition-shadow duration-200 hover:shadow-md sm:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Хронология
          </CardTitle>
          <Calendar className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {firstTripDate && lastTripDate ? (
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
              <span>
                <span className="text-muted-foreground">Первая поездка: </span>
                {formatDate(firstTripDate)}
              </span>
              <span>
                <span className="text-muted-foreground">Последняя: </span>
                {formatDate(lastTripDate)}
              </span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Пока нет поездок</p>
          )}
        </CardContent>
      </Card>

      {/* Continents */}
      <Card className="transition-shadow duration-200 hover:shadow-md lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Континенты
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Посещённые страны по континентам
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {continents.map(({ name, visited, total }) => {
            const pct = total > 0 ? Math.round((visited / total) * 100) : 0;
            const label = CONTINENT_LABELS[name] ?? name;
            return (
              <div key={name} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span>{label}</span>
                  <span className="text-muted-foreground">
                    {visited} / {total}
                  </span>
                </div>
                <Progress value={pct} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
