import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

// Optional overrides so you can change without code edits
const FROM = process.env.RESEND_FROM || "Umang Thakkar <onboarding@resend.dev>"
const TO = process.env.RESEND_TO || "umangthakkar005@gmail.com"

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
