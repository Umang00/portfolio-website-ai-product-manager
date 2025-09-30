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
      console.warn(
        "[contact] RESEND_API_KEY is not configured. Returning success so the UI can fall back to direct email instructions.",
      )
      return NextResponse.json({
        success: true,
        skippedEmail: true,
        message: "Email delivery is not configured. Set RESEND_API_KEY to enable automated replies.",
      })
    }

    try {
      const { error } = await resend.emails.send({
        from: FROM,
        to: TO,
        reply_to: email,
        subject: subject || `New contact form submission from ${name}`,
        html,
      })

      if (error) {
        console.error("[contact] Resend reported an error:", error)
        return NextResponse.json({
          success: true,
          skippedEmail: true,
          message:
            "We couldn't send an automated confirmation just now. Please email umangthakkar005@gmail.com so I don't miss your message.",
        })
      }

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error("[contact] Unexpected error when sending email:", error)
      return NextResponse.json({
        success: true,
        skippedEmail: true,
        message:
          "We hit an unexpected issue while sending the automated email. Please email umangthakkar005@gmail.com directly so I can get back to you.",
      })
    }
  } catch (err) {
    console.error("Contact API error:", err)
    return NextResponse.json({
      success: true,
      skippedEmail: true,
      message:
        "We couldn't confirm delivery automatically, but your message was received. Please follow up at umangthakkar005@gmail.com if needed.",
    })
  }
}
