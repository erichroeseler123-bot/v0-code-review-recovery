// Second targeted pass — looser filter.
import { writeFile, mkdir } from "node:fs/promises"
import { dirname, join } from "node:path"
const PUBLIC = join(process.cwd(), "public")
const UA = "DCCNetwork/1.0 (real-image-fetch; admin@welcometoalaskatours.com)"

const JOBS = {
  "last-frontier/glacier-bay-kayaking.png": ["Enhydra lutris sea otter", "sea otter Morro Bay", "sea otter swimming"],
  "dells/upper-dells-shore-landing.png": ["Wisconsin Dells Upper Dells", "Wisconsin River dells boat", "Dells of the Wisconsin River"],
  "somerset/apple-river-tubing.png": ["river tubing", "tubing Apple River Wisconsin", "people floating inner tubes river"],
  "somerset/amphitheater-shuttle.png": ["amphitheater concert audience", "outdoor music venue evening crowd"],
}
async function findImageUrl(query) {
  const api = "https://commons.wikimedia.org/w/api.php"
  const params = new URLSearchParams({
    action: "query", format: "json", generator: "search",
    gsrsearch: `filetype:bitmap ${query}`, gsrnamespace: "6", gsrlimit: "12",
    prop: "imageinfo", iiprop: "url|mime|size", iiurlwidth: "1600",
  })
  const res = await fetch(`${api}?${params}`, { headers: { "User-Agent": UA } })
  if (!res.ok) return null
  const data = await res.json()
  const pages = data?.query?.pages
  if (!pages) return null
  const cands = Object.values(pages)
    .map((p) => p.imageinfo?.[0])
    .filter((i) => i && /image\/(jpeg|png)/.test(i.mime) && (i.thumbwidth || 0) >= 900)
    .filter((i) => !/encyclopedia|_review_|gallery|FMIB|_book_|plate/i.test(i.thumburl || ""))
  cands.sort((a, b) => (b.thumbwidth || 0) - (a.thumbwidth || 0))
  return cands[0]?.thumburl || null
}
async function fetchFirst(qs) { for (const q of qs) { try { const u = await findImageUrl(q); if (u) return u } catch {} } return null }
async function download(url, rel) {
  const res = await fetch(url, { headers: { "User-Agent": UA } })
  if (!res.ok) throw new Error(`dl ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  const dest = join(PUBLIC, rel); await mkdir(dirname(dest), { recursive: true }); await writeFile(dest, buf)
  console.log(`[v0] saved ${rel} (${(buf.length/1024).toFixed(0)}kb) <- ${url.split("/").pop()}`)
}
for (const [path, qs] of Object.entries(JOBS)) {
  const url = await fetchFirst(qs)
  if (!url) { console.log(`[v0] NO MATCH ${path}`); continue }
  try { await download(url, path) } catch (e) { console.log(`[v0] FAIL ${path}: ${e.message}`) }
}
console.log("[v0] pass2 done")
