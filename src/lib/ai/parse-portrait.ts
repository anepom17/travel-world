export interface Portrait {
  archetype: string;
  analysis: string;
  insight: string;
  recommendation: string;
  raw: string;
}

/**
 * Split LLM response by "## " headers into sections.
 * Graceful degradation: if parsing fails, PortraitCard can show raw text.
 */
export function parsePortrait(text: string): Portrait {
  const raw = text;

  const sections = text.split(/^## /m).filter(Boolean);

  const getSection = (name: string): string => {
    const section = sections.find((s) =>
      s.toLowerCase().startsWith(name.toLowerCase())
    );
    return section
      ? section.replace(/^.*\n/, "").trim()
      : "";
  };

  const archetype = getSection("Архетип");
  const analysis = getSection("Анализ");
  const insight = getSection("Инсайт");
  const recommendation = getSection("Рекомендация");

  return { archetype, analysis, insight, recommendation, raw };
}
