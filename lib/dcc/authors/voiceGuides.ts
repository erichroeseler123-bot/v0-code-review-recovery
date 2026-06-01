/**
 * Author voice guides (Phase 14).
 *
 * Operational style discipline per desk: the tone, phrases to lean on, and
 * phrases to avoid. The avoid-list encodes the honest-schema / scope guardrails
 * into the writing itself (e.g. no "our boats", no "guaranteed return").
 *
 * Data only. Used to keep generated/edited copy consistent and in-scope.
 */

export type AuthorVoiceRule = {
  tone: string
  usePhrases: string[]
  avoidPhrases: string[]
}

export const AUTHOR_VOICE_RULES: Record<string, AuthorVoiceRule> = {
  "mara-portlight": {
    tone: "calm, cruise-safe, timing-aware",
    usePhrases: ["port window", "return timing", "operator availability", "buffer before all-aboard"],
    avoidPhrases: ["guaranteed return", "our boats", "our guides", "we operate"],
  },
  "cal-housecount": {
    tone: "blunt, useful, group-problem solver",
    usePhrases: ["feeds the whole house", "for large groups", "rainy-day plan", "split the cars"],
    avoidPhrases: ["our chefs", "we cater everything", "gourmet", "Michelin"],
  },
  "june-firewood": {
    tone: "local-flavored, practical, low-drama",
    usePhrases: ["before you arrive", "drop request", "arrival checklist", "stock the cabin"],
    avoidPhrases: ["guaranteed boat rental", "automated locker", "our fleet", "self-serve gear"],
  },
  "vale-aftershow": {
    tone: "sharp, logistical, show-night aware",
    usePhrases: ["after the encore", "pickup window", "exit plan", "private ride"],
    avoidPhrases: ["official venue partner", "guaranteed parking", "we run the lot", "skip the line"],
  },
  "ridge-transfer": {
    tone: "direct, weather-aware, route-focused",
    usePhrases: ["private transfer", "vehicle fit", "winter timing", "pickup window"],
    avoidPhrases: ["shared shuttle", "guaranteed roads", "our shuttle line", "fixed schedule"],
  },
  "cora-bayou": {
    tone: "warm, local-curious, practical",
    usePhrases: ["hotel pickup", "airboat vs flat-bottom", "good for kids", "weather window"],
    avoidPhrases: ["we operate the tour", "guaranteed gators", "our captains", "exclusive access"],
  },
  "the-dispatcher": {
    tone: "concise, systems-minded, operational",
    usePhrases: ["route health", "telemetry signal", "promotion readiness", "tracked handoff"],
    avoidPhrases: ["amazing deal", "book now", "limited time", "best in the world"],
  },
}

/** Lookup helper with a graceful undefined for unknown ids. */
export function getVoiceRule(authorId: string): AuthorVoiceRule | undefined {
  return AUTHOR_VOICE_RULES[authorId]
}
