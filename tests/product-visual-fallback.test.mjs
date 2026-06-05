import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"

const fallbackPath = "components/product-visual-fallback.tsx"
assert.equal(existsSync(fallbackPath), true, "fallback component should exist")

const fallback = readFileSync(fallbackPath, "utf8")
const card = readFileSync("components/tour-card.tsx", "utf8")
const detail = readFileSync("app/s/[market]/tours/[slug]/page.tsx", "utf8")
const tours = readFileSync("lib/tours.ts", "utf8")

assert.doesNotMatch(fallback, /next\/image|<img\b|<Image\b/)
assert.doesNotMatch(fallback, /https?:\/\//)
assert.doesNotMatch(fallback, /wikimedia|commons|unsplash|pexels|stock photo|ai-generated/i)
assert.match(fallback, /market: Market/)
assert.match(fallback, /tour: Tour/)

assert.match(card, /hasVerifiedProductImage\(tour\)/)
assert.match(card, /import \{ ProductVisualFallback \}/)
assert.match(card, /<ProductVisualFallback market=\{market\} tour=\{tour\} \/>/)

assert.match(detail, /hasVerifiedProductImage\(tour\)/)
assert.match(detail, /import \{ ProductVisualFallback \}/)
assert.match(detail, /<ProductVisualFallback market=\{market\} tour=\{tour\}/)

assert.match(tours, /export function hasVerifiedProductImage/)
assert.match(tours, /tour\.imageVerified === true/)
assert.match(tours, /tour\.imageSourceType === "provider"/)
assert.match(tours, /tour\.imageSourceType === "operator"/)
assert.match(tours, /tour\.imageSourceType === "owned"/)

const tourObjects = tours.match(/\{\n\s+slug:\s+"[^"]+"[\s\S]*?\n\s+\},/g) ?? []
for (const tour of tourObjects) {
  const hasVerifiedFlag = /imageVerified:\s*true/.test(tour)
  const hasLocalStaticImage = /image:\s*"\/[^"]+"/.test(tour)
  assert.equal(
    hasVerifiedFlag && hasLocalStaticImage,
    false,
    "local static product image should not be marked verified",
  )
}

console.log("Product visual fallback source checks passed")
