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

  const fields = inquiryFields(parsed.data);

  const emailResult = await sendInquiryEmail({
    to: INQUIRY_TO_EMAIL,
    replyTo: parsed.data.email || undefined,
    subject: `Website inquiry from ${parsed.data.name}`,
    text: formatInquiryMessage(fields),
    fields,
  });

  if (!emailResult.sent) {
    console.error(`[inquiry] not delivered: ${emailResult.reason}`);
    return NextResponse.json(
      {
        error: "Inquiry could not be sent. Please call or WhatsApp us.",
        delivered: false,
      },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: true, delivered: true });
}

/** Every value from the form, labelled. All email routes are built from this. */
function inquiryFields(inquiry: z.infer<typeof inquirySchema>): Record<string, string> {
  return {
    Name: inquiry.name,
    Phone: inquiry.phone,
    Email: inquiry.email || "Not provided",
    "Check-in date": inquiry.checkInDate,
    "Check-out date": inquiry.checkOutDate,
    "Adults (8 yrs and above)": String(inquiry.adults),
    "Children (7 yrs and below)": String(inquiry.children),
  };
}

function formatInquiryMessage(fields: Record<string, string>) {
  return ["New website inquiry", "", ...Object.entries(fields).map(([k, v]) => `${k}: ${v}`)].join("\n");
}

type SendResult = { sent: true } | { sent: false; reason: string };

/** Tries the configured mail route first, then the free one, so no enquiry is lost. */
async function sendInquiryEmail({
  to,
  replyTo,
  subject,
  text,
  fields,
}: {
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
  fields: Record<string, string>;
}): Promise<SendResult> {
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;
  const resendKey = process.env.RESEND_API_KEY;

  if (smtpUser && smtpPassword) {
    const result = await sendViaSmtp({ to, replyTo, subject, text, smtpUser, smtpPassword });
    if (result.sent) return result;
    console.error(`[inquiry] SMTP failed: ${result.reason}`);
  } else if (resendKey) {
    const result = await sendViaResend({ to, replyTo, subject, text, resendKey });
    if (result.sent) return result;
    console.error(`[inquiry] Resend failed: ${result.reason}`);
  }

  return sendViaFormSubmit({ to, replyTo, subject, fields });
}

/** FormSubmit: free, no key. The inbox owner confirms it once by email. */
async function sendViaFormSubmit({
  to,
  replyTo,
  subject,
  fields,
}: {
  to: string;
  replyTo?: string;
  subject: string;
  fields: Record<string, string>;
}): Promise<SendResult> {
  try {
    const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(to)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        // FormSubmit requires requests to name the website they come from.
        Origin: "https://www.thehimalayanshire.com",
        Referer: "https://www.thehimalayanshire.com/contact",
      },
      body: JSON.stringify({
        ...fields,
        _subject: subject,
        _template: "table",
        _captcha: "false",
        ...(replyTo ? { _replyto: replyTo } : null),
      }),
      signal: AbortSignal.timeout(15_000),
    });
    const data = (await response.json().catch(() => ({}))) as { success?: string | boolean; message?: string };
    if (!response.ok || String(data.success) !== "true") {
      return { sent: false, reason: data.message || `FormSubmit HTTP ${response.status}` };
    }
    return { sent: true };
  } catch {
    return { sent: false, reason: "FormSubmit unreachable" };
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
