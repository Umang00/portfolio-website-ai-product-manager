"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, MessageCircle, Calendar, CheckCircle2, XCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { CalendlyModal } from "./calendly-modal"
import { toast } from "sonner"

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

const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
)

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.honeypot) return

    if (!formData.name || !formData.email || !formData.message) {
      showErrorToast("Please fill in all required fields.")
      return
    }
    if (!isValidEmail(formData.email)) {
      showErrorToast("Please enter a valid email address.")
      return
    }

    setIsSubmitting(true)

    try {
      // Insert into Supabase
      if (isSupabaseConfigured) {
        const supabase = createClient()
        const { error: dbError } = await supabase.from("leads").insert({
          name: formData.name,
          email: formData.email,
          website_social: formData.websiteSocial || null,
          subject: formData.subject || null,
          message: formData.message,
        })
        if (dbError) throw dbError
      } else {
        console.warn("[contact] Supabase environment variables are missing. Skipping lead capture.")
      }

      // Send email via API
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
      const emailPayload = await emailRes.json().catch(() => null)
      if (!emailRes.ok) {
        const errorMessage =
          (emailPayload && (emailPayload.details || emailPayload.error)) ||
          "Email API returned a non-200 response"
        throw new Error(errorMessage)
      }

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
      showErrorToast("Please try again or email me directly at umangthakkar005@gmail.com.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contact" className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Let's Connect</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ready to discuss your next product idea or explore collaboration opportunities? I'd love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Left: quick actions */}
          <div className="space-y-8">
            <div className="space-y-6">
              {/* Email */}
              <Button
                variant="outline"
                className="flex items-center gap-4 w-full justify-start p-6 h-auto bg-transparent"
                onClick={() => {
                  const subject = encodeURIComponent("Hello from your portfolio")
                  const body = encodeURIComponent("Hi Umang,\n\nI'd like to discuss...")
                  window.location.href = `mailto:umangthakkar005@gmail.com?subject=${subject}&body=${body}`
                }}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Email</h3>
                  <p className="text-muted-foreground">umangthakkar005@gmail.com</p>
                </div>
              </Button>

              {/* WhatsApp */}
              <Button variant="outline" className="flex items-center gap-4 w-full justify-start p-6 h-auto bg-transparent" asChild>
                <a href="https://wa.me/919426154668" target="_blank" rel="noopener noreferrer">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">WhatsApp</h3>
                    <p className="text-muted-foreground">Let's chat directly</p>
                  </div>
                </a>
              </Button>

              {/* Calendly */}
              <Button
                variant="outline"
                className="flex items-center gap-4 w-full justify-start p-6 h-auto bg-transparent"
                onClick={() => setIsCalendlyOpen(true)}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Book a Call</h3>
                  <p className="text-muted-foreground">Schedule a 30-minute product strategy session</p>
                </div>
              </Button>
            </div>
          </div>

          {/* Right: form */}
          <div className="bg-card rounded-lg p-6 border">
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

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>
        </div>
      </div>

      <CalendlyModal isOpen={isCalendlyOpen} onClose={() => setIsCalendlyOpen(false)} />
    </section>
  )
}
