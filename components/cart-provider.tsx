"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"

export interface CartItem {
  tourSlug: string
  /** Which storefront/market this item belongs to */
  marketId: string
  title: string
  image: string
  /** Display label for the location (port / town / pickup) */
  port: string
  priceCents: number
  travelers: number
  /** Selected provider availability/time. Required for FareHarbor checkout. */
  availabilityId?: string
  selectedDate?: string
  startsAt?: string
  dateLabel?: string
}

interface CartContextValue {
  items: CartItem[]
  count: number
  subtotalCents: number
  addItem: (item: CartItem) => void
  updateTravelers: (slug: string, travelers: number) => void
  removeItem: (slug: string) => void
  clear: () => void
  isOpen: boolean
  setOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextValue | null>(null)
const STORAGE_KEY = "wta-cart-v1"

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch {
      // ignore
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // ignore
    }
  }, [items, hydrated])

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) =>
        i.tourSlug === item.tourSlug &&
        i.availabilityId === item.availabilityId &&
        i.selectedDate === item.selectedDate
      )
      if (existing) {
        return prev.map((i) =>
          i.tourSlug === item.tourSlug
            ? { ...i, travelers: i.travelers + item.travelers }
            : i,
        )
      }
      return [...prev, item]
    })
    setOpen(true)
  }, [])

  const updateTravelers = useCallback((slug: string, travelers: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.tourSlug === slug ? { ...i, travelers: Math.max(1, travelers) } : i,
      ),
    )
  }, [])

  const removeItem = useCallback((slug: string) => {
    setItems((prev) => prev.filter((i) => i.tourSlug !== slug))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const count = items.reduce((n, i) => n + i.travelers, 0)
  const subtotalCents = items.reduce((n, i) => n + i.priceCents * i.travelers, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        subtotalCents,
        addItem,
        updateTravelers,
        removeItem,
        clear,
        isOpen,
        setOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
