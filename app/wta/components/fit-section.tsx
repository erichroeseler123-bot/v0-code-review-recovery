import { Check, X } from "lucide-react"

const FIT = [
  "You're on a cruise and have a fixed number of hours in port",
  "You want the tour that fits your day, not the longest list of options",
  "You'd rather book the operator directly than guess from reviews",
  "You care about cruise-safe timing and getting back to the ship",
]

const NOT_FIT = [
  "You want a full multi-day Alaska itinerary planned end to end",
  "You need guaranteed pricing or availability before an operator confirms",
  "You're looking for a generic travel blog or encyclopedia",
  "You expect us to operate the tour — we don't; operators do",
]

export function FitSection() {
  return (
    <section id="fit" className="mx-auto w-full max-w-6xl scroll-mt-20 px-5 py-16 md:px-8 md:py-24">
      <div className="flex flex-col gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-accent-foreground">Honest fit check</span>
        <h2 className="max-w-2xl text-balance font-serif text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl">
          Is this the right place for you?
        </h2>
        <p className="max-w-xl text-pretty leading-relaxed text-muted-foreground">
          We&apos;d rather tell you up front than waste your shore time. Here&apos;s who we help — and
          who we don&apos;t.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-primary/25 bg-primary/5 p-6 md:p-8">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check className="size-4" aria-hidden="true" />
            </span>
            A great fit if
          </h3>
          <ul className="mt-5 flex flex-col gap-4">
            {FIT.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-foreground">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <span className="flex size-7 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <X className="size-4" aria-hidden="true" />
            </span>
            Probably not us if
          </h3>
          <ul className="mt-5 flex flex-col gap-4">
            {NOT_FIT.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
                <X className="mt-0.5 size-4 shrink-0 text-muted-foreground/70" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
