import { MapPin, ArrowUpRight } from "lucide-react"

type Port = {
  name: string
  note: string
  tags: string[]
}

const PORTS: Port[] = [
  { name: "Juneau", note: "Whale watching + Mendenhall Glacier in one tight window.", tags: ["Whales", "Glacier", "Helicopter"] },
  { name: "Skagway", note: "Gold-rush rail and mountain passes steps from the dock.", tags: ["Scenic rail", "Hiking"] },
  { name: "Ketchikan", note: "Rainforest, totems, and quick wildlife runs.", tags: ["Wildlife", "Culture"] },
  { name: "Sitka", note: "Sea otters, raptors, and calm-water wildlife boats.", tags: ["Wildlife", "Sea kayak"] },
  { name: "Icy Strait Point", note: "Whales and remote-feeling adventure with short tenders.", tags: ["Whales", "ZipRider"] },
  { name: "Haines", note: "Quieter port, eagles, and braided-river floats.", tags: ["Eagles", "River"] },
  { name: "Seward", note: "Kenai Fjords day cruises and glacier views.", tags: ["Fjords", "Day cruise"] },
  { name: "Whittier", note: "Prince William Sound gateway, glacier-dense cruising.", tags: ["Glacier", "Day cruise"] },
]

export function PortsSection() {
  return (
    <section id="ports" className="mx-auto w-full max-w-6xl scroll-mt-20 px-5 py-16 md:px-8 md:py-24">
      <div className="flex flex-col gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-accent-foreground">Start with your port</span>
        <h2 className="max-w-2xl text-balance font-serif text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl">
          Pick where your ship docks
        </h2>
        <p className="max-w-xl text-pretty leading-relaxed text-muted-foreground">
          Each port has a different rhythm and a different set of cruise-safe tours. Choose yours and
          we&apos;ll show the options that fit the hours you actually have ashore.
        </p>
      </div>

      <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PORTS.map((port) => (
          <li key={port.name}>
            <a
              href="#booking"
              className="group flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-lg font-semibold text-foreground">
                  <MapPin className="size-4 text-primary" aria-hidden="true" />
                  {port.name}
                </span>
                <ArrowUpRight className="size-4 text-muted-foreground transition-colors group-hover:text-primary" aria-hidden="true" />
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{port.note}</p>
              <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
                {port.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
