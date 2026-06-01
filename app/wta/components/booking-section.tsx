import { Compass, ListChecks, CalendarCheck, Ticket, ArrowRight } from "lucide-react"

const STEPS = [
  {
    icon: Compass,
    title: "Tell us your port & time",
    body: "Where your ship docks and how many hours you have ashore. That alone rules out a lot of tours.",
  },
  {
    icon: ListChecks,
    title: "We point to the right tours",
    body: "A short, honest shortlist that fits your window — not every listing in Alaska.",
  },
  {
    icon: CalendarCheck,
    title: "Check live availability",
    body: "We hand you to the operator's live booking to see real departure times for your date.",
  },
  {
    icon: Ticket,
    title: "Book with the operator",
    body: "Pricing, checkout, and confirmation happen on the operator's system. They run the tour.",
  },
]

export function BookingSection() {
  return (
    <section id="booking" className="scroll-mt-20 bg-primary py-16 text-primary-foreground md:py-24">
      <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/70">
            How booking actually works
          </span>
          <h2 className="max-w-2xl text-balance font-serif text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
            We help you decide. The operator runs the tour.
          </h2>
          <p className="max-w-xl text-pretty leading-relaxed text-primary-foreground/80">
            We don&apos;t own boats, helicopters, or schedules, and we don&apos;t hold inventory. Our
            job is getting you to the right tour with cruise-safe timing — then the operator&apos;s
            live booking confirms availability and price.
          </p>
        </div>

        <ol className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="flex flex-col gap-3 rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 p-5"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary-foreground/15">
                  <step.icon className="size-5" aria-hidden="true" />
                </span>
                <span className="font-serif text-2xl font-semibold text-primary-foreground/40">{i + 1}</span>
              </div>
              <h3 className="text-base font-semibold">{step.title}</h3>
              <p className="text-sm leading-relaxed text-primary-foreground/75">{step.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-col items-start gap-4 rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 p-6 sm:flex-row sm:items-center sm:justify-between md:p-8">
          <div>
            <p className="font-serif text-xl font-semibold">Ready to match your port to a tour?</p>
            <p className="mt-1 text-sm text-primary-foreground/75">
              Start with your port — we&apos;ll show cruise-safe options and check live times.
            </p>
          </div>
          <a
            href="#ports"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-base font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5"
          >
            Check cruise-safe availability
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  )
}
