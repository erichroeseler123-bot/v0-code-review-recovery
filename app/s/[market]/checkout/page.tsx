import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getMarket } from "@/lib/markets"
import { CheckoutForm } from "@/components/checkout-form"

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

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 font-serif text-3xl font-semibold text-foreground">Checkout</h1>
      <CheckoutForm market={market} />
    </div>
  )
}
