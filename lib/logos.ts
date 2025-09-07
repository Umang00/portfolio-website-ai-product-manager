export type ClientLogo = {
  name: string
  src: string
  href?: string
  /** keep original brand color (don’t grayscale) */
  keepColor?: boolean
  /** visual tweak without re-exporting assets */
  scale?: number
}

export const CLIENT_LOGOS: ClientLogo[] = [
  { name: "The Economic Times", src: "/logos/economic-times.png", href: "https://economictimes.indiatimes.com" },
  { name: "Decentraland", src: "/logos/decentraland.png", href: "https://decentraland.org" },

  // keep brand color
  { name: "1inch", src: "/logos/1inch.png", href: "https://1inch.io", keepColor: true, scale: 1.06 },

  { name: "Zayn & Myza", src: "/logos/zayn-myza.png", scale: 0.96 },
  { name: "Hunch", src: "/logos/hunch.png" },

  // keep brand color
  {
    name: "Niva Bupa Life Insurance",
    src: "/logos/niva-bupa-life-insurance.png",
    href: "https://www.nivabupa.com/",
    keepColor: true,
    scale: 1.02,
  },

  { name: "PlotX", src: "/logos/plotx.png", href: "https://plotx.io", scale: 1.04 },

  // keep brand color
  {
    name: "Blockchain Council",
    src: "/logos/blockchain-council.png",
    href: "https://www.blockchain-council.org",
    keepColor: true,
  },

  { name: "Prolitus", src: "/logos/prolitus.svg", href: "https://www.prolitus.com", scale: 0.98 },
]
