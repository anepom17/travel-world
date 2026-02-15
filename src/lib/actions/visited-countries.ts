"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// ─── Mark country as visited ────────────────────────────

export async function markCountryVisited(countryCode: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("visited_countries")
    .upsert(
      { user_id: user.id, country_code: countryCode.toUpperCase() },
      { onConflict: "user_id, country_code" }
    );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/countries");
  revalidatePath("/trips");
  return { success: true };
}

// ─── Unmark country as visited ──────────────────────────

export async function unmarkCountryVisited(countryCode: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("visited_countries")
    .delete()
    .eq("user_id", user.id)
    .eq("country_code", countryCode.toUpperCase());

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/countries");
  revalidatePath("/trips");
  return { success: true };
}
