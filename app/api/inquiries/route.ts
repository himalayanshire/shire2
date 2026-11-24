import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getClientIp, rateLimit } from "@/lib/shire/rate-limit";

const INQUIRY_TO_EMAIL = "himalayanshire@gmail.com";

const inquirySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  phone: z.string().trim().min(1, "Phone number is required").max(40),
  email: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((value) => value || "")
    .refine((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
      message: "Email address is invalid",
    }),
  checkInDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Check-in date is required"),
  checkOutDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Check-out date is required"),
  adults: z.coerce.number().int().min(1, "At least one adult is required").max(50),
  children: z.coerce.number().int().min(0, "Children cannot be negative").max(50),
}).refine((v) => v.checkOutDate > v.checkInDate, {
  message: "Check-out date must be after check-in date",
  path: ["checkOutDate"],
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const limit = rateLimit({ key: "inquiry", limit: 5, windowMs: 10 * 60_000, ip });
  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many enquiries. Please wait a few minutes or call us directly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let payload: unknown;

  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = inquirySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please complete all required fields.", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const inquiry = parsed.data;
  const message = formatInquiryMessage(inquiry);

  const emailResult = await sendInquiryEmail({
    to: INQUIRY_TO_EMAIL,
    replyTo: inquiry.email || undefined,
    subject: `Website inquiry from ${inquiry.name}`,
    text: message,
  });

  if (!emailResult.sent) {
    return NextResponse.json(
      {
        error: emailResult.reason,
        delivered: false,
      },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: true, delivered: true });
}

function formatInquiryMessage(inquiry: z.infer<typeof inquirySchema>) {
  return [
    "New website inquiry",
    "",
    `Name: ${inquiry.name}`,
    `Phone: ${inquiry.phone}`,
    `Email: ${inquiry.email || "Not provided"}`,
    `Check-in date: ${inquiry.checkInDate}`,
    `Check-out date: ${inquiry.checkOutDate}`,
    `Adults (8 yrs and above): ${inquiry.adults}`,
    `Children (7 yrs and below): ${inquiry.children}`,
  ].join("\n");
}

async function sendInquiryEmail({
  to,
  replyTo,
  subject,
  text,
}: {
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
}): Promise<{ sent: true } | { sent: false; reason: string }> {
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;
  const resendKey = process.env.RESEND_API_KEY;

  if (smtpUser && smtpPassword) {
    return sendViaSmtp({ to, replyTo, subject, text, smtpUser, smtpPassword });
  }

  if (resendKey) {
    return sendViaResend({ to, replyTo, subject, text, resendKey });
  }

  // No mail credentials configured: use FormSubmit (free, no key) so enquiries still arrive.
  return sendViaFormSubmit({ to, replyTo, subject, text });
}

async function sendViaFormSubmit({
  to,
  replyTo,
  subject,
  text,
}: {
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
}): Promise<{ sent: true } | { sent: false; reason: string }> {
  try {
    const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(to)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        _subject: subject,
        _template: "box",
        _captcha: "false",
        ...(replyTo ? { email: replyTo, _replyto: replyTo } : null),
        message: text,
      }),
      signal: AbortSignal.timeout(15_000),
    });
    const data = (await response.json().catch(() => ({}))) as { success?: string | boolean; message?: string };
    if (!response.ok || String(data.success) !== "true") {
      return { sent: false, reason: data.message || "Email delivery failed." };
    }
    return { sent: true };
  } catch {
    return { sent: false, reason: "Email delivery failed." };
  }
}

async function sendViaSmtp({
  to,
  replyTo,
  subject,
  text,
  smtpUser,
  smtpPassword,
}: {
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
  smtpUser: string;
  smtpPassword: string;
}): Promise<{ sent: true } | { sent: false; reason: string }> {
  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: smtpUser, pass: smtpPassword },
  });

  try {
    await transporter.sendMail({
      from: `The Himalayan Shire <${smtpUser}>`,
      to,
      replyTo,
      subject,
      text,
    });
    return { sent: true };
  } catch (error) {
    return {
      sent: false,
      reason:
        error instanceof Error ? `Email delivery failed: ${error.message}` : "Email delivery failed.",
    };
  }
}

async function sendViaResend({
  to,
  replyTo,
  subject,
  text,
  resendKey,
}: {
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
  resendKey: string;
}): Promise<{ sent: true } | { sent: false; reason: string }> {
  const from = process.env.INQUIRY_FROM_EMAIL || "The Himalayan Shire <onboarding@resend.dev>";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        text,
        reply_to: replyTo,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      return {
        sent: false,
        reason: `Email provider rejected the inquiry: ${detail}`,
      };
    }

    return { sent: true };
  } catch (error) {
    return {
      sent: false,
      reason: error instanceof Error ? error.message : "Email delivery failed.",
    };
  }
}
