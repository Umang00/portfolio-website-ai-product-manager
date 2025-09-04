"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, MessageCircle, Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { CalendlyModal } from "./calendly-modal"
import { toast } from "sonner"

interface FormData {
  name: string            
  email: string
  websiteSocial: string
  subject: string
  message: string
  honeypot: string
}

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

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.honeypot) return

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields.", { id: "contact-missing" })
      return
    }
    if (!validateEmail(formData.email)) {
      toast.error("Please enter a valid email address.", { id: "contact-email" })
      return
    }

    setIsSubmitting(true)
    const toastId = "contact-submit" // prevents duplicate toasts in Strict Mode

    try {
      const supabase = createClient()
      const { error: dbError } = await supabase.from("leads").insert({
        name: formData.name,
        email: formData.email,
        website_social: formData.websiteSocial || null,
        subject: formData.subject || null,
        message: formData.message,
      })
      if (dbError) throw dbError

      const emailRes = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.name, // your API expects firstName
          lastName: "",             // keep empty
          email: formData.email,
          websiteSocial: formData.websiteSocial,
          subject: formData.subject,
          message: formData.message,
        }),
      })
      if (!emailRes.ok) throw new Error("Failed to send email")

      toast.success("Message sent! I’ll get back to you soon.", { id: toastId })

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
      toast.error("Failed to send message. Please try again or email me directly.", { id: "contact-fail" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const openMailClient = (e: React.MouseEvent) => {
    e.preventDefault()
    window.location.href = "mailto:umangthakkar005@gmail.com"
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
                  const subject = encodeURIComponent("Hello from your portfolio");
                  const body = encodeURIComponent("Hi Umang,\n\nI'd like to discuss...");
                  window.location.href = `mailto:umangthakkar005@gmail.com?subject=${subject}&body=${body}`;
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

              <Button
                variant="outline"
                className="flex items-center gap-4 w-full justify-start p-6 h-auto bg-transparent"
                asChild
              >
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
