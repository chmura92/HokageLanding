import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  console.log("[contact] POST received");
  try {
    const { name, email, message } = await req.json();
    console.log("[contact] body parsed, name:", name, "email:", email);

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT) || 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpFrom = process.env.SMTP_FROM;
    console.log("[contact] SMTP config — host:", smtpHost, "port:", smtpPort, "user:", smtpUser, "from:", smtpFrom, "pass set:", !!process.env.SMTP_PASS);

    if (!smtpHost || !smtpUser || !process.env.SMTP_PASS) {
      console.error("[contact] SMTP env vars missing");
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 503 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
      auth: {
        user: smtpUser,
        pass: process.env.SMTP_PASS,
      },
    });

    console.log("[contact] verifying SMTP connection...");
    await transporter.verify();
    console.log("[contact] SMTP verified, sending mail...");

    await transporter.sendMail({
      from: `"hokage.pl Contact" <${smtpFrom}>`,
      to: "romduz@gmail.com",
      replyTo: email,
      subject: `[hokage.pl] Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    });

    console.log("[contact] mail sent successfully");
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[contact] error:", message);
    return NextResponse.json(
      { error: "Failed to send message", detail: message },
      { status: 500 }
    );
  }
}
