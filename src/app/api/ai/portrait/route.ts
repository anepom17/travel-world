import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateText } from "@/lib/ai/provider";
import { PORTRAIT_SYSTEM_PROMPT, buildPortraitUserPrompt } from "@/lib/ai/prompts";
import { parsePortrait } from "@/lib/ai/parse-portrait";
import type { Trip } from "@/types";

const MIN_TRIPS = 3;

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: trips } = await supabase
    .from("trips")
    .select("*")
    .eq("user_id", user.id)
    .order("started_at", { ascending: true })
    .returns<Trip[]>();

  if (!trips || trips.length < MIN_TRIPS) {
    return NextResponse.json(
      { error: "Add at least 3 trips to generate your traveler portrait" },
      { status: 400 }
    );
  }

  const systemPrompt = PORTRAIT_SYSTEM_PROMPT;
  const userPrompt = buildPortraitUserPrompt(trips);

  let rawText: string;
  try {
    rawText = await generateText(systemPrompt, userPrompt);
  } catch (err) {
    const message = err instanceof Error ? err.message : "LLM request failed";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }

  const portrait = parsePortrait(rawText);
  const modelVersion =
    process.env.LLM_PROVIDER === "gemini"
      ? `gemini/${process.env.GEMINI_MODEL ?? "gemini-2.0-flash"}`
      : process.env.LLM_PROVIDER ?? "gemini";

  await supabase.from("ai_portraits").insert({
    user_id: user.id,
    archetype: portrait.archetype || null,
    content: rawText,
    trips_count: trips.length,
    model_version: modelVersion,
  });

  return NextResponse.json({
    portrait: {
      archetype: portrait.archetype,
      analysis: portrait.analysis,
      insight: portrait.insight,
      recommendation: portrait.recommendation,
      raw: portrait.raw,
    },
  });
}
