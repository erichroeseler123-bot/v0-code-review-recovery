"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { formatPrice } from "@/lib/tours"

export function CartDrawer() {
  const { items, isOpen, setOpen, updateTravelers, removeItem, subtotalCents, count } = useCart()
  const router = useRouter()

  function goToCheckout() {
    setOpen(false)
    const marketId = items[0]?.marketId
    router.push(marketId ? `/s/${marketId}/checkout` : "/")
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-foreground/40 transition-opacity ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-background shadow-xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-serif text-xl font-semibold text-foreground">
            Your Tours{count > 0 ? ` (${count})` : ""}
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-secondary"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            <p className="text-foreground">Your cart is empty.</p>
            <p className="text-sm text-muted-foreground">
              Add an experience to start planning.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <ul className="flex flex-col gap-4">
              {items.map((item) => (
                <li key={item.tourSlug} className="flex gap-3">
                  <div className="relative h-20 w-24 flex-shrink-0 overflow-hidden rounded-md">
                    <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium leading-snug text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.port}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.tourSlug)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label={`Remove ${item.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateTravelers(item.tourSlug, item.travelers - 1)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-secondary"
                          aria-label="Remove a traveler"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm tabular-nums text-foreground">
                          {item.travelers}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateTravelers(item.tourSlug, item.travelers + 1)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-secondary"
                          aria-label="Add a traveler"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {formatPrice(item.priceCents * item.travelers)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {items.length > 0 && (
          <div className="border-t border-border px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="font-serif text-lg font-semibold text-foreground">
                {formatPrice(subtotalCents)}
              </span>
            </div>
            <button
              type="button"
              onClick={goToCheckout}
              className="w-full rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Choose dates & check out
            </button>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Final times and availability confirmed at checkout.
            </p>
          </div>
        )}
      </aside>
    </>
  )
}
