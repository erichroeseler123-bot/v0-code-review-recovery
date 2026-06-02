"use client"

import { useRouter } from "next/navigation"
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { ALL_MARKETS, type Market } from "@/lib/markets"
import { getToursByMarket } from "@/lib/tours"

/** A branded teardrop pin, colored by the market's accent hue. */
function pinIcon(market: Market) {
  const color = `oklch(0.62 0.17 ${market.accentHue})`
  const live = market.status === "live"
  return L.divIcon({
    className: "earthos-pin",
    html: `
      <span style="
        position:relative;display:flex;align-items:center;justify-content:center;
        width:26px;height:26px;border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        background:${color};
        box-shadow:0 2px 6px rgba(0,0,0,0.35);
        border:2px solid white;
      ">
        <span style="
          width:8px;height:8px;border-radius:50%;background:white;transform:rotate(45deg);
          ${live ? "box-shadow:0 0 0 3px rgba(255,255,255,0.45);" : ""}
        "></span>
      </span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    tooltipAnchor: [0, -24],
  })
}

export default function NetworkMapInner() {
  const router = useRouter()

  return (
    <MapContainer
      center={[46, -108]}
      zoom={3}
      minZoom={2}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%", background: "var(--color-secondary)" }}
      worldCopyJump
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      {ALL_MARKETS.map((market) => {
        const tourCount = getToursByMarket(market.id).length
        return (
          <Marker
            key={market.id}
            position={[market.coords.lat, market.coords.lng]}
            icon={pinIcon(market)}
            eventHandlers={{ click: () => router.push(`/s/${market.id}`) }}
          >
            <Tooltip direction="top" offset={[0, -8]} opacity={1}>
              <div style={{ minWidth: 150 }}>
                <strong style={{ display: "block", fontSize: 13 }}>{market.name}</strong>
                <span style={{ color: "#666", fontSize: 11 }}>{market.region}</span>
                <div style={{ marginTop: 2, fontSize: 11, color: "#444" }}>
                  {tourCount > 0 ? `${tourCount} experiences · click to enter` : "Coming soon"}
                </div>
              </div>
            </Tooltip>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
