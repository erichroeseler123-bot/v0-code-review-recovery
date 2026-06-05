import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const tours = readFileSync("lib/tours.ts", "utf8")
const links = readFileSync("lib/links.ts", "utf8")
const panel = readFileSync("components/tour-booking-panel.tsx", "utf8")
const card = readFileSync("components/tour-card.tsx", "utf8")

function extractObject(source, marker) {
  const start = source.indexOf(marker)
  assert.notEqual(start, -1, `Missing marker: ${marker}`)
  const next = source.indexOf("\n  },", start)
  assert.notEqual(next, -1, `Could not find end for marker: ${marker}`)
  return source.slice(start, next)
}

const genericHomepageTours = [
  ["last-frontier", "sitka-sea-otter-wildlife-quest", "https://www.viator.com/"],
  ["last-frontier", "ketchikan-misty-fjords-flightseeing", "https://www.viator.com/"],
  ["new-orleans", "honey-island-swamp-boat-tour", "https://www.viator.com/"],
  ["new-orleans", "new-orleans-cemetery-history-walk", "https://www.viator.com/"],
  ["dells", "wisconsin-dells-duck-tour", "https://www.getyourguide.com/"],
  ["dells", "dells-boat-tour-upper-dells", "https://www.getyourguide.com/"],
]

for (const [marketId, slug, genericUrl] of genericHomepageTours) {
  const tour = extractObject(tours, `slug: "${slug}"`)
  assert.match(tour, new RegExp(`marketId:\\s+"${marketId}"`))
  assert.match(tour, new RegExp(`bookingUrl:\\s+"${genericUrl.replace(/\./g, "\\.")}"`))
}

const connectedViatorTour = extractObject(tours, 'slug: "swamp-airboat-adventure"')
assert.match(connectedViatorTour, /bookingUrl:\s*"https:\/\/www\.viator\.com\/tours\/New-Orleans\//)

assert.match(links, /export function isGenericProviderHomepage/)
assert.match(links, /hostname === "viator\.com"/)
assert.match(links, /hostname === "getyourguide\.com"/)
assert.match(links, /export function hasConnectedBookingUrl/)

assert.match(panel, /hasConnectedBookingUrl\(tour\)/)
assert.match(panel, /Product link not connected yet/)
assert.match(panel, /Book on \{label\}/)

assert.match(card, /hasConnectedBookingUrl\(tour\)/)
assert.match(card, /hasProductBookingUrl \?/)
assert.match(card, />\s*Details\s*<\/Link>/)

console.log("Provider product link source checks passed")
