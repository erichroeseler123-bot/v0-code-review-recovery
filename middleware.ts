import { NextResponse, type NextRequest } from "next/server"
import { getMarketIdForHost } from "@/lib/markets"

/**
 * HOSTNAME ROUTING — the network's front door.
 * --------------------------------------------
 * Each brand domain (welcometoalaskatours.com, welcometotheswamp.com, etc.)
 * is mapped to a market in lib/markets.ts. This middleware looks at the
 * incoming Host header and rewrites the request so the right storefront
 * renders WITHOUT changing the URL in the visitor's address bar.
 *
 *   welcometotheswamp.com/        ->  renders /s/new-orleans
 *   juneauflightdeck.com/         ->  renders /s/juneau-flight-deck
 *
 * Hosts that aren't mapped (v0 preview, *.vercel.app, localhost) fall through
 * to the default behavior: "/" redirects to the flagship (/s/alaska).
 *
 * Deep links (/s/..., /api/..., assets) are never touched, so a mapped domain
 * can still serve its own sub-pages normally.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = request.headers.get("host")
  const marketId = getMarketIdForHost(host)

  // Only act on a mapped brand domain hitting the site root.
  if (marketId && (pathname === "/" || pathname === "")) {
    const url = request.nextUrl.clone()
    url.pathname = `/s/${marketId}`
    // Rewrite (not redirect) so the brand domain stays in the address bar.
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  // Run on real pages only — skip Next internals, API routes, and static assets.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
