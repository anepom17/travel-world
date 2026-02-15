"use client";

import { CONTINENT_LABELS, TOTAL_COUNTRIES } from "@/lib/constants/countries";
import { WorldMap } from "@/components/map/WorldMap";
import type { DashboardStats } from "@/components/stats/StatsPanel";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface ShareMapCardProps {
  displayName: string;
  visitedCodes: string[];
  stats: DashboardStats;
}

/** Card layout for sharing: map + stats. Fixed size for image capture. */
export function ShareMapCard({
  displayName,
  visitedCodes,
  stats,
}: ShareMapCardProps) {
  const visitedSet = new Set(visitedCodes);
  const {
    totalCountries,
    percentWorld,
    totalTrips,
    mostVisitedCountry,
    firstTripDate,
    lastTripDate,
    continents,
  } = stats;

  return (
    <div
      className="flex flex-col rounded-2xl bg-gradient-to-b from-teal-50 to-white p-6 shadow-xl"
      style={{
        width: 560,
        minHeight: 720,
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Header */}
      <div className="mb-4 text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-teal-600">
          Travel World
        </p>
        <h2 className="mt-1 text-xl font-bold text-gray-900">
          Карта путешествий · {displayName}
        </h2>
      </div>

      {/* Map */}
      <div className="overflow-hidden rounded-xl border border-teal-100 bg-white shadow-sm">
        <WorldMap visitedCountries={visitedSet} compact />
      </div>

      {/* Stats grid */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-white/80 p-3 shadow-sm">
          <p className="text-xs text-gray-500">Стран посещено</p>
          <p className="text-2xl font-bold text-teal-700">
            {totalCountries}
            <span className="ml-1 text-sm font-normal text-gray-500">
              / {TOTAL_COUNTRIES}
            </span>
          </p>
          <p className="text-xs text-gray-500">{percentWorld.toFixed(1)}% мира</p>
        </div>
        <div className="rounded-lg bg-white/80 p-3 shadow-sm">
          <p className="text-xs text-gray-500">Поездок</p>
          <p className="text-2xl font-bold text-teal-700">{totalTrips}</p>
        </div>
        <div className="rounded-lg bg-white/80 p-3 shadow-sm">
          <p className="text-xs text-gray-500">Чаще всего</p>
          <p className="text-lg font-bold text-teal-700">
            {mostVisitedCountry?.name ?? "—"}
          </p>
          {mostVisitedCountry && (
            <p className="text-xs text-gray-500">
              {mostVisitedCountry.count}{" "}
              {mostVisitedCountry.count === 1 ? "поездка" : "поездок"}
            </p>
          )}
        </div>
        <div className="rounded-lg bg-white/80 p-3 shadow-sm">
          <p className="text-xs text-gray-500">Хронология</p>
          {firstTripDate && lastTripDate ? (
            <p className="text-sm font-medium text-gray-800">
              {formatDate(firstTripDate)} — {formatDate(lastTripDate)}
            </p>
          ) : (
            <p className="text-sm text-gray-500">Пока нет поездок</p>
          )}
        </div>
      </div>

      {/* Continents summary */}
      <div className="mt-4 rounded-lg bg-white/80 p-3 shadow-sm">
        <p className="mb-2 text-xs font-medium text-gray-500">По континентам</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-700">
          {continents.map(({ name, visited, total }) => {
            const label = CONTINENT_LABELS[name] ?? name;
            return (
              <span key={name}>
                {label}: {visited}/{total}
              </span>
            );
          })}
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-gray-400">
        travel-world.app · Моя карта
      </p>
    </div>
  );
}
