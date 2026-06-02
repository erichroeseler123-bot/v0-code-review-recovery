import { ToursBrowser } from "@/components/tours-browser"

export const metadata = {
  title: "All Alaska Shore Excursions | Welcome to Alaska Tours",
  description:
    "Browse every Alaska cruise-port shore excursion — glacier flightseeing, whale watching, scenic rail, wildlife, and walking tours. Filter by port and book on-site.",
}

export default async function ToursPage({
  searchParams,
}: {
  searchParams: Promise<{ port?: string }>
}) {
  const { port } = await searchParams

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Shore Excursions</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-foreground text-balance">
          All Alaska tours
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
          Hand-picked excursions across every major cruise port, timed to your ship and led by local
          guides. Add tours to your cart and confirm dates at checkout.
        </p>
      </header>

      <ToursBrowser initialPort={port} />
    </div>
  )
}
