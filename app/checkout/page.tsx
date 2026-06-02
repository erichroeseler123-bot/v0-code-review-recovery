import type { Metadata } from "next"
import { CheckoutForm } from "@/components/checkout-form"

export const metadata: Metadata = {
  title: "Checkout | Welcome to Alaska Tours",
}

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      <h1 className="font-serif text-3xl font-semibold md:text-4xl">Checkout</h1>
      <p className="mt-2 text-muted-foreground">Review your tours and book your spots.</p>
      <div className="mt-8">
        <CheckoutForm />
      </div>
    </div>
  )
}
