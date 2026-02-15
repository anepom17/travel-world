import { createClient } from "@/lib/supabase/server";
import { parsePortrait, type Portrait } from "@/lib/ai/parse-portrait";
import { PortraitClient } from "./portrait-client";

export const metadata = {
  title: "Мой портрет — Travel World",
};

export default async function PortraitPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ count: tripsCount }, { data: latestPortrait }] = await Promise.all([
    supabase
      .from("trips")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user!.id),
    supabase
      .from("ai_portraits")
      .select("content")
      .eq("user_id", user!.id)
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const tripsTotal = tripsCount ?? 0;
  let cachedPortrait: Portrait | null = null;
  if (latestPortrait?.content) {
    try {
      cachedPortrait = parsePortrait(latestPortrait.content);
    } catch {
      cachedPortrait = {
        archetype: "",
        analysis: "",
        insight: "",
        recommendation: "",
        raw: latestPortrait.content,
      };
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Мой портрет</h1>
        <p className="text-muted-foreground">
          ИИ-анализ вашего стиля путешествий
        </p>
      </div>

      <PortraitClient
        tripsCount={tripsTotal}
        initialPortrait={cachedPortrait}
      />
    </div>
  );
}
