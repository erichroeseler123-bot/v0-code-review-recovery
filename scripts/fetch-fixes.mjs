// Third pass — exclude antique/snow results.
import { writeFile, mkdir } from "node:fs/promises"
import { dirname, join } from "node:path"
const PUBLIC = join(process.cwd(), "public")
const UA = "DCCNetwork/1.0 (real-image-fetch; admin@welcometoalaskatours.com)"

const JOBS = {
  "dells/upper-dells-shore-landing.png": ["Wisconsin Dells boat landscape", "Wisconsin River Dells cliffs summer", "Dells Wisconsin sandstone river"],
  "somerset/apple-river-tubing.png": ["summer river inner tube float", "people tubing river warm", "river float trip summer"],
}
const BAD = /stereo|Bennett|encyclopedia|_review_|gallery|FMIB|_book_|plate|snow|winter|Mad_River|sledding|ski/i
async function findImageUrl(query) {
  const api = "https://commons.wikimedia.org/w/api.php"
  const params = new URLSearchParams({
    action: "query", format: "json", generator: "search",
    gsrsearch: `filetype:bitmap ${query}`, gsrnamespace: "6", gsrlimit: "15",
    prop: "imageinfo", iiprop: "url|mime|size", iiurlwidth: "1600",
  })
  const res = await fetch(`${api}?${params}`, { headers: { "User-Agent": UA } })
  if (!res.ok) return null
  const data = await res.json()
  const pages = data?.query?.pages
  if (!pages) return null
  const cands = Object.values(pages)
    .map((p) => p.imageinfo?.[0])
    .filter((i) => i && /image\/jpeg/.test(i.mime) && (i.thumbwidth || 0) >= 1000)
    .filter((i) => !BAD.test(i.thumburl || ""))
    .filter((i) => (i.thumbwidth || 0) > (i.thumbheight || 1)) // landscape only
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
console.log("[v0] pass3 done")
