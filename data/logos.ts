export type ClientLogo = {
  name: string
  src: string
  href?: string
}

export const CLIENT_LOGOS: ClientLogo[] = [
  { name: "The Economic Times", src: "/logos/the-economic-times.png", href: "https://economictimes.indiatimes.com" },
    { name: "Zayn & Myza", src: "/logos/zayn-myza.png" },
  { name: "Hunch", src: "/logos/hunch.png" },
  {
    name: "Niva Bupa Life Insurance", src: "/logos/niva-bupa-life-insurance.png", href: "https://www.nivabupa.com/",
  },
  { name: "PlotX", src: "/logos/plotx.png", href: "https://plotx.io" },
  { name: "Clinique", src: "/logos/clinique.png", href: "https://www.clinique.com" },
  { name: "Blockchain Council", src: "/logos/blockchain-council.png", href: "https://www.blockchain-council.org" },
  { name: "Prolitus", src: "/logos/prolitus.svg", href: "https://www.prolitus.com" },
]
