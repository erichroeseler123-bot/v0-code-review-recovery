import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const tours = readFileSync("lib/tours.ts", "utf8")
const card = readFileSync("components/tour-card.tsx", "utf8")
const detail = readFileSync("app/s/[market]/tours/[slug]/page.tsx", "utf8")
const ports = readFileSync("components/ports-section.tsx", "utf8")
const marketPage = readFileSync("app/s/[market]/page.tsx", "utf8")
const toursPage = readFileSync("app/s/[market]/tours/page.tsx", "utf8")
const fallback = readFileSync("components/product-visual-fallback.tsx", "utf8")

assert.match(tours, /export interface ProductImage/)
assert.match(tours, /providerImageUrl\?: string/)
assert.match(tours, /storedImageUrl: string/)
assert.match(tours, /imageSourceType: "provider" \| "operator" \| "owned"/)
assert.match(tours, /imageVerified: true/)
assert.match(tours, /imageAttribution\?: string/)
assert.match(tours, /imageFetchedAt\?: string/)
assert.match(tours, /usage\?: ProductImageUsage\[\]/)
assert.match(tours, /productImages\?: ProductImage\[\]/)

assert.match(tours, /export function getVerifiedProductImages/)
assert.match(tours, /\.filter\(isVerifiedStoredProductImage\)/)
assert.match(tours, /image\?\.storedImageUrl/)
assert.match(tours, /export function getProductCoverImage/)
assert.match(tours, /getProductImageForUsage\(tour, "cover"\)/)
assert.match(tours, /getProductImageForUsage\(tour, "card"\)/)
assert.match(tours, /export function getProductFeatureImage/)

assert.match(card, /getProductCoverImage\(tour\)/)
assert.match(card, /src=\{coverImage\.storedImageUrl\}/)
assert.match(card, /<ProductVisualFallback market=\{market\} tour=\{tour\} \/>/)
assert.doesNotMatch(card, /src=\{tour\.image\}/)

assert.match(detail, /getProductCoverImage\(tour\)/)
assert.match(detail, /getVerifiedProductImages\(tour\)/)
assert.match(detail, /src=\{coverImage\.storedImageUrl\}/)
assert.match(detail, /galleryImages\.slice\(1, 4\)/)
assert.match(detail, /<ProductVisualFallback market=\{market\} tour=\{tour\}/)
assert.doesNotMatch(detail, /src=\{tour\.image\}/)

assert.match(ports, /getProductFeatureImage/)
assert.match(ports, /src=\{image\.storedImageUrl\}/)
assert.match(ports, /<ProductVisualFallback market=\{market\} tour=\{fallbackTour\} \/>/)
assert.doesNotMatch(ports, /PORT_IMAGES|placeholder\.svg/)

assert.doesNotMatch(marketPage, /enrichToursWithImages|await enrich/)
assert.doesNotMatch(toursPage, /enrichToursWithImages|await enrich/)
assert.doesNotMatch(detail, /enrichTourImage|await enrich/)

assert.doesNotMatch(fallback, /next\/image|<img\b|<Image\b|https?:\/\//)
assert.doesNotMatch(`${tours}\n${fallback}`, /wikimedia|commons|unsplash|pexels|stock photo|ai-generated/i)

const staticImagePrefixes = ["/swamp", "/dells", "/last-frontier", "/wta"]
const tourObjects = tours.match(/\{\n\s+slug:\s+"[^"]+"[\s\S]*?\n\s+\},/g) ?? []
for (const tour of tourObjects) {
  const hasVerifiedFlag = /imageVerified:\s*true/.test(tour)
  const hasStaticImage = staticImagePrefixes.some((prefix) =>
    new RegExp(`image:\\s*"${prefix.replace("/", "\\/")}`).test(tour),
  )
  assert.equal(
    hasVerifiedFlag && hasStaticImage,
    false,
    "unverified static product image path should not be marked verified",
  )
}

console.log("Product image gallery architecture source checks passed")
