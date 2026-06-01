/**
 * Earth OS Outreach Log — internal, manual record of proposed or completed
 * outreach connected to Promotion Queue / Printing Press items.
 *
 * HARD RULES (doctrine + Phase 9 brief):
 * - RECORD ONLY. No email sending, no Gmail, no CRM automation, no external API,
 *   no cron, no DB. Static/mock data for now.
 * - Outreach is gated by the same readiness logic as everything else: an item
 *   may be DRAFTED at any time, but should only reach "ready_to_send" / "sent"
 *   when its related promotion-queue item is actionable. Blocked promotion =
 *   blocked outreach.
 * - Protected/separate sites (PARR, Last Dollar) are never the subject of
 *   promotional outreach here.
 *
 * Pure functions. No side effects.
 */

import {
  PROMOTION_QUEUE,
  resolveSatellite,
  isActionable,
  type PromotionQueueItem,
} from "@/lib/dcc/earthos/promotionQueue"
import type { SatelliteRecord } from "@/lib/dcc/network/satelliteRegistry"
import { getSatellite } from "@/lib/dcc/network/satelliteRegistry"
import type { DccEventName } from "@/lib/dcc/telemetry/events"

export type ContactType = "media" | "property_manager" | "operator" | "venue" | "tourism_partner" | "internal"

export type OutreachGoal =
  | "link_request"
  | "partnership"
  | "media_coverage"
  | "listing"
  | "referral"
  | "verification"
  | "follow_up"

export type OutreachStatus =
  | "draft"
  | "ready_to_send"
  | "sent"
  | "replied"
  | "follow_up_needed"
  | "closed"
  | "blocked"

export type OutreachChannel = "email" | "phone" | "web_form" | "social" | "in_person"

/** Which Printing Press asset (or a custom note) backs this outreach. */
export type MessageAsset = "seo_title" | "media_pitch" | "partner_blurb" | "social_post" | "custom_note"

export type OutreachItem = {
  id: string
  /** The promotion-queue item id this outreach supports (when applicable). */
  relatedPromotionId?: string
  /** The satellite/registry id this outreach is for. */
  relatedSiteId?: string
  /** Free-text corridor label (e.g. "somerset-mystic-lake-concert"). */
  relatedCorridor?: string
  /** Why this outreach exists at all. */
  why: string
  contactName: string
  organization: string
  contactType: ContactType
  goal: OutreachGoal
  status: OutreachStatus
  channel: OutreachChannel
  /** Which drafted asset is used as the message basis. */
  messageAsset: MessageAsset
  /** The single concrete next action for a human. */
  nextAction: string
  lastContact?: string
  nextFollowUp?: string
  outcome?: string
  /** Telemetry we expect to fire or have fired for this handoff/outreach. */
  telemetry: DccEventName[]
  notes?: string
  /** Things that must NOT happen on this item yet. */
  blockedActions: string[]
}

