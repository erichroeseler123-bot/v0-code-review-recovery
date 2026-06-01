"use client"

/**
 * TrackedHandoffLink — the single official way to leave the DCC network.
 *
 * Renders a normal link/button, fires one canonical telemetry event on click,
 * then lets navigation continue. Telemetry NEVER blocks the user: if emission
 * throws or the endpoint is missing, the click still proceeds.
 *
 * Doctrine: every external link that can make money or prove demand uses this.
 * v0_memories/user/network-design-system.md
 */

import type { ReactNode } from "react"
import {
  createHandoffPayload,
  isExternalDestination,
  type HandoffDestination,
  type HandoffLinkInput,
} from "@/lib/dcc/handoff/createHandoffPayload"
import type { TelemetryEvent } from "@/lib/dcc/schema/core"

export type TrackedHandoffLinkProps = {
  href: string
  label: string
  sourceRoute: string
  satelliteId?: string
  corridorId?: string
  destinationType: HandoffDestination
  productId?: string
  operatorName?: string
  intent?: string
  eventName?: HandoffLinkInput["eventName"]
  className?: string
  children?: ReactNode
}

/**
 * Best-effort, non-blocking telemetry emission. Tries sendBeacon, then a
 * keepalive fetch, and swallows every error so the handoff always proceeds.
 * The endpoint is optional — a missing route degrades silently.
 */
function emitHandoffEvent(event: TelemetryEvent): void {
  if (typeof window === "undefined") return
  try {
    const endpoint = "/api/internal/dcc-events"
    const body = JSON.stringify(event)
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(endpoint, new Blob([body], { type: "application/json" }))
      return
    }
    void fetch(endpoint, {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    }).catch(() => {})
  } catch {
    // Telemetry must never break a handoff. Intentionally ignored.
  }
}

export function TrackedHandoffLink({
  href,
  label,
  sourceRoute,
  satelliteId,
  corridorId,
  destinationType,
  productId,
  operatorName,
  intent,
  eventName,
  className,
  children,
}: TrackedHandoffLinkProps) {
  const external = isExternalDestination(destinationType)

  function handleClick() {
    const { event } = createHandoffPayload({
      href,
      label,
      sourceRoute,
      satelliteId,
      corridorId,
      destinationType,
      productId,
      operatorName,
      intent,
      eventName,
    })
    emitHandoffEvent(event)
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      className={
        className ??
        "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      }
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children ?? label}
    </a>
  )
}
