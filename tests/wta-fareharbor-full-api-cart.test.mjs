import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const markets = readFileSync("lib/markets.ts", "utf8")
const tours = readFileSync("lib/tours.ts", "utf8")
const panel = readFileSync("components/tour-booking-panel.tsx", "utf8")
const cart = readFileSync("components/cart-provider.tsx", "utf8")
const checkoutForm = readFileSync("components/checkout-form.tsx", "utf8")
const checkoutApi = readFileSync("app/api/checkout/route.ts", "utf8")
const availabilityApi = readFileSync("app/api/availability/route.ts", "utf8")
const fareharbor = readFileSync("lib/booking/fareharbor.ts", "utf8")
const types = readFileSync("lib/booking/types.ts", "utf8")

function extractObject(source, marker) {
  const start = source.indexOf(marker)
  assert.notEqual(start, -1, `Missing marker: ${marker}`)
  const next = source.indexOf("\n  },", start)
  assert.notEqual(next, -1, `Could not find end for marker: ${marker}`)
  return source.slice(start, next)
}

const alaskaMarket = extractObject(markets, "alaska: {")
const jfdMarket = extractObject(markets, '"juneau-flight-deck": {')

assert.match(alaskaMarket, /id:\s*"alaska"/)
assert.match(alaskaMarket, /domain:\s*"welcometoalaskatours\.com"/)
assert.match(alaskaMarket, /provider:\s*"fareharbor"/)
assert.match(jfdMarket, /provider:\s*"fareharbor"/)

for (const [slug, company, ref] of [
  ["mendenhall-glacier-helicopter", "temscoair-juneau", "214803"],
  ["five-glacier-seaplane", "wingsairways", "256881"],
  ["juneau-whale-watching", "dolphintours", "2436"],
  ["ketchikan-bear-wildlife", "taquanair", "560411"],
]) {
  const tour = extractObject(tours, `slug: "${slug}"`)
  assert.match(tour, /marketId:\s*"alaska"/)
  assert.match(tour, new RegExp(`providerCompany:\\s+"${company}"`))
  assert.match(tour, new RegExp(`providerRef:\\s+"${ref}"`))
}

assert.match(checkoutApi, /APPROVED_WTA_FAREHARBOR_ITEMS/)
assert.match(checkoutApi, /tour\.marketId === "alaska"/)
assert.match(checkoutApi, /WTA_FAREHARBOR_ONLY/)
assert.match(checkoutApi, /!item\.availabilityId \|\| !item\.startsAt/)
assert.match(checkoutApi, /item\.customerTypeRates/)
assert.match(checkoutApi, /selectedSlot\.startsAt !== item\.startsAt/)
assert.match(checkoutApi, /availableRateIds/)
assert.match(checkoutApi, /customerTypeRates:\s*market\.provider === "fareharbor" \? selectedRates : undefined/)

assert.match(availabilityApi, /market\.provider === "fareharbor" && market\.id !== "alaska"/)
assert.match(availabilityApi, /wtaOnly:\s*true/)
assert.match(availabilityApi, /customerTypeRates:\s*s\.customerTypeRates/)

assert.match(panel, /if \(market\.id === "alaska"\)/)
assert.match(panel, /Choose date/)
assert.match(panel, /Choose time/)
assert.match(panel, /Ticket quantities/)
assert.match(panel, /\/api\/availability\?tour=/)
assert.match(panel, /availabilityId:\s*wtaSlot\.id/)
assert.match(panel, /startsAt:\s*wtaSlot\.startsAt/)
assert.match(panel, /customerTypeRates:\s*selectedRates/)

assert.match(cart, /selectedDate\?:\s*string/)
assert.match(cart, /startsAt\?:\s*string/)
assert.match(cart, /customerTypeRates\?:/)
assert.match(checkoutForm, /availabilityId:\s*i\.availabilityId/)
assert.match(checkoutForm, /startsAt:\s*i\.startsAt/)
assert.match(checkoutForm, /customerTypeRates:\s*i\.customerTypeRates/)

assert.match(types, /export interface CustomerTypeRate/)
assert.match(types, /customerTypeRates\?: CustomerTypeRate\[\]/)
assert.match(types, /customerTypeRates\?: \{ id: string; quantity: number \}\[\]/)

assert.match(fareharbor, /customer_type_rates\?: FhCustomerTypeRate\[\]/)
assert.match(fareharbor, /customer_type_rate:\s*Number\(rate\.id\)/)
assert.doesNotMatch(fareharbor, /customer_type_rate:\s*null/)

console.log("WTA FareHarbor full API cart source checks passed")
