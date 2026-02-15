"use client";

import { useState, useMemo, useTransition, useRef, useEffect } from "react";
import { toast } from "sonner";

import { COUNTRIES } from "@/lib/constants/countries";
import { createTrip, updateTrip } from "@/lib/actions/trips";
import type { Trip, TripMood } from "@/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// ─── Mood options ───────────────────────────────────────

const MOOD_OPTIONS: { value: TripMood; label: string }[] = [
  { value: "amazing", label: "🤩 Потрясающе" },
  { value: "good", label: "😊 Хорошо" },
  { value: "neutral", label: "😐 Нормально" },
  { value: "tough", label: "😤 Тяжело" },
  { value: "terrible", label: "😢 Ужасно" },
];

// ─── Props ──────────────────────────────────────────────

interface TripFormProps {
  /** If provided, we're editing an existing trip */
  trip?: Trip;
  /** Pre-select a country (e.g. from query param ?country=FR) */
  defaultCountryCode?: string;
}

export function TripForm({ trip, defaultCountryCode }: TripFormProps) {
  const isEdit = !!trip;
  const [isPending, startTransition] = useTransition();

  // Country search
  const [countrySearch, setCountrySearch] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState(
    trip?.country_code ?? defaultCountryCode ?? ""
  );
  const countrySearchInputRef = useRef<HTMLInputElement>(null);

  const filteredCountries = useMemo(() => {
    const list = !countrySearch
      ? [...COUNTRIES]
      : (() => {
          const q = countrySearch.toLowerCase();
          return COUNTRIES.filter(
            (c) =>
              c.name.toLowerCase().includes(q) ||
              c.nameEn.toLowerCase().includes(q) ||
              c.code.toLowerCase() === q
          );
        })();
    return list.sort((a, b) => a.name.localeCompare(b.name, "ru"));
  }, [countrySearch]);

  const selectedCountry = COUNTRIES.find(
    (c) => c.code === selectedCountryCode
  );

  // Restore focus to search input when list updates (Radix steals focus otherwise)
  useEffect(() => {
    const t = setTimeout(() => {
      countrySearchInputRef.current?.focus();
    }, 0);
    return () => clearTimeout(t);
  }, [countrySearch]);

  // Form state
  const [mood, setMood] = useState<string>(trip?.mood ?? "");

  async function handleSubmit(formData: FormData) {
    // Inject country_name from the selected country
    if (selectedCountry) {
      formData.set("country_code", selectedCountry.code);
      formData.set("country_name", selectedCountry.name);
    }
    if (mood) {
      formData.set("mood", mood);
    }

    startTransition(async () => {
      const result = isEdit
        ? await updateTrip(trip.id, formData)
        : await createTrip(formData);

      if (result?.error) {
        toast.error("Ошибка", { description: result.error });
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEdit ? "Редактировать поездку" : "Новая поездка"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-5">
          {/* Country */}
          <div className="space-y-2">
            <Label>Страна *</Label>
            <Select
              value={selectedCountryCode}
              onValueChange={setSelectedCountryCode}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите страну" />
              </SelectTrigger>
              <SelectContent position="popper">
                <div className="px-2 pb-2">
                  <Input
                    ref={countrySearchInputRef}
                    placeholder="Поиск страны..."
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    className="h-8"
                    autoFocus
                  />
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {filteredCountries.length === 0 ? (
                    <div className="px-2 py-3 text-center text-sm text-muted-foreground">
                      Ничего не найдено
                    </div>
                  ) : (
                    filteredCountries.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.name}
                      </SelectItem>
                    ))
                  )}
                </div>
              </SelectContent>
            </Select>
            {/* Hidden fields for form submission */}
            <input
              type="hidden"
              name="country_code"
              value={selectedCountryCode}
            />
            <input
              type="hidden"
              name="country_name"
              value={selectedCountry?.name ?? ""}
            />
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="city">Город</Label>
            <Input
              id="city"
              name="city"
              placeholder="Например: Токио"
              defaultValue={trip?.city ?? ""}
            />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Название поездки</Label>
            <Input
              id="title"
              name="title"
              placeholder="Например: Медовый месяц"
              defaultValue={trip?.title ?? ""}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="started_at">Дата начала *</Label>
              <Input
                id="started_at"
                name="started_at"
                type="date"
                required
                defaultValue={trip?.started_at ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ended_at">Дата окончания</Label>
              <Input
                id="ended_at"
                name="ended_at"
                type="date"
                defaultValue={trip?.ended_at ?? ""}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Заметки</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Расскажите о поездке..."
              rows={4}
              defaultValue={trip?.notes ?? ""}
            />
          </div>

          {/* Mood */}
          <div className="space-y-2">
            <Label>Настроение</Label>
            <Select value={mood} onValueChange={setMood}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите настроение" />
              </SelectTrigger>
              <SelectContent>
                {MOOD_OPTIONS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="mood" value={mood} />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending
                ? "Сохранение..."
                : isEdit
                  ? "Сохранить изменения"
                  : "Создать поездку"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
