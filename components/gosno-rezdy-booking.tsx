"use client"

import Script from "next/script"
import { useState } from "react"
import { Car, Users } from "lucide-react"

type GoSnoRezdyVehicle = {
  id: "suburban" | "van"
  name: string
  description: string
  icon: typeof Car
  rezdyUrl: string
}

const GOSNO_REZDY_VEHICLES: GoSnoRezdyVehicle[] = [
  {
    id: "suburban",
    name: "Suburban",
    description: "Private SUV for smaller groups with luggage and ski gear.",
    icon: Car,
    rezdyUrl: "https://gosnotransportation58.rezdy.com/596193/suburban?iframe=true",
  },
  {
    id: "van",
    name: "10 Passenger Van",
    description: "Private van option for larger groups traveling together.",
    icon: Users,
    rezdyUrl: "https://gosnotransportation58.rezdy.com/630812/van-10-passenger?iframe=true",
  },
]

export function GoSnoRezdyBooking() {
  const [selectedVehicleId, setSelectedVehicleId] = useState<GoSnoRezdyVehicle["id"]>("suburban")
  const selectedVehicle =
    GOSNO_REZDY_VEHICLES.find((vehicle) => vehicle.id === selectedVehicleId) ?? GOSNO_REZDY_VEHICLES[0]

  return (
    <div className="grid gap-5">
      <Script src="https://gosnotransportation58.rezdy.com/pluginJs" strategy="afterInteractive" />

      <div>
        <h3 className="font-serif text-2xl font-semibold text-foreground">Book this transfer online</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Choose your vehicle, date, and pickup time in Rezdy. Confirmation is handled by Rezdy.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label="Choose a GoSno vehicle">
        {GOSNO_REZDY_VEHICLES.map((vehicle) => {
          const Icon = vehicle.icon
          const selected = vehicle.id === selectedVehicle.id

          return (
            <button
              key={vehicle.id}
              type="button"
              onClick={() => setSelectedVehicleId(vehicle.id)}
              className={`rounded-md border p-4 text-left transition-colors ${
                selected
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-background text-foreground hover:bg-secondary"
              }`}
              aria-pressed={selected}
            >
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Icon className="h-4 w-4" />
                {vehicle.name}
              </span>
              <span className="mt-2 block text-xs leading-relaxed text-muted-foreground">
                {vehicle.description}
              </span>
            </button>
          )
        })}
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-background">
        <iframe
          title={`GoSno ${selectedVehicle.name} Rezdy booking widget`}
          seamless
          width="100%"
          height="1000"
          frameBorder="0"
          className="rezdy block min-h-[1000px] w-full max-w-full border-0"
          src={selectedVehicle.rezdyUrl}
        />
      </div>
    </div>
  )
}
