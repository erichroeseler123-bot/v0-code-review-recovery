"use client"

import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Tour } from "@/lib/tours"

type FormState = {
  contactName: string
  contactEmail: string
  contactPhone: string
  travelers: string
  preferredDate: string
  flightInfo: string
  notes: string
}

const initialState: FormState = {
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  travelers: "1",
  preferredDate: "",
  flightInfo: "",
  notes: "",
}

export function GoSnoQuoteForm({ tour }: { tour: Tour }) {
  const [form, setForm] = useState<FormState>(initialState)
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [error, setError] = useState<string | null>(null)

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus("submitting")
    setError(null)

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marketId: "gosno",
          tourSlug: tour.slug,
          tourTitle: tour.title,
          route: tour.location,
          contactName: form.contactName,
          contactEmail: form.contactEmail,
          contactPhone: form.contactPhone,
          travelers: Number(form.travelers),
          preferredDate: form.preferredDate,
          flightInfo: form.flightInfo,
          notes: form.notes,
        }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) {
        setStatus("error")
        setError(data.error ?? "We could not send your request. Please call or text GoSno.")
        return
      }
      setStatus("success")
      setForm(initialState)
    } catch {
      setStatus("error")
      setError("Network error. Please call or text GoSno.")
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-md border border-primary/30 bg-primary/5 p-4 text-sm leading-relaxed text-foreground">
        Thanks — we received your trip details. We&apos;ll follow up with availability and a
        custom quote.
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <input type="hidden" name="tourSlug" value={tour.slug} />
      <div className="grid gap-1.5">
        <Label htmlFor="gosno-contact-name">
          Name
        </Label>
        <Input
          id="gosno-contact-name"
          required
          value={form.contactName}
          onChange={(e) => update("contactName", e.target.value)}
        />
      </div>

      <div className="grid gap-1.5 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="gosno-contact-email">
            Email
          </Label>
          <Input
            id="gosno-contact-email"
            type="email"
            required
            value={form.contactEmail}
            onChange={(e) => update("contactEmail", e.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="gosno-contact-phone">
            Phone
          </Label>
          <Input
            id="gosno-contact-phone"
            type="tel"
            required
            value={form.contactPhone}
            onChange={(e) => update("contactPhone", e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-1.5 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="gosno-travelers">
            Travelers
          </Label>
          <Input
            id="gosno-travelers"
            type="number"
            min="1"
            required
            value={form.travelers}
            onChange={(e) => update("travelers", e.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="gosno-preferred-date">
            Pickup date
          </Label>
          <Input
            id="gosno-preferred-date"
            type="date"
            required
            value={form.preferredDate}
            onChange={(e) => update("preferredDate", e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="gosno-route">
          Route
        </Label>
        <Input
          id="gosno-route"
          value={tour.title}
          readOnly
          className="bg-secondary text-muted-foreground"
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="gosno-flight-info">
          Flight info
        </Label>
        <Input
          id="gosno-flight-info"
          value={form.flightInfo}
          onChange={(e) => update("flightInfo", e.target.value)}
          placeholder="Airline, flight number, arrival time"
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="gosno-notes">
          Notes
        </Label>
        <Textarea
          id="gosno-notes"
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          placeholder="Resort address, luggage, ski gear, child seats, return trip needs"
          rows={4}
        />
      </div>

      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Sending..." : "Send Trip Details"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        GoSno will review your request and follow up with availability and pricing.
      </p>
    </form>
  )
}
