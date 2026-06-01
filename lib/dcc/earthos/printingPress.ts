/**
 * Printing Press Lite — Earth OS draft-asset generator.
 *
 * Takes a promotion-queue item that is actually ready (promotable or
 * ready_to_publish) and drafts the promotion assets a human would otherwise
 * write by hand: SEO title, meta description, social post, media pitch, and a
 * partner/operator blurb.
 *
 * HARD RULES (doctrine: dcc-place-time-engine.md "honest schema / make answers"):
 * - Generation ONLY. No sending, no posting, no email, no AI API, no DB, no cron.
 * - Every asset is a DRAFT for human review, grounded in real registry + queue
 *   data. Where the source data is missing, emit an explicit "needs input"
 *   placeholder rather than fabricating claims.
 * - Only items that passed the promotion gate are eligible — never generate
 *   promotion copy for blocked / in-progress / unpolished routes.
 *
 * Pure functions. No side effects.
 */

import {
  PROMOTION_QUEUE,
  isActionable,
  resolveSatellite,
  promotionStateLabel,
  type PromotionQueueItem,
} from "@/lib/dcc/earthos/promotionQueue"
import type { SatelliteRecord } from "@/lib/dcc/network/satelliteRegistry"

/** A single drafted asset, with the metadata a reviewer needs. */
export type PressAsset = {
  key: "seo_title" | "meta_description" | "social_post" | "media_pitch" | "partner_blurb"
  label: string
  /** The drafted text. */
  value: string
  /** Soft length guidance for the reviewer (e.g. SEO title ~60 chars). */
  guidance?: string
  /** True when the asset could not be fully drafted from available data. */
  needsInput: boolean
}

export type PressKit = {
  itemId: string
  label: string
  route?: string
  state: string
  /** False when the item is not allowed through the press at all. */
  eligible: boolean
  /** Why an item is ineligible (when eligible === false). */
  ineligibleReason?: string
  assets: PressAsset[]
  /** Guardrails copied from scope so a reviewer cannot drift the messaging. */
  doNotClaim: string[]
  /** The honest-schema reminder that rides along with every kit. */
  honestSchemaNote: string
}

/** Only items that passed the promotion gate may be drafted. */
export type PressEligibleState = "promotable" | "ready_to_publish"

const ELIGIBLE_STATES: PressEligibleState[] = ["promotable", "ready_to_publish"]

export function isPressEligible(item: PromotionQueueItem): boolean {
  return isActionable(item) && ELIGIBLE_STATES.includes(item.state as PressEligibleState)
}

const HONEST_SCHEMA_NOTE =
  "Draft only — review before use. Publish structured data ONLY for what is truly on the page; " +
  "schema must match visible content. Never mark up claims (price, availability, return-to-ship) the page cannot back up."

const NEEDS_INPUT = "[needs author input — no source angle in the promotion queue yet]"

/** Trim to a soft max without cutting mid-word, adding an ellipsis when shortened. */
function softTrim(text: string, max: number): string {
  if (text.length <= max) return text
  const slice = text.slice(0, max - 1)
  const lastSpace = slice.lastIndexOf(" ")
  return `${slice.slice(0, lastSpace > 0 ? lastSpace : slice.length).trimEnd()}…`
}

/** Friendly site descriptor used across assets. */
function siteName(item: PromotionQueueItem, sat?: SatelliteRecord): string {
  return item.label ?? sat?.name ?? item.id
}

