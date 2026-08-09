import { NextResponse, type NextRequest } from "next/server"
import { getMarketIdForHost } from "@/lib/markets"

/**
 * HOSTNAME ROUTING — the network's front door.
 *
 * Brand domains render their own storefront at `/s/[market]` while keeping the
 * public brand hostname in the address bar.
 *
 * ShuttleYa is intentionally kept very small: its public brand surface is the
 * storefront plus the Argo booking path. Shared DCC pages must never leak onto
 * shuttleya.com, because that creates brand/SEO contamination under the direct
 * service domain.
 */
const SHUTTLEYA_ALLOWED_PATHS = new Set([
  "/",
  "/book/argo-shuttle",
])

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = request.headers.get("host")
  const marketId = getMarketIdForHost(host)

  if (!marketId) {
    return NextResponse.next()
  }

  if (marketId === "shuttleya") {
    if (pathname === "/" || pathname === "") {
      const url = request.nextUrl.clone()
      url.pathname = "/s/shuttleya"
      return NextResponse.rewrite(url)
    }

    if (!SHUTTLEYA_ALLOWED_PATHS.has(pathname)) {
      const url = request.nextUrl.clone()
      url.pathname = "/"
      url.search = ""
      return NextResponse.redirect(url, 308)
    }

    return NextResponse.next()
  }

  if (pathname === "/" || pathname === "") {
    const url = request.nextUrl.clone()
    url.pathname = `/s/${marketId}`
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  // API, Next internals, favicons, robots/sitemaps and static assets bypass this.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
