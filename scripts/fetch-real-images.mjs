// Pulls REAL photos from Wikimedia Commons (free, no API key, no image-gen credits)
// and overwrites the placeholder images in /public. Run: node scripts/fetch-real-images.mjs
import { writeFile, mkdir } from "node:fs/promises"
import { dirname, join } from "node:path"

const PUBLIC = join(process.cwd(), "public")
const UA = "DCCNetwork/1.0 (real-image-fetch; contact admin@welcometoalaskatours.com)"

// target path -> ordered list of Commons search queries (first good hit wins)
const JOBS = {
  // ---- Alaska (wta) ----
  "wta/hero-glacier-fjord.png": ["Tracy Arm fjord Alaska", "Glacier Bay Alaska fjord"],
  "wta/mendenhall-helicopter.png": ["Mendenhall Glacier helicopter", "Mendenhall Glacier Juneau"],
  "wta/seaplane-glacier.png": ["floatplane Alaska glacier", "seaplane Alaska"],
  "wta/whale-watching.png": ["humpback whale Alaska", "whale watching Alaska"],
  "wta/white-pass-train.png": ["White Pass and Yukon Route railway", "Skagway railway train"],
  "wta/ketchikan-wildlife.png": ["black bear Alaska rainforest", "Ketchikan black bear"],
  "wta/juneau-cruise.png": ["Sawyer Glacier Tracy Arm", "Tracy Arm fjord cruise"],
  "wta/skagway.png": ["Skagway Alaska historic street", "Skagway downtown"],
  // ---- Last Frontier ----
  "markets/last-frontier.png": ["Sitka Alaska coast", "Southeast Alaska coastline"],
  "last-frontier/glacier-bay-kayaking.png": ["sea otter Alaska", "sea otter Sitka"],
  "last-frontier/ketchikan-totem-poles.png": ["Misty Fjords National Monument", "Ketchikan totem poles"],
  // ---- New Orleans / Swamp ----
  "swamp/hero-bayou.png": ["Louisiana bayou cypress", "Honey Island Swamp Louisiana"],
  "nola/honey-island-swamp.png": ["Honey Island Swamp boat", "Louisiana swamp airboat"],
  "nola/french-quarter-walking-tour.png": ["New Orleans cemetery tomb", "St Louis Cemetery New Orleans"],
  // ---- Wisconsin Dells ----
  "markets/dells.png": ["Wisconsin Dells sandstone river", "Wisconsin Dells"],
  "dells/wisconsin-dells-boat-tour.png": ["Wisconsin Dells duck boat", "Wisconsin Dells boat"],
  "dells/upper-dells-shore-landing.png": ["Upper Dells Wisconsin River", "Wisconsin Dells gorge"],
  // ---- Shuttleya / Argo ----
  "markets/shuttleya.png": ["Idaho Springs Colorado", "Argo Mill Idaho Springs"],
  "markets/argo-shuttle.png": ["Idaho Springs Colorado main street", "Idaho Springs Colorado"],
  // ---- Somerset / St Croix ----
  "markets/somerset.png": ["St. Croix River valley", "St Croix River Wisconsin Minnesota"],
  "somerset/apple-river-tubing.png": ["Apple River Wisconsin tubing", "Apple River Wisconsin"],
  "somerset/stillwater-riverfront.png": ["Stillwater Minnesota lift bridge", "Stillwater Minnesota downtown"],
  "somerset/amphitheater-shuttle.png": ["outdoor amphitheater concert night", "Somerset Wisconsin"],
  // ---- GoSno hero + resorts (backgrounds; SUV handled separately) ----
  "markets/gosno.png": ["Interstate 70 Colorado mountains winter", "Colorado Rocky Mountains winter highway"],
}

// One real Chevy Suburban used on EVERY GoSno transfer card (per request).
const SUBURBAN_QUERIES = ["Chevrolet Suburban black SUV", "Chevrolet Suburban", "Chevrolet Tahoe black SUV"]
const SUBURBAN_TARGETS = [
  "gosno/breckenridge.png", "gosno/vail.png", "gosno/keystone.png", "gosno/winter-park.png",
  "gosno/copper-mountain.png", "gosno/aspen.png", "gosno/steamboat-springs.png", "gosno/beaver-creek.png",
  "gosno/suburban.png",
]

async function findImageUrl(query) {
  const api = "https://commons.wikimedia.org/w/api.php"
  const params = new URLSearchParams({
    action: "query", format: "json", generator: "search",
    gsrsearch: `filetype:bitmap ${query}`, gsrnamespace: "6", gsrlimit: "8",
    prop: "imageinfo", iiprop: "url|mime|size", iiurlwidth: "1600",
  })
  const res = await fetch(`${api}?${params}`, { headers: { "User-Agent": UA } })
  if (!res.ok) return null
  const data = await res.json()
  const pages = data?.query?.pages
  if (!pages) return null
  const candidates = Object.values(pages)
    .map((p) => p.imageinfo?.[0])
    .filter((i) => i && /image\/(jpeg|png)/.test(i.mime) && (i.thumbwidth || 0) >= 800)
  // prefer landscape
  candidates.sort((a, b) => (b.thumbwidth || 0) - (a.thumbwidth || 0))
  return candidates[0]?.thumburl || null
}

async function fetchFirst(queries) {
  for (const q of queries) {
    try {
      const url = await findImageUrl(q)
      if (url) return url
    } catch (e) {
      console.log(`[v0] query failed "${q}": ${e.message}`)
    }
  }
  return null
}

async function download(url, relPath) {
  const res = await fetch(url, { headers: { "User-Agent": UA } })
  if (!res.ok) throw new Error(`download ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  const dest = join(PUBLIC, relPath)
  await mkdir(dirname(dest), { recursive: true })
  await writeFile(dest, buf)
  console.log(`[v0] saved ${relPath} (${(buf.length / 1024).toFixed(0)}kb) <- ${url.split("/").pop()}`)
}

async function main() {
  let ok = 0, fail = 0
  for (const [path, queries] of Object.entries(JOBS)) {
    const url = await fetchFirst(queries)
    if (!url) { console.log(`[v0] NO MATCH: ${path}`); fail++; continue }
    try { await download(url, path); ok++ } catch (e) { console.log(`[v0] FAIL ${path}: ${e.message}`); fail++ }
  }
  // Suburban: fetch once, copy to all targets
  const suvUrl = await fetchFirst(SUBURBAN_QUERIES)
  if (suvUrl) {
    for (const t of SUBURBAN_TARGETS) {
      try { await download(suvUrl, t); ok++ } catch (e) { console.log(`[v0] FAIL ${t}: ${e.message}`); fail++ }
    }
  } else { console.log("[v0] NO SUBURBAN MATCH"); fail++ }
  console.log(`[v0] done. ok=${ok} fail=${fail}`)
}
main()
