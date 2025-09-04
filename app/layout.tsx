import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { Suspense } from "react"
import "./globals.css"
import { Toaster } from "sonner"

export const metadata: Metadata = {
  title: "Umang Thakkar - AI Product Manager",
  description:
    "AI Product Manager focused on data-driven growth and user delight. 6+ years shipping products that scale.",
  generator: "v0.app",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://assets.calendly.com" crossOrigin="" />
        <link rel="preconnect" href="https://calendly.com" crossOrigin="" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <ThemeProvider>{children}</ThemeProvider>
          <Analytics />
        </Suspense>

        {/* Sonner toaster mounted once at app root */}
        <Toaster
          position="bottom-center"
          richColors
          closeButton
          toastOptions={{ duration: 3000 }}
        />
      </body>
    </html>
  )
}
