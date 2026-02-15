"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

import type { Portrait } from "@/lib/ai/parse-portrait";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SECTION_LABELS: Record<string, string> = {
  archetype: "Архетип",
  analysis: "Анализ",
  insight: "Инсайт",
  recommendation: "Рекомендация",
};

function formatAvailableDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

interface PortraitClientProps {
  tripsCount: number;
  initialPortrait: Portrait | null;
  nextAvailableAt: string | null;
}

export function PortraitClient({
  tripsCount,
  initialPortrait,
  nextAvailableAt: initialNextAvailableAt,
}: PortraitClientProps) {
  const [portrait, setPortrait] = useState<Portrait | null>(initialPortrait);
  const [isLoading, setIsLoading] = useState(false);
  const [nextAvailableAt, setNextAvailableAt] = useState<string | null>(
    initialNextAvailableAt
  );

  const canGenerate =
    nextAvailableAt === null || new Date() >= new Date(nextAvailableAt);

  async function handleGenerate() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/portrait", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429 && data.nextAvailableAt) {
          setNextAvailableAt(data.nextAvailableAt);
          const msg =
            data.error ??
            `Следующая генерация возможна с ${formatAvailableDate(data.nextAvailableAt)}`;
          toast.error(msg);
        } else {
          toast.error(data.error ?? "Ошибка генерации");
        }
        return;
      }

      setPortrait(data.portrait);
      setNextAvailableAt(null);
      toast.success("Портрет готов!");
    } catch {
      toast.error("Не удалось сгенерировать портрет");
    } finally {
      setIsLoading(false);
    }
  }

  if (tripsCount < 3) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-5xl">✨</div>
          <h2 className="mt-4 text-lg font-semibold">
            Добавьте хотя бы 3 поездки
          </h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Чтобы сгенерировать портрет путешественника, нужны данные о минимум
            трёх поездках. Заполните дневник поездок и возвращайтесь сюда.
          </p>
          <Button asChild className="mt-6">
            <Link href="/trips/new">Добавить поездку</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const showRawOnly =
    portrait &&
    !portrait.archetype &&
    !portrait.analysis &&
    !portrait.insight &&
    !portrait.recommendation;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {portrait
            ? "ИИ-портрет на основе ваших поездок"
            : "Сгенерируйте персональный портрет путешественника"}
        </p>
        <div className="flex flex-col gap-1.5 sm:items-end">
          {!canGenerate && nextAvailableAt && (
            <p className="text-sm text-muted-foreground">
              Следующая генерация возможна с{" "}
              {formatAvailableDate(nextAvailableAt)}
            </p>
          )}
          <Button
            onClick={handleGenerate}
            disabled={isLoading || !canGenerate}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Генерация...
              </>
            ) : portrait ? (
              <>
                <Sparkles className="size-4" />
                Обновить портрет
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Сгенерировать портрет
              </>
            )}
          </Button>
        </div>
      </div>

      {portrait && (
        <div className="grid gap-4">
          {showRawOnly ? (
            <Card>
              <CardContent className="pt-6">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {portrait.raw}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {portrait.archetype && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {SECTION_LABELS.archetype}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">
                      {portrait.archetype}
                    </p>
                  </CardContent>
                </Card>
              )}
              {portrait.analysis && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {SECTION_LABELS.analysis}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {portrait.analysis}
                    </p>
                  </CardContent>
                </Card>
              )}
              {portrait.insight && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {SECTION_LABELS.insight}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">
                      {portrait.insight}
                    </p>
                  </CardContent>
                </Card>
              )}
              {portrait.recommendation && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {SECTION_LABELS.recommendation}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">
                      {portrait.recommendation}
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      )}

      {!portrait && !isLoading && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Sparkles className="size-10 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              Нажмите «Сгенерировать портрет», чтобы получить персональный
              анализ вашего стиля путешествий
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
