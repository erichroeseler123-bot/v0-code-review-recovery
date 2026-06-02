import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getMarket } from "@/lib/markets"

export const metadata: Metadata = {
  title: "Booking confirmed",
}

export default async function ConfirmedPage({
  params,
  searchParams,
}: {
  params: Promise<{ market: string }>
  searchParams: Promise<{ ref?: string }>
}) {
  const { market: marketId } = await params
  const { ref } = await searchParams
  const market = getMarket(marketId)
  if (!market) notFound()

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <CheckCircle2 className="mx-auto size-14 text-primary" />
      <h1 className="mt-6 font-serif text-3xl font-semibold">You&apos;re booked!</h1>
      <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
        Your booking with {market.name} is confirmed. A confirmation email with all the details is on its way.
      </p>
      {ref && (
        <p className="mt-4 rounded-md bg-secondary px-4 py-3 text-sm">
          Confirmation code: <span className="font-mono font-semibold">{ref}</span>
        </p>
      )}
      <Button asChild className="mt-8">
        <Link href={`/s/${market.id}/tours`}>Browse more tours</Link>
      </Button>
    </div>
  )
}
