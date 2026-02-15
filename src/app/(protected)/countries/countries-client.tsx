"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { Search, Check, Plane, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  markCountryVisited,
  unmarkCountryVisited,
} from "@/lib/actions/visited-countries";
import type { CountryItem } from "./page";

interface ContinentGroup {
  continent: string;
  label: string;
  countries: CountryItem[];
  visitedCount: number;
  totalCount: number;
}

interface CountriesClientProps {
  continentGroups: ContinentGroup[];
}

export function CountriesClient({ continentGroups }: CountriesClientProps) {
  const [search, setSearch] = useState("");
  const [expandedContinents, setExpandedContinents] = useState<Set<string>>(
    () => new Set(continentGroups.map((g) => g.continent))
  );
  const [optimisticVisited, setOptimisticVisited] = useState<
    Record<string, boolean | undefined>
  >({});
  const [isPending, startTransition] = useTransition();

  const toggleContinent = (continent: string) => {
    setExpandedContinents((prev) => {
      const next = new Set(prev);
      if (next.has(continent)) next.delete(continent);
      else next.add(continent);
      return next;
    });
  };

  const filteredGroups = useMemo(() => {
    if (!search.trim()) return continentGroups;
    const q = search.toLowerCase();
    return continentGroups
      .map((group) => ({
        ...group,
        countries: group.countries.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.code.toLowerCase() === q
        ),
      }))
      .filter((g) => g.countries.length > 0);
  }, [continentGroups, search]);

  function handleToggle(country: CountryItem) {
    const currentlyVisited =
      optimisticVisited[country.code] ?? country.isVisited;

    if (currentlyVisited && country.hasTrips) {
      // Can't unmark a country that has trips
      toast.info("Страна отмечена через поездки", {
        description: "Удалите поездки, чтобы убрать отметку.",
      });
      return;
    }

    const newState = !currentlyVisited;
    setOptimisticVisited((prev) => ({ ...prev, [country.code]: newState }));

    startTransition(async () => {
      const result = newState
        ? await markCountryVisited(country.code)
        : await unmarkCountryVisited(country.code);

      if (result?.error) {
        // Revert on error
        setOptimisticVisited((prev) => ({
          ...prev,
          [country.code]: undefined,
        }));
        toast.error("Ошибка", { description: result.error });
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Поиск страны..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Continent sections */}
      {filteredGroups.map((group) => {
        const isExpanded = expandedContinents.has(group.continent);
        return (
          <div key={group.continent} className="space-y-2">
            {/* Continent header */}
            <button
              type="button"
              onClick={() => toggleContinent(group.continent)}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-accent"
            >
              {isExpanded ? (
                <ChevronDown className="size-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="size-4 text-muted-foreground" />
              )}
              <span className="text-sm font-semibold">{group.label}</span>
              <Badge variant="secondary" className="ml-auto text-xs">
                {group.visitedCount} / {group.totalCount}
              </Badge>
            </button>

            {/* Country list */}
            {isExpanded && (
              <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                {group.countries.map((country) => {
                  const isVisited =
                    optimisticVisited[country.code] ?? country.isVisited;

                  return (
                    <div
                      key={country.code}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 transition-colors ${
                        isVisited
                          ? "border-primary/30 bg-primary/5"
                          : "border-border bg-card hover:border-border/80"
                      }`}
                    >
                      {/* Toggle checkbox */}
                      <button
                        type="button"
                        onClick={() => handleToggle(country)}
                        disabled={isPending}
                        className={`flex size-5 shrink-0 items-center justify-center rounded border transition-colors ${
                          isVisited
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground/30 hover:border-primary/50"
                        }`}
                        aria-label={
                          isVisited
                            ? `Убрать отметку: ${country.name}`
                            : `Отметить: ${country.name}`
                        }
                      >
                        {isVisited && <Check className="size-3" />}
                      </button>

                      {/* Country name */}
                      <span
                        className={`flex-1 text-sm ${
                          isVisited ? "font-medium" : "text-muted-foreground"
                        }`}
                      >
                        {country.name}
                      </span>

                      {/* Trip badge */}
                      {country.hasTrips && (
                        <Link
                          href={`/trips?country=${country.code}`}
                          className="flex items-center gap-1 text-xs text-primary hover:underline"
                          title="Есть поездки"
                        >
                          <Plane className="size-3" />
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {filteredGroups.length === 0 && (
        <div className="py-12 text-center text-sm text-muted-foreground">
          Ничего не найдено по запросу «{search}»
        </div>
      )}
    </div>
  );
}
