"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { WorldMap } from "@/components/map/WorldMap";

interface DashboardClientProps {
  visitedCodes: string[];
}

export function DashboardClient({ visitedCodes }: DashboardClientProps) {
  const router = useRouter();

  const visitedSet = useMemo(() => new Set(visitedCodes), [visitedCodes]);

  function handleCountryClick(alpha2: string) {
    router.push(`/trips?country=${alpha2}`);
  }

  return (
    <WorldMap
      visitedCountries={visitedSet}
      onCountryClick={handleCountryClick}
    />
  );
}
