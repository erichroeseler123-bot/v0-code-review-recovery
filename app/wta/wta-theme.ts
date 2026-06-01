import type { CSSProperties } from "react"

/**
 * Welcome to Alaska Tours — scoped "local costume" theme.
 * Cold air / glacier / harbor / outdoor-magazine: glacier-blue primary,
 * golden-hour amber accent, cool paper neutrals. No purple.
 *
 * Applied as inline CSS custom properties on the storefront wrapper so the
 * tokens are scoped to this route only and never leak into the internal
 * DCC / Earth OS surfaces, which keep the default theme.
 */
export const wtaThemeStyle: CSSProperties = {
  "--background": "oklch(0.98 0.006 230)",
  "--foreground": "oklch(0.23 0.025 245)",
  "--card": "oklch(1 0 0)",
  "--card-foreground": "oklch(0.23 0.025 245)",
  "--popover": "oklch(1 0 0)",
  "--popover-foreground": "oklch(0.23 0.025 245)",
  "--primary": "oklch(0.44 0.085 232)",
  "--primary-foreground": "oklch(0.98 0.01 230)",
  "--secondary": "oklch(0.95 0.012 230)",
  "--secondary-foreground": "oklch(0.3 0.03 240)",
  "--muted": "oklch(0.955 0.01 230)",
  "--muted-foreground": "oklch(0.5 0.022 238)",
  "--accent": "oklch(0.76 0.13 66)",
  "--accent-foreground": "oklch(0.27 0.04 60)",
  "--border": "oklch(0.9 0.012 232)",
  "--input": "oklch(0.9 0.012 232)",
  "--ring": "oklch(0.44 0.085 232)",
  "--radius": "0.75rem",
} as CSSProperties