export const OUTREACH_LOG: OutreachItem[] = [
  {
    id: "bho-property-managers",
    relatedPromotionId: "blue-hills-outpost",
    relatedSiteId: "blue-hills-outpost",
    relatedCorridor: "nw-wisconsin-cabin-convenience",
    why: "Blue Hills is promotable and scope-clean. Local cabin / vacation-rental property managers are the highest-intent referral source — their guests are exactly who needs a convenience drop.",
    contactName: "Cabin & rental property managers (NW WI)",
    organization: "Local vacation-rental managers / cabin owners",
    contactType: "property_manager",
    goal: "referral",
    status: "ready_to_send",
    channel: "email",
    messageAsset: "partner_blurb",
    nextAction: "Send the partner blurb to 3–5 managers offering Blue Hills as a guest resource / welcome-packet link.",
    lastContact: undefined,
    nextFollowUp: "One week after first send.",
    outcome: undefined,
    telemetry: ["lead_captured", "cta_clicked"],
    notes: "Frame as a guest-convenience amenity, not a rental marketplace. No dated packages, no paddle-gear headline.",
    blockedActions: ["Do not promise same-day fulfillment in writing", "Do not position Blue Hills as a rental marketplace"],
  },
  {
    id: "bho-local-press",
    relatedPromotionId: "blue-hills-outpost",
    relatedSiteId: "blue-hills-outpost",
    relatedCorridor: "nw-wisconsin-cabin-convenience",
    why: "A local community/business outlet can tell the 'forgot something at the cabin' story. Good local-coverage candidate once the pitch is reviewed.",
    contactName: "Community / small-business desk",
    organization: "Local newspaper / community business outlet",
    contactType: "media",
    goal: "media_coverage",
    status: "draft",
    channel: "email",
    messageAsset: "media_pitch",
    nextAction: "Review and tighten the media pitch before contacting; confirm a local angle and a real contact name.",
    lastContact: undefined,
    nextFollowUp: undefined,
    outcome: undefined,
    telemetry: ["decision_viewed"],
    notes: "Lead with the local story (cabin convenience), not the brand. Honest-schema rule applies to any claims quoted.",
    blockedActions: ["Do not send until the pitch is reviewed", "Do not overstate coverage area"],
  },
  {
    id: "lfse-tourism-partner",
    relatedPromotionId: "last-frontier-shore-excursions",
    relatedSiteId: "last-frontier-shore-excursions",
    relatedCorridor: "alaska-cruise-shore-excursions",
    why: "Last Frontier is ready-to-publish. An Alaska cruise/tourism content partner or operator can validate listings and confirm the Viator handoff path.",
    contactName: "Alaska cruise/tourism content partner or operator",
    organization: "Alaska shore-excursion operator / tourism content partner",
    contactType: "tourism_partner",
    goal: "listing",
    status: "draft",
    channel: "email",
    messageAsset: "partner_blurb",
    nextAction: "Draft a listing/verification ask; confirm which ports and which operator relationships are real before sending.",
    lastContact: undefined,
    nextFollowUp: undefined,
    outcome: undefined,
    telemetry: ["tour_clickout", "lead_captured"],
    notes: "Cruise-port shore excursions only. Do not imply WtA operates tours; handoff is Viator affiliate. Verify return-to-ship claims are operator-stated, never asserted by us.",
    blockedActions: ["Do not claim guaranteed return-to-ship timing", "Do not present as the tour operator"],
  },
  {
    id: "somerset-venue-transport",
    relatedPromotionId: "somerset-st-croix",
    relatedSiteId: "somerset-st-croix",
    relatedCorridor: "somerset-mystic-lake-concert",
    why: "A Mystic Lake / Somerset venue transportation link would be high-value, but the corridor's domain + telemetry architecture is unresolved — so this outreach must stay frozen.",
    contactName: "Venue / amphitheater contact",
    organization: "Mystic Lake / Somerset venue",
    contactType: "venue",
    goal: "link_request",
    status: "blocked",
    channel: "email",
    messageAsset: "custom_note",
    nextAction: "Resolve the Somerset domain + telemetry architecture (see somerset-st-croix doctrine) BEFORE any venue contact.",
    lastContact: undefined,
    nextFollowUp: undefined,
    outcome: undefined,
    telemetry: ["dcc_exit_clicked"],
    notes: "Reason blocked: domain/telemetry architecture not resolved. A link request now would point at an undecided corridor.",
    blockedActions: [
      "Do not contact the venue until the corridor domain is decided",
      "Do not request a link to an unstable route",
    ],
  },
  {
    id: "wta-internal-review",
    relatedPromotionId: "welcome-to-alaska-tours",
    relatedSiteId: "welcome-to-alaska-tours",
    relatedCorridor: "alaska-tours-broad",
    why: "Welcome to Alaska Tours needs visual polish and a homepage-framing fix before any external promotion. This is an internal follow-up, not outbound outreach.",
    contactName: "Internal — design / review owner",
    organization: "DCC / Earth OS (internal)",
    contactType: "internal",
    goal: "follow_up",
    status: "blocked",
    channel: "in_person",
    messageAsset: "custom_note",
    nextAction: "Complete visual polish and resolve the /plan homepage framing; re-check the promotion queue before any external outreach.",
    lastContact: undefined,
    nextFollowUp: undefined,
    outcome: undefined,
    telemetry: ["decision_viewed"],
    notes: "No external contact yet. Promotion is gated until visual polish lands and the homepage stops leaning on internal DCC framing.",
    blockedActions: [
      "Do not pitch media or partners until visual polish is done",
      "Do not send outbound while the homepage framing is unresolved",
    ],
  },
]

