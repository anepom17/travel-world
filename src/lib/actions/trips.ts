"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { TripMood } from "@/types";

// ─── Helpers ────────────────────────────────────────────

function getTripFields(formData: FormData) {
  return {
    country_code: formData.get("country_code") as string,
    country_name: formData.get("country_name") as string,
    city: (formData.get("city") as string) || null,
    title: (formData.get("title") as string) || null,
    started_at: formData.get("started_at") as string,
    ended_at: (formData.get("ended_at") as string) || null,
    notes: (formData.get("notes") as string) || null,
    mood: ((formData.get("mood") as string) || null) as TripMood | null,
    is_public: false,
  };
}

// ─── Create ─────────────────────────────────────────────

export async function createTrip(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const fields = getTripFields(formData);

  if (!fields.country_code || !fields.country_name || !fields.started_at) {
    return { error: "Страна и дата начала обязательны" };
  }

  const { data, error } = await supabase
    .from("trips")
    .insert({ ...fields, user_id: user.id })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/trips");
  redirect(`/trips/${data.id}`);
}

// ─── Update ─────────────────────────────────────────────

export async function updateTrip(tripId: string, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const fields = getTripFields(formData);

  if (!fields.country_code || !fields.country_name || !fields.started_at) {
    return { error: "Страна и дата начала обязательны" };
  }

  const { error } = await supabase
    .from("trips")
    .update(fields)
    .eq("id", tripId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/trips");
  revalidatePath(`/trips/${tripId}`);
  redirect(`/trips/${tripId}`);
}

// ─── Delete ─────────────────────────────────────────────

export async function deleteTrip(tripId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // 1. Fetch photo storage paths for this trip
  const { data: photos } = await supabase
    .from("photos")
    .select("storage_path")
    .eq("trip_id", tripId)
    .eq("user_id", user.id);

  // 2. Delete files from Storage (if any)
  if (photos && photos.length > 0) {
    const paths = photos.map((p) => p.storage_path);
    await supabase.storage.from("trip-photos").remove(paths);
  }

  // 3. Delete the trip (cascades to photos table)
  const { error } = await supabase
    .from("trips")
    .delete()
    .eq("id", tripId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/trips");
  redirect("/trips");
}
