"use client"

import dynamic from "next/dynamic"

const NetworkMapInner = dynamic(() => import("./network-map-inner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-secondary">
      <span className="text-sm text-muted-foreground">Loading the map…</span>
    </div>
  ),
})

export function NetworkMap() {
  return <NetworkMapInner />
}
