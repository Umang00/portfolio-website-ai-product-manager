export type ClientLogo = {
  name: string
  src: string
  href?: string
  /** Logos with brand colors (reveal color on hover only). */
  keepColor?: boolean
  /** Optional per-logo scale adjust (1 = 100%). */
  scale?: number
}

export const CLIENT_LOGOS: ClientLogo[] = [
  { name: "The Economic Times", src: "/logos/economic-times.png", href: "https://economictimes.indiatimes.com" },

  // Brand-color logos — mono by default, color on hover (only that item)
  { name: "1inch", src: "/logos/1inch.png", href: "https://1inch.io", keepColor: true },
  { name: "Niva Bupa Life Insurance", src: "/logos/niva-bupa-life-insurance.png", href: "https://www.nivabupa.com/", keepColor: true },
  { name: "Blockchain Council", src: "/logos/blockchain-council.png", href: "https://www.blockchain-council.org", keepColor: true },

  // Mono logos
  { name: "Decentraland", src: "/logos/decentraland.png", href: "https://decentraland.org", scale: 6 },
  { name: "Zayn & Myza", src: "/logos/zayn-myza.png" },
  { name: "Hunch", src: "/logos/hunch.png", scale: 6 },
  { name: "PlotX", src: "/logos/plotx.png", href: "https://plotx.io" },
  { name: "Prolitus", src: "/logos/prolitus.svg", href: "https://www.prolitus.com" },

  // If any logo feels small/large, nudge with scale:
  // { name: "Example", src: "/logos/example.png", scale: 1.06 },
]
