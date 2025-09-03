"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, MessageCircle, Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { CalendlyModal } from "./calendly-modal"
import { useToast } from "@/hooks/use-toast"

interface FormData {
  firstName: string
  lastName: string
  email: string
  websiteSocial: string
  subject: string
  message: string
  honeypot: string // Hidden field for spam protection
}

export function ContactSection() {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    websiteSocial: "",
    subject: "",
    message: "",
    honeypot: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCalendlyOpen, setIsCalendlyOpen] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check honeypot field for spam
    if (formData.honeypot) {
      return // Silent fail for bots
    }

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    // Validate email format
    if (!validateEmail(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const { error: dbError } = await supabase.from("leads").insert({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        website_social: formData.websiteSocial || null,
        subject: formData.subject || null,
        message: formData.message,
      })

      if (dbError) throw dbError

      const emailResponse = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!emailResponse.ok) {
        throw new Error("Failed to send email")
      }

      toast({
        title: "Message Sent!",
        description: "Thank you for reaching out. I'll get back to you soon.",
      })

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        websiteSocial: "",
        subject: "",
        message: "",
        honeypot: "",
      })
    } catch (error) {
      console.error("Contact form error:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again or contact me directly.",
        variant: "destructive",
      })
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
          <div className="space-y-8">
            <div className="space-y-6">
              <Button
                variant="outline"
                className="flex items-center gap-4 w-full justify-start p-6 h-auto bg-transparent"
                asChild
              >
                <a href="mailto:umangthakkar005@gmail.com">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">Email</h3>
                    <p className="text-muted-foreground">umangthakkar005@gmail.com</p>
                  </div>
                </a>
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

          <div className="bg-card rounded-lg p-6 border">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Honeypot field for spam protection */}
              <input
                type="text"
                name="honeypot"
                value={formData.honeypot}
                onChange={handleInputChange}
                style={{ display: "none" }}
                tabIndex={-1}
                autoComplete="off"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="firstName"
                  placeholder="First name *"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  name="lastName"
                  placeholder="Last name *"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
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
