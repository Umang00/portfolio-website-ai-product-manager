"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, XCircle } from "lucide-react"
import { CalendlyModal } from "./calendly-modal"
import { toast } from "sonner"
import { AnimatedCard } from "@/components/animations/animated-card"
import { ScrollReveal } from "@/components/animations/scroll-reveal"
import { useSound } from "@/hooks/use-sound"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { EmailButton, WhatsAppButton, CalendarButton } from "@/components/ui/social-buttons"
import { contactContent, getPersona } from "@/lib/content-data"

// Dynamically import Supabase to avoid build issues when not configured
const getSupabaseClient = async () => {
  if (typeof window === 'undefined') return null
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null
  }
  const { createClient } = await import("@/lib/supabase/client")
  return createClient()
}

// ---------- Helpers ----------
interface FormData {
  name: string
  email: string
  websiteSocial: string
  subject: string
  message: string
  honeypot: string
}

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

// Larger, above-the-fold custom banners
function showSuccessToast() {
  toast.custom(
    (t) => (
      <div className="pointer-events-auto w-[min(560px,92vw)] rounded-xl border bg-background p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">Message sent!</p>
            <p className="text-sm text-muted-foreground">
              Thanks for reaching out. I’ll reply to you at the email you provided.
            </p>
          </div>
          <button
            className="text-sm opacity-60 transition hover:opacity-100"
            onClick={() => toast.dismiss(t)}
          >
            Close
          </button>
        </div>
      </div>
    ),
    { position: "top-center", duration: 5000 }
  )
}

function showErrorToast(description: string) {
  toast.custom(
    (t) => (
      <div className="pointer-events-auto w-[min(560px,92vw)] rounded-xl border bg-background p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <XCircle className="h-5 w-5 text-red-500" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">Failed to send</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <button
            className="text-sm opacity-60 transition hover:opacity-100"
            onClick={() => toast.dismiss(t)}
          >
            Close
          </button>
        </div>
      </div>
    ),
    { position: "top-center", duration: 6000 }
  )
}

// ---------- Component ----------
export function ContactSection() {
  const persona = getPersona()
  const content = contactContent[persona]
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    websiteSocial: "",
    subject: "",
    message: "",
    honeypot: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCalendlyOpen, setIsCalendlyOpen] = useState(false)
  const { play } = useSound()
  const shouldReduceMotion = useReducedMotion()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.honeypot) return

    if (!formData.name || !formData.email || !formData.message) {
      if (!shouldReduceMotion) play("error")
      showErrorToast("Please fill in all required fields.")
      return
    }
    if (!isValidEmail(formData.email)) {
      if (!shouldReduceMotion) play("error")
      showErrorToast("Please enter a valid email address.")
      return
    }

    setIsSubmitting(true)

    try {
      // Send email via API (primary functionality)
      const emailRes = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          websiteSocial: formData.websiteSocial,
          subject: formData.subject,
          message: formData.message,
        }),
      })
      if (!emailRes.ok) throw new Error("Email API returned a non-200 response")

      // Optionally insert into Supabase if configured
      try {
        if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          const supabase = await getSupabaseClient()
          if (supabase) {
            await supabase.from("leads").insert({
              name: formData.name,
              email: formData.email,
              website_social: formData.websiteSocial || null,
              subject: formData.subject || null,
              message: formData.message,
            })
          }
        }
      } catch (dbError) {
        console.warn("Failed to save to database (non-critical):", dbError)
      }

      if (!shouldReduceMotion) play("success")
      showSuccessToast()

      // Reset form
      setFormData({
        name: "",
        email: "",
        websiteSocial: "",
        subject: "",
        message: "",
        honeypot: "",
      })
    } catch (err) {
      console.error("Contact form error:", err)
      if (!shouldReduceMotion) play("error")
      showErrorToast("Please try again or email me directly at umangthakkar005@gmail.com.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contact" className="py-20 px-4 bg-muted/50 dark:bg-muted/20">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal variant="fadeInUp" delay={0.2}>
          <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{content.header}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {content.subheader}
          </p>
        </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: quick actions */}
          <div className="space-y-6">
              {/* Email */}
              <AnimatedCard variant="all" className="w-full">
                <button
                onClick={() => {
                  if (!shouldReduceMotion) play("click")
                  const subject = encodeURIComponent("Hello from your portfolio")
                  const body = encodeURIComponent("Hi Umang,\n\nI'd like to discuss...")
                  window.location.href = `mailto:umangthakkar005@gmail.com?subject=${subject}&body=${body}`
                }}
                  className="flex items-center gap-4 w-full justify-start p-6 h-auto bg-transparent border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  <EmailButton />
                <div className="text-left">
                  <h3 className="font-semibold">Email</h3>
                  <p className="text-muted-foreground">Hit me an email</p>
                </div>
                </button>
              </AnimatedCard>

              {/* WhatsApp */}
              <AnimatedCard variant="all" className="w-full">
                <a
                  href="https://wa.me/919426154668"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    if (!shouldReduceMotion) play("click")
                  }}
                  className="flex items-center gap-4 w-full justify-start p-6 h-auto bg-transparent border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  <WhatsAppButton />
                  <div className="text-left">
                    <h3 className="font-semibold">WhatsApp</h3>
                    <p className="text-muted-foreground">Let's chat directly</p>
                  </div>
                </a>
              </AnimatedCard>

              {/* Calendly */}
              <AnimatedCard variant="all" className="w-full">
                <button
                onClick={() => {
                  if (!shouldReduceMotion) play("click")
                  setIsCalendlyOpen(true)
                }}
                  className="flex items-center gap-4 w-full justify-start p-6 h-auto bg-transparent border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  <CalendarButton onClick={() => setIsCalendlyOpen(true)} />
                <div className="text-left">
                  <h3 className="font-semibold">Book a Call</h3>
                  <p className="text-muted-foreground">{contactContent[getPersona()].calendlyCta}</p>
                </div>
                </button>
              </AnimatedCard>
          </div>

          {/* Right: form */}
          <AnimatedCard variant="all" className="bg-card rounded-lg p-6 border h-fit">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Honeypot */}
              <input
                type="text"
                name="honeypot"
                value={formData.honeypot}
                onChange={handleInputChange}
                style={{ display: "none" }}
                tabIndex={-1}
                autoComplete="off"
              />

              <Input
                name="name"
                placeholder="Name *"
                value={formData.name}
                onChange={handleInputChange}
                required
              />

              <Input
                name="email"
                placeholder="Email address *"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />

              <Input
                name="websiteSocial"
                placeholder="Website/Social (optional)"
                value={formData.websiteSocial}
                onChange={handleInputChange}
              />

              <Input
                name="subject"
                placeholder="Subject (optional)"
                value={formData.subject}
                onChange={handleInputChange}
              />

              <Textarea
                name="message"
                placeholder="Your message *"
                rows={4}
                value={formData.message}
                onChange={handleInputChange}
                required
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
                animationVariant="pulse"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </AnimatedCard>
        </div>
      </div>

      <CalendlyModal isOpen={isCalendlyOpen} onClose={() => setIsCalendlyOpen(false)} />
    </section>
  )
}
