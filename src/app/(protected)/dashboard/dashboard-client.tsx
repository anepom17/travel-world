"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Plus, Plane, Check, Share2 } from "lucide-react";
import { toast } from "sonner";
import { toPng } from "html-to-image";

import { WorldMap } from "@/components/map/WorldMap";
import { ShareMapCard } from "@/components/share/ShareMapCard";
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
import type { DashboardStats } from "@/components/stats/StatsPanel";

interface DashboardClientProps {
  visitedCodes: string[];
  tripCodes: string[];
  stats: DashboardStats;
  displayName: string;
}

export function DashboardClient({
  visitedCodes,
  tripCodes,
  stats,
  displayName,
}: DashboardClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);

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

  async function handleShareMap() {
    const node = shareCardRef.current;
    if (!node) return;
    setShareLoading(true);
    try {
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#f0fdfa",
      });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "travel-world-map.png", {
        type: "image/png",
      });
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: "Моя карта путешествий — Travel World",
          text: "Моя карта посещённых стран и статистика путешествий",
          files: [file],
        });
        toast.success("Карта отправлена");
        setShareOpen(false);
      } else {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = "travel-world-map.png";
        a.click();
        toast.success("Картинка сохранена");
        setShareOpen(false);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        toast.error("Не удалось создать картинку");
      }
    } finally {
      setShareLoading(false);
    }
  }

  return (
    <>
      <div className="mb-3 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShareOpen(true)}
          className="gap-2"
        >
          <Share2 className="size-4" />
          Поделиться картой и статистикой
        </Button>
      </div>
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

      {/* Share map dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Поделиться картой и статистикой</DialogTitle>
            <DialogDescription>
              Отправьте картинку в мессенджер (Telegram, WhatsApp) или сохраните
              на устройство. На телефоне откроется меню «Поделиться».
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <div ref={shareCardRef}>
              <ShareMapCard
                displayName={displayName}
                visitedCodes={visitedCodes}
                stats={stats}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShareOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleShareMap} disabled={shareLoading}>
              {shareLoading ? "Готовлю картинку…" : "Поделиться"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
