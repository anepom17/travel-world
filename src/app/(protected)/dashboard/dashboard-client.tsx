"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Plus, Plane, Check } from "lucide-react";
import { toast } from "sonner";

import { WorldMap } from "@/components/map/WorldMap";
import { COUNTRY_BY_CODE } from "@/lib/constants/countries";
import { markCountryVisited } from "@/lib/actions/visited-countries";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface DashboardClientProps {
  visitedCodes: string[];
  tripCodes: string[];
}

export function DashboardClient({
  visitedCodes,
  tripCodes,
}: DashboardClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const visitedSet = useMemo(() => new Set(visitedCodes), [visitedCodes]);
  const tripSet = useMemo(() => new Set(tripCodes), [tripCodes]);

  const [selectedCountry, setSelectedCountry] = useState<{
    code: string;
    name: string;
    isVisited: boolean;
    hasTrips: boolean;
  } | null>(null);

  function handleCountryClick(alpha2: string, isVisited: boolean) {
    const country = COUNTRY_BY_CODE[alpha2];
    const name = country?.name ?? alpha2;
    const hasTrips = tripSet.has(alpha2);

    setSelectedCountry({ code: alpha2, name, isVisited, hasTrips });
  }

  function handleMarkVisited() {
    if (!selectedCountry) return;
    startTransition(async () => {
      const result = await markCountryVisited(selectedCountry.code);
      if (result?.error) {
        toast.error("Ошибка", { description: result.error });
      } else {
        toast.success(`${selectedCountry.name} отмечена как посещённая`);
        setSelectedCountry(null);
      }
    });
  }

  return (
    <>
      <WorldMap
        visitedCountries={visitedSet}
        onCountryClick={handleCountryClick}
      />

      {/* Country action dialog */}
      <Dialog
        open={!!selectedCountry}
        onOpenChange={(open) => !open && setSelectedCountry(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="size-5 text-primary" />
              {selectedCountry?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedCountry?.isVisited
                ? "Эта страна уже в вашем списке посещённых."
                : "Что вы хотите сделать с этой страной?"}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2 pt-2">
            {/* Add trip */}
            <Button
              variant="default"
              className="justify-start gap-2"
              onClick={() => {
                router.push(
                  `/trips/new?country=${selectedCountry?.code}`
                );
                setSelectedCountry(null);
              }}
            >
              <Plus className="size-4" />
              Добавить поездку
            </Button>

            {/* Mark as visited (only if not already visited) */}
            {selectedCountry && !selectedCountry.isVisited && (
              <Button
                variant="outline"
                className="justify-start gap-2"
                disabled={isPending}
                onClick={handleMarkVisited}
              >
                <Check className="size-4" />
                {isPending ? "Сохранение..." : "Отметить как посещённую"}
              </Button>
            )}

            {/* View trips (only if has trips) */}
            {selectedCountry?.hasTrips && (
              <Button
                variant="outline"
                className="justify-start gap-2"
                onClick={() => {
                  router.push(
                    `/trips?country=${selectedCountry.code}`
                  );
                  setSelectedCountry(null);
                }}
              >
                <Plane className="size-4" />
                Смотреть поездки
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
