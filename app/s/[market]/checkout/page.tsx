import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { getMarket } from "@/lib/markets"
import { CheckoutForm } from "@/components/checkout-form"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Checkout",
}

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ market: string }>
}) {
  const { market: marketId } = await params
  const market = getMarket(marketId)
  if (!market) notFound()

  if (market.id === "gosno") {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-serif text-3xl font-semibold text-foreground">Request a GoSno quote</h1>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          GoSno is currently accepting quote requests by phone, text, and inquiry form.
          Online checkout is not enabled for GoSno yet.
        </p>
        <Button asChild className="mt-8">
          <Link href="/s/gosno">Return to GoSno</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 font-serif text-3xl font-semibold text-foreground">Checkout</h1>
      <CheckoutForm market={market} />
    </div>
  )
}
