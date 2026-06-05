import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const panel = readFileSync("components/tour-booking-panel.tsx", "utf8")
const cart = readFileSync("components/cart-provider.tsx", "utf8")
const checkoutForm = readFileSync("components/checkout-form.tsx", "utf8")
const checkoutApi = readFileSync("app/api/checkout/route.ts", "utf8")
const availabilityApi = readFileSync("app/api/availability/route.ts", "utf8")
const types = readFileSync("lib/booking/types.ts", "utf8")

assert.match(panel, /market\.provider === "fareharbor"/)
assert.match(panel, /Choose date/)
assert.match(panel, /Choose time/)
assert.match(panel, /\/api\/availability\?tour=\$\{tour\.slug\}&date=\$\{selectedDate\}/)
assert.match(panel, /disabled=\{!selectedDate \|\| !selectedSlot \|\| availabilityStatus !== "ready"\}/)
assert.match(panel, /availabilityId: selectedSlot\.id/)
assert.match(panel, /selectedDate,/)
assert.match(panel, /startsAt: selectedSlot\.startsAt/)
assert.match(panel, /router\.push\(`\/s\/\$\{market\.id\}\/checkout`\)/)

assert.match(cart, /availabilityId\?: string/)
assert.match(cart, /selectedDate\?: string/)
assert.match(cart, /startsAt\?: string/)
assert.match(cart, /dateLabel\?: string/)

assert.match(checkoutForm, /date: i\.selectedDate \?\? date/)
assert.match(checkoutForm, /availabilityId: i\.availabilityId/)
assert.match(checkoutForm, /startsAt: i\.startsAt/)
assert.match(checkoutForm, /Selected FareHarbor time/)

assert.match(types, /availabilityId\?: string/)
assert.match(types, /startsAt\?: string/)

assert.match(availabilityApi, /const date = searchParams\.get\("date"\)/)
assert.match(availabilityApi, /date \? new Date\(`\$\{date\}T00:00:00`\)/)

assert.match(checkoutApi, /market\.provider === "fareharbor"/)
assert.match(checkoutApi, /!item\.availabilityId \|\| !item\.startsAt/)
assert.match(checkoutApi, /Choose an available FareHarbor time/)
assert.match(checkoutApi, /selectedSlot = slots\.find\(\(slot\) => slot\.id === item\.availabilityId\)/)
assert.match(checkoutApi, /availabilityId: availabilityId!/)
assert.doesNotMatch(checkoutApi, /const slot = slots\[0\][\s\S]*availabilityId: slot\.id/)

assert.match(panel, /market\.id === "gosno"/)
assert.match(panel, /<GoSnoRezdyBooking \/>/)
assert.match(panel, /market\.id === "somerset"/)
assert.match(panel, /<SomersetRezdyBooking \/>/)

console.log("FareHarbor time selection source checks passed")