function buildSeoTitle(item: PromotionQueueItem, sat?: SatelliteRecord): PressAsset {
  const name = siteName(item, sat)
  // Pull a short, concrete descriptor from scope (first clause) when available.
  const scopeLead = sat?.scope ? sat.scope.split(/[.(]/)[0].trim() : ""
  const raw = scopeLead ? `${name} — ${scopeLead}` : name
  return {
    key: "seo_title",
    label: "SEO title",
    value: softTrim(raw, 60),
    guidance: "~50–60 characters. Specific to the decision this page answers.",
    needsInput: !scopeLead,
  }
}

function buildMetaDescription(item: PromotionQueueItem, sat?: SatelliteRecord): PressAsset {
  const name = siteName(item, sat)
  const scope = sat?.scope?.replace(/\.$/, "") ?? ""
  const raw = scope
    ? `${scope}. ${name} helps you decide and book the right option, with clear fit and timing.`
    : NEEDS_INPUT
  return {
    key: "meta_description",
    label: "Meta description",
    value: scope ? softTrim(raw, 155) : raw,
    guidance: "~150–155 characters. Useful summary of the decision, not keyword stuffing.",
    needsInput: !scope,
  }
}

function buildSocialPost(item: PromotionQueueItem, sat?: SatelliteRecord): PressAsset {
  const angle = item.mediaAngle
  const value = angle ? softTrim(angle, 240) : NEEDS_INPUT
  return {
    key: "social_post",
    label: "Social post",
    value,
    guidance: "Short, plain, one idea. Links handled separately as a tracked handoff.",
    needsInput: !angle,
  }
}

function buildMediaPitch(item: PromotionQueueItem, sat?: SatelliteRecord): PressAsset {
  const name = siteName(item, sat)
  const angle = item.mediaAngle
  const value = angle
    ? `Story angle: ${angle} ${name} is a narrow, local resource built around one real decision, ` +
      `which makes it concrete and easy to cover. Happy to share how it works and who it helps.`
    : NEEDS_INPUT
  return {
    key: "media_pitch",
    label: "Media pitch",
    value,
    guidance: "2–3 sentences. Lead with the local story, not the brand.",
    needsInput: !angle,
  }
}

function buildPartnerBlurb(item: PromotionQueueItem, sat?: SatelliteRecord): PressAsset {
  const name = siteName(item, sat)
  const outreach = item.outreachAngle
  const value = outreach
    ? `${outreach} ${name} sends qualified, ready-to-act visitors your way and hands off cleanly — ` +
      `no marketplace middle layer.`
    : NEEDS_INPUT
  return {
    key: "partner_blurb",
    label: "Partner / operator blurb",
    value,
    guidance: "Addressed to the operator/partner. State the handoff and the value, not hype.",
    needsInput: !outreach,
  }
}

/** Build a full press kit for a single queue item (eligible or not). */
export function generatePressKit(item: PromotionQueueItem): PressKit {
  const sat = resolveSatellite(item)
  const label = siteName(item, sat)

  if (!isPressEligible(item)) {
    return {
      itemId: item.id,
      label,
      route: item.route,
      state: promotionStateLabel(item.state),
      eligible: false,
      ineligibleReason: `Not through the promotion gate yet (state: ${promotionStateLabel(item.state)}). ${item.nextAction}`,
      assets: [],
      doNotClaim: item.blockedActions,
      honestSchemaNote: HONEST_SCHEMA_NOTE,
    }
  }

  return {
    itemId: item.id,
    label,
    route: item.route,
    state: promotionStateLabel(item.state),
    eligible: true,
    assets: [
      buildSeoTitle(item, sat),
      buildMetaDescription(item, sat),
      buildSocialPost(item, sat),
      buildMediaPitch(item, sat),
      buildPartnerBlurb(item, sat),
    ],
    // Scope guardrails double as "do not claim / do not drift" messaging rules.
    doNotClaim: [...item.blockedActions, ...(sat?.mustNotBecome ?? []).map((m) => `Do not position as a ${m}`)],
    honestSchemaNote: HONEST_SCHEMA_NOTE,
  }
}

/** Only the queue items eligible for the press, as ready-to-review kits. */
export function eligiblePressKits(items: PromotionQueueItem[] = PROMOTION_QUEUE): PressKit[] {
  return items.filter(isPressEligible).map(generatePressKit)
}

/** Items that are NOT eligible, with the reason — shown so nothing is silently skipped. */
export function ineligiblePressItems(items: PromotionQueueItem[] = PROMOTION_QUEUE): PressKit[] {
  return items.filter((i) => !isPressEligible(i)).map(generatePressKit)
}

/** Summary counts for the page header. */
export function pressSummary(items: PromotionQueueItem[] = PROMOTION_QUEUE) {
  const eligible = items.filter(isPressEligible).length
  return { total: items.length, eligible, gated: items.length - eligible }
}
