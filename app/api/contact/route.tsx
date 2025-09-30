import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

// Optional overrides so you can change without code edits
const FROM = process.env.RESEND_FROM || "Umang Thakkar <onboarding@resend.dev>"
const TO = process.env.RESEND_TO || "umangthakkar005@gmail.com"

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.warn("[contact] RESEND_API_KEY is not configured. Skipping email delivery.")
    return null
  }

  return new Resend(apiKey)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, websiteSocial, subject, message } = body as {
      name: string; email: string; websiteSocial?: string; subject?: string; message: string
    }

    const html = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      ${websiteSocial ? `<p><strong>Website/Social:</strong> ${websiteSocial}</p>` : ""}
      ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ""}
      <p><strong>Message:</strong></p>
      <p>${(message || "").replace(/\n/g, "<br>")}</p>
    `

    const resend = getResendClient()

    if (!resend) {
      return NextResponse.json(
        {
          error: "Email delivery is not configured",
          details: "Set the RESEND_API_KEY environment variable to enable contact form emails.",
        },
        { status: 503 },
      )
    }

    const { error } = await resend.emails.send({
      from: FROM,
      to: TO,
      reply_to: email,
      subject: subject || `New contact form submission from ${name}`,
      html,
    })

    if (error) {
      console.error("Resend error:", error)
      return NextResponse.json({ error: "Email failed", details: String(error) }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Contact API error:", err)
    return NextResponse.json({ error: "Failed to send message", details: String(err) }, { status: 500 })
  }
}
