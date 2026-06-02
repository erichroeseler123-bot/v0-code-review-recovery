"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useCart } from "@/components/cart-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatPrice } from "@/lib/tours"
import type { Market } from "@/lib/markets"
import { AlertCircle, Lock } from "lucide-react"

export function CheckoutForm({ market }: { market: Market }) {
  const { items, subtotalCents, clear } = useCart()
  const router = useRouter()
  const base = `/s/${market.id}`
  const [contact, setContact] = useState({ name: "", email: "", phone: "" })
  const [date, setDate] = useState("")
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle")
  const [error, setError] = useState<string | null>(null)

  const today = new Date().toISOString().slice(0, 10)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("submitting")
    setError(null)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            tourSlug: i.tourSlug,
            date,
            travelers: i.travelers,
          })),
          contact,
        }),
      })
      const data = await res.json()
      if (!data.ok) {
        setStatus("error")
        setError(data.error ?? "Something went wrong.")
        return
      }
      clear()
      router.push(`${base}/checkout/confirmed?ref=${encodeURIComponent(data.confirmationCode ?? "")}`)
    } catch {
      setStatus("error")
      setError("Network error. Please try again.")
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <h1 className="font-serif text-2xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Add a tour to get started.</p>
        <Button asChild className="mt-6">
          <Link href="/tours">Browse tours</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <form onSubmit={handleSubmit} className="order-2 lg:order-1">
        <h2 className="font-serif text-xl font-semibold">Trip date</h2>
        <div className="mt-4 grid gap-1.5">
          <Label htmlFor="date">Which day are you in port?</Label>
          <Input
            id="date"
            type="date"
            required
            min={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            We&apos;ll confirm the exact departure time for each tour by email.
          </p>
        </div>

        <h2 className="mt-8 font-serif text-xl font-semibold">Lead guest details</h2>
        <div className="mt-4 grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              required
              value={contact.name}
              onChange={(e) => setContact({ ...contact, name: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={contact.email}
              onChange={(e) => setContact({ ...contact, email: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={contact.phone}
              onChange={(e) => setContact({ ...contact, phone: e.target.value })}
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button type="submit" size="lg" className="mt-6 w-full" disabled={status === "submitting"}>
          <Lock className="size-4" />
          {status === "submitting" ? "Processing..." : `Pay ${formatPrice(subtotalCents)}`}
        </Button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Secure checkout. You won&apos;t be charged until your booking is confirmed.
        </p>
      </form>

      <aside className="order-1 lg:order-2">
        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-serif text-lg font-semibold">Order summary</h2>
          <ul className="mt-4 space-y-4">
            {items.map((item) => (
              <li key={item.tourSlug} className="flex gap-3">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-md">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-medium leading-snug">{item.title}</p>
                  <p className="text-muted-foreground">
                    {item.port} &middot; {item.travelers}{" "}
                    {item.travelers === 1 ? "traveler" : "travelers"}
                  </p>
                </div>
                <span className="text-sm font-medium">
                  {formatPrice(item.priceCents * item.travelers)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-center justify-between border-t pt-4">
            <span className="font-medium">Total</span>
            <span className="font-serif text-xl font-semibold">{formatPrice(subtotalCents)}</span>
          </div>
        </div>
      </aside>
    </div>
  )
}
