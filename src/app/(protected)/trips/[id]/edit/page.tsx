import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import type { Trip } from "@/types";
import { TripForm } from "@/components/trips/TripForm";

export const metadata = {
  title: "Редактировать поездку — Travel World",
};

export default async function EditTripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: trip } = await supabase
    .from("trips")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .returns<Trip[]>()
    .single();

  if (!trip) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link
        href={`/trips/${trip.id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Назад к поездке
      </Link>

      <TripForm trip={trip} />
    </div>
  );
}