const STATUS_ORDER: OutreachStatus[] = [
  "ready_to_send",
  "sent",
  "replied",
  "follow_up_needed",
  "draft",
  "blocked",
  "closed",
]

const STATUS_LABELS: Record<OutreachStatus, string> = {
  draft: "Draft",
  ready_to_send: "Ready to send",
  sent: "Sent",
  replied: "Replied",
  follow_up_needed: "Follow-up needed",
  closed: "Closed",
  blocked: "Blocked",
}

const GOAL_LABELS: Record<OutreachGoal, string> = {
  link_request: "Link request",
  partnership: "Partnership",
  media_coverage: "Media coverage",
  listing: "Listing",
  referral: "Referral",
  verification: "Verification",
  follow_up: "Follow-up",
}

const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  media: "Media",
  property_manager: "Property manager",
  operator: "Operator",
  venue: "Venue",
  tourism_partner: "Tourism partner",
  internal: "Internal",
}

const CHANNEL_LABELS: Record<OutreachChannel, string> = {
  email: "Email",
  phone: "Phone",
  web_form: "Web form",
  social: "Social",
  in_person: "In person",
}

const MESSAGE_ASSET_LABELS: Record<MessageAsset, string> = {
  seo_title: "SEO title",
  media_pitch: "Media pitch",
  partner_blurb: "Partner blurb",
  social_post: "Social post",
  custom_note: "Custom note",
}

export function outreachStatusLabel(s: OutreachStatus): string {
  return STATUS_LABELS[s]
}
export function outreachGoalLabel(g: OutreachGoal): string {
  return GOAL_LABELS[g]
}
export function contactTypeLabel(c: ContactType): string {
  return CONTACT_TYPE_LABELS[c]
}
export function outreachChannelLabel(c: OutreachChannel): string {
  return CHANNEL_LABELS[c]
}
export function messageAssetLabel(m: MessageAsset): string {
  return MESSAGE_ASSET_LABELS[m]
}

/** Resolve the registry record for an outreach item (for name + protection rules). */
export function resolveOutreachSite(item: OutreachItem): SatelliteRecord | undefined {
  if (!item.relatedSiteId) return undefined
  return getSatellite(item.relatedSiteId)
}

/** Resolve the related promotion-queue item (to cross-check readiness). */
export function resolveOutreachPromotion(item: OutreachItem): PromotionQueueItem | undefined {
  if (!item.relatedPromotionId) return undefined
  return PROMOTION_QUEUE.find((p) => p.id === item.relatedPromotionId)
}

/**
 * Consistency check: an outreach item should not claim "ready_to_send"/"sent"
 * while its related promotion item is NOT actionable. Surfaces drift instead of
 * hiding it.
 */
export function outreachReadinessMismatch(item: OutreachItem): string | undefined {
  const promo = resolveOutreachPromotion(item)
  if (!promo) return undefined
  const outboundStatuses: OutreachStatus[] = ["ready_to_send", "sent", "replied", "follow_up_needed"]
  if (outboundStatuses.includes(item.status) && !isActionable(promo)) {
    return `Promotion item "${promo.label ?? promo.id}" is not actionable yet — outreach should not be outbound.`
  }
  return undefined
}

/** Sort the whole log by status priority, then by id. */
export function sortedOutreach(items: OutreachItem[] = OUTREACH_LOG): OutreachItem[] {
  return [...items].sort((a, b) => {
    const d = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
    return d !== 0 ? d : a.id.localeCompare(b.id)
  })
}

/** Group the log by status, in display order, dropping empty groups. */
export function groupedOutreach(items: OutreachItem[] = OUTREACH_LOG): { status: OutreachStatus; items: OutreachItem[] }[] {
  return STATUS_ORDER.map((status) => ({
    status,
    items: items.filter((i) => i.status === status),
  })).filter((g) => g.items.length > 0)
}

/** Summary counts for the page header. */
export function outreachSummary(items: OutreachItem[] = OUTREACH_LOG) {
  return {
    total: items.length,
    readyToSend: items.filter((i) => i.status === "ready_to_send").length,
    inFlight: items.filter((i) => ["sent", "replied", "follow_up_needed"].includes(i.status)).length,
    draft: items.filter((i) => i.status === "draft").length,
    blocked: items.filter((i) => i.status === "blocked").length,
  }
}
