import Image from "next/image"

type TourType = {
  title: string
  blurb: string
  image: string
  alt: string
  span: string
}

const TOURS: TourType[] = [
  {
    title: "Whale watching",
    blurb: "Humpbacks and orcas on calm protected water — the most reliable wildlife payoff in Southeast Alaska.",
    image: "/wta/whale-watching.png",
    alt: "A humpback whale breaching near a small whale-watching boat in Alaskan coastal waters",
    span: "lg:col-span-2 lg:row-span-2",
  },
  {
    title: "Glacier flightseeing",
    blurb: "Helicopter onto the ice for a glacier walk. Weather-dependent — build in a backup plan.",
    image: "/wta/helicopter-glacier.png",
    alt: "A helicopter landed on a vast blue-white Alaskan glacier with deep crevasses",
    span: "",
  },
  {
    title: "Scenic rail",
    blurb: "Gold-rush railways through mountain passes — dependable in most weather and easy on time.",
    image: "/wta/scenic-train.png",
    alt: "A vintage scenic railway train crossing a trestle bridge in an Alaskan mountain pass",
    span: "",
  },
  {
    title: "Wildlife & bears",
    blurb: "Bears, eagles, and sea otters with local guides who know where the salmon are running.",
    image: "/wta/bear-wildlife.png",
    alt: "A brown grizzly bear catching salmon in a shallow Alaskan river",
    span: "lg:col-span-2",
  },
]

export function TourTypesSection() {
  return (
    <section id="tour-types" className="scroll-mt-20 bg-secondary/50 py-16 md:py-24">
      <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-accent-foreground">Or start with the experience</span>
          <h2 className="max-w-2xl text-balance font-serif text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl">
            Browse by tour type
          </h2>
          <p className="max-w-xl text-pretty leading-relaxed text-muted-foreground">
            Know you want whales, or a glacier, or a calm scenic day? Start here and we&apos;ll match
            it to ports where it&apos;s actually cruise-safe.
          </p>
        </div>

        <div className="mt-10 grid auto-rows-[200px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TOURS.map((tour) => (
            <a
              key={tour.title}
              href="#booking"
              className={`group relative isolate flex flex-col justify-end overflow-hidden rounded-2xl ${tour.span}`}
            >
              <Image
                src={tour.image || "/placeholder.svg"}
                alt={tour.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/25 to-transparent" aria-hidden="true" />
              <div className="relative flex flex-col gap-1 p-5">
                <h3 className="font-serif text-xl font-semibold text-background">{tour.title}</h3>
                <p className="text-sm leading-relaxed text-background/85">{tour.blurb}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
