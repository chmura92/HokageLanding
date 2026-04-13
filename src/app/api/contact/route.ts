import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const apiKey = process.env.SENDGRID_API_KEY;
    const fromAddress = process.env.SMTP_FROM ?? "noreply@hokage.pl";

    if (!apiKey) {
      console.error("[contact] SENDGRID_API_KEY is not set");
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 503 }
      );
    }

    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: "romduz@gmail.com" }] }],
        from: { email: fromAddress, name: "hokage.pl Contact" },
        reply_to: { email, name },
        subject: `[hokage.pl] Message from ${name}`,
        content: [
          {
            type: "text/plain",
            value: `Name: ${name}\nEmail: ${email}\n\n${message}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("[contact] SendGrid error:", res.status, body);
      return NextResponse.json(
        { error: "Failed to send message", detail: body },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[contact] unexpected error:", msg);
    return NextResponse.json(
      { error: "Failed to send message", detail: msg },
      { status: 500 }
    );
  }
}
