/**
 * Earth OS — Daily Brief Snapshot Handler (Phase 12).
 *
 * INTERNAL, READ-ONLY API. Implements exactly one scheduler-contract job —
 * `daily_brief_snapshot` — as a real handler that returns the Daily Brief as
 * JSON.
 *
 * HARD RULES (Phase 12 brief + doctrine):
 * - GET only. Read-only. No persistence, no sending, no external API, no DB,
 *   no file writes, no deploy, no PARR.
 * - Not a cron. Nothing here is scheduled; it computes on request.
 * - noindex via headers; not linked from any public nav.
 *
 * Doctrine: v0_memories/user/earth-os.md, dcc-network.md
 */

import { NextResponse } from "next/server"
import { buildDailyBriefSnapshot } from "@/lib/dcc/earthos/dailyBriefSnapshot"

// Computed per-request from in-repo state; never statically cached at build.
export const dynamic = "force-dynamic"

/** Internal-review cache + robots headers shared by every response. */
const INTERNAL_HEADERS: Record<string, string> = {
  // Short private cache: fresh enough for a reviewer, never shared/CDN-cached.
  "Cache-Control": "private, no-store, max-age=0, must-revalidate",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "Content-Type": "application/json; charset=utf-8",
}

export function GET() {
  // Pure, read-only build. mode "reviewer_required" labels the artifact as
  // awaiting human sign-off before any of its recommendations are acted on.
  const snapshot = buildDailyBriefSnapshot("reviewer_required")
  return NextResponse.json(snapshot, { status: 200, headers: INTERNAL_HEADERS })
}

/** Any mutating/other method is rejected — this surface only ever reads. */
function methodNotAllowed() {
  return NextResponse.json(
    {
      error: "method_not_allowed",
      message: "The Daily Brief snapshot is read-only. Use GET.",
      allow: ["GET"],
    },
    { status: 405, headers: { ...INTERNAL_HEADERS, Allow: "GET" } },
  )
}

export const POST = methodNotAllowed
export const PUT = methodNotAllowed
export const PATCH = methodNotAllowed
export const DELETE = methodNotAllowed
