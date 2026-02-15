"use client";

import { memo, useState, useCallback } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";

import { Button } from "@/components/ui/button";
import { NUMERIC_TO_ALPHA2 } from "@/lib/constants/country-codes";
import {
  CONTINENT_LABELS,
  COUNTRY_BY_CODE,
  CONTINENTS,
  MAP_VIEWPORT_PRESETS,
  TOTAL_COUNTRIES,
  type MapRegion,
} from "@/lib/constants/countries";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Colors matching the PRD palette
const COLOR_DEFAULT = "#e5e7eb";     // gray-200
const COLOR_DEFAULT_STROKE = "#d1d5db"; // gray-300
const COLOR_VISITED = "#0d9488";     // teal-600  (primary)
const COLOR_VISITED_HOVER = "#0f766e"; // teal-700
const COLOR_HOVER = "#d1d5db";       // gray-300

interface WorldMapProps {
  /** Set of visited country alpha-2 codes */
  visitedCountries: Set<string>;
  /** Called when any country is clicked (alpha2 code + visited flag) */
  onCountryClick?: (alpha2: string, isVisited: boolean) => void;
}

function WorldMapInner({ visitedCountries, onCountryClick }: WorldMapProps) {
  const [selectedRegion, setSelectedRegion] = useState<MapRegion>("World");
  const [tooltip, setTooltip] = useState<{
    name: string;
    x: number;
    y: number;
  } | null>(null);

  const viewport = MAP_VIEWPORT_PRESETS[selectedRegion];

  const handleMouseEnter = useCallback(
    (
      geo: { id: string; properties: { name: string } },
      evt: React.MouseEvent
    ) => {
      const numericId = geo.id;
      const alpha2 = NUMERIC_TO_ALPHA2[numericId];
      const country = alpha2 ? COUNTRY_BY_CODE[alpha2] : undefined;
      const name = country?.name ?? geo.properties.name ?? "Unknown";

      setTooltip({ name, x: evt.clientX, y: evt.clientY });
    },
    []
  );

  const handleMouseMove = useCallback((evt: React.MouseEvent) => {
    setTooltip((prev) => (prev ? { ...prev, x: evt.clientX, y: evt.clientY } : null));
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  const count = visitedCountries.size;
  const pct = ((count / TOTAL_COUNTRIES) * 100).toFixed(1);

  return (
    <div className="relative w-full">
      {/* Region filter buttons */}
      <div className="mb-3 flex flex-wrap justify-center gap-1.5">
        <Button
          size="sm"
          variant={selectedRegion === "World" ? "default" : "outline"}
          onClick={() => setSelectedRegion("World")}
        >
          Весь мир
        </Button>
        {CONTINENTS.map((continent) => (
          <Button
            key={continent}
            size="sm"
            variant={selectedRegion === continent ? "default" : "outline"}
            onClick={() => setSelectedRegion(continent)}
          >
            {CONTINENT_LABELS[continent] ?? continent}
          </Button>
        ))}
      </div>

      {/* Map — responsive height, smooth transitions */}
      <div className="min-h-[280px] w-full overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm transition-shadow duration-300 hover:shadow-md sm:min-h-[360px] lg:min-h-[420px]">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 130,
            center: [10, 25],
          }}
          width={900}
          height={460}
          style={{ width: "100%", height: "auto" }}
        >
          <ZoomableGroup
            key={selectedRegion}
            center={viewport.center}
            zoom={viewport.zoom}
            minZoom={1}
            maxZoom={6}
            translateExtent={[
              [-200, -200],
              [1100, 700],
            ]}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const numericId = geo.id as string;
                  const alpha2 = NUMERIC_TO_ALPHA2[numericId];
                  const isVisited = alpha2 ? visitedCountries.has(alpha2) : false;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={isVisited ? COLOR_VISITED : COLOR_DEFAULT}
                      stroke="#fff"
                      strokeWidth={0.5}
                      style={{
                        default: {
                          outline: "none",
                          transition: "fill 0.2s ease",
                        },
                        hover: {
                          fill: isVisited ? COLOR_VISITED_HOVER : COLOR_HOVER,
                          outline: "none",
                          cursor: alpha2 ? "pointer" : "default",
                          transition: "fill 0.2s ease",
                        },
                        pressed: { outline: "none" },
                      }}
                      onMouseEnter={(evt) =>
                        handleMouseEnter(
                          geo as { id: string; properties: { name: string } },
                          evt
                        )
                      }
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => {
                        if (alpha2 && onCountryClick) {
                          onCountryClick(alpha2, isVisited);
                        }
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 animate-in fade-in-0 zoom-in-95 rounded-md bg-foreground px-2.5 py-1 text-xs font-medium text-background shadow-lg duration-150"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y - 28,
          }}
        >
          {tooltip.name}
        </div>
      )}

      {/* Stats bar */}
      <div className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <span className="font-semibold text-primary">{count}</span>
        {count === 1 ? "страна" : count >= 2 && count <= 4 ? "страны" : "стран"}
        <span className="text-border">·</span>
        <span className="font-semibold text-primary">{pct}%</span>
        мира
      </div>
    </div>
  );
}

export const WorldMap = memo(WorldMapInner);
