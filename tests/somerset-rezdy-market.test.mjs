import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const markets = readFileSync("lib/markets.ts", "utf8")
const tours = readFileSync("lib/tours.ts", "utf8")
const panel = readFileSync("components/tour-booking-panel.tsx", "utf8")
const card = readFileSync("components/tour-card.tsx", "utf8")
const checkout = readFileSync("app/s/[market]/checkout/page.tsx", "utf8")
const widget = readFileSync("components/somerset-rezdy-booking.tsx", "utf8")

function extractObject(source, marker) {
  const start = source.indexOf(marker)
  assert.notEqual(start, -1, `Missing marker: ${marker}`)
  const next = source.indexOf("\n  },", start)
  assert.notEqual(next, -1, `Could not find end for marker: ${marker}`)
  return source.slice(start, next)
}

const somersetMarket = extractObject(markets, "somerset: {")
const somersetTour = extractObject(tours, 'slug: "somerset-amphitheater-private-suburban"')

assert.match(somersetMarket, /domain:\s*"shuttletosomersetamphitheater\.com"/)
assert.match(somersetMarket, /id:\s*"somerset"/)
assert.match(somersetMarket, /Private Somerset Amphitheater Transportation/)
assert.match(somersetMarket, /Rezdy/)
assert.doesNotMatch(somersetMarket, /Alaska/i)

assert.match(somersetTour, /Private Somerset Amphitheater Transportation/)
assert.match(somersetTour, /priceFromCents:\s*39900/)
assert.match(somersetTour, /providerRef:\s*"766964"/)
assert.doesNotMatch(somersetTour, /Alaska/i)
assert.doesNotMatch(somersetTour, /per person|per-person|shared/i)
assert.doesNotMatch(somersetTour, /bookingUrl:\s*"https:\/\/shuttletosomersetamphitheater\.com"/)

assert.match(widget, /gosnotransportation58\.rezdy\.com\/pluginJs/)
assert.match(widget, /766964\/somerset-ampitheater-shuttle\?iframe=true/)
assert.doesNotMatch(widget, /api\/checkout|api\/leads|confirmed by us|local/i)

assert.match(panel, /market\.id === "somerset"/)
assert.match(panel, /<SomersetRezdyBooking \/>/)
assert.match(card, /market\.id === "gosno" \|\| market\.id === "somerset"/)
assert.match(checkout, /market\.id === "gosno" \|\| market\.id === "somerset"/)

console.log("Somerset Rezdy market source checks passed")

