"use client"

/**
 * OpportunityBoard — client filtering shell for the next-48-hours prototype.
 *
 * Holds local filter state only (location / intent / time window) and renders
 * the mock opportunities. No data fetching, no API, no persistence — filtering
 * is pure and runs against the in-memory mock feed.
 */

import { useMemo, useState } from "react"
import {
  MOCK_OPPORTUNITIES,
  filterOpportunities,
  REGION_OPTIONS,
  INTENT_OPTIONS,
  TIME_OPTIONS,
  type OpportunityRegion,
  type OpportunityIntent,
  type OpportunityTimeBucket,
} from "@/lib/dcc/earthos/mockOpportunities"
import { OpportunityCard } from "./opportunity-card"

type RegionFilter = "all" | OpportunityRegion
type IntentFilter = "all" | OpportunityIntent
type TimeFilter = "all" | OpportunityTimeBucket

function labelFor(value: string): string {
  if (value === "all") return "All"
  if (value === "next-48-hours") return "Next 48 hours"
  if (value === "this-weekend") return "This weekend"
  if (value === "anytime") return "Anytime"
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function FilterRow<T extends string>({
  legend,
  options,
  active,
  onChange,
}: {
  legend: string
  options: T[]
  active: T
  onChange: (value: T) => void
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = option === active
          return (
            <button
              key={option}
              type="button"
              aria-pressed={isActive}
              onClick={() => onChange(option)}
              className={
                isActive
                  ? "rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
                  : "rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              }
            >
              {labelFor(option)}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export function OpportunityBoard() {
  const [region, setRegion] = useState<RegionFilter>("all")
  const [intent, setIntent] = useState<IntentFilter>("all")
  const [time, setTime] = useState<TimeFilter>("next-48-hours")

  const results = useMemo(
    () => filterOpportunities(MOCK_OPPORTUNITIES, region, intent, time),
    [region, intent, time],
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-muted/30 p-5">
        <FilterRow legend="Location" options={REGION_OPTIONS as RegionFilter[]} active={region} onChange={setRegion} />
        <FilterRow legend="Intent" options={INTENT_OPTIONS as IntentFilter[]} active={intent} onChange={setIntent} />
        <FilterRow legend="Time window" options={TIME_OPTIONS as TimeFilter[]} active={time} onChange={setTime} />
      </div>

      <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
        Showing <span className="font-semibold text-foreground">{results.length}</span> of{" "}
        {MOCK_OPPORTUNITIES.length} mock opportunities.
      </p>

      {results.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {results.map((opportunity) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-background p-10 text-center">
          <p className="text-sm text-muted-foreground">
            No mock opportunities match these filters. Try widening location, intent, or time window.
          </p>
        </div>
      )}
    </div>
  )
}
