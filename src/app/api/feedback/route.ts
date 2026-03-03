import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// In-memory rate limiting: IP -> timestamps
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(ip) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW
  );
  rateLimitMap.set(ip, timestamps);
  return timestamps.length >= RATE_LIMIT_MAX;
}

function recordSubmission(ip: string) {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(ip) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW
  );
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  const cookieStore = await cookies();
  const role = cookieStore.get("auth-role")?.value;
  if (role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const items = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  // Check if feedback is enabled
  const setting = await prisma.setting.findUnique({
    where: { key: "feedback_enabled" },
  });
  if (setting?.value === "false") {
    return NextResponse.json({ error: "Feedback ist deaktiviert" }, { status: 403 });
  }

  const body = await request.json();
  const { type, name, email, message, page, website } = body;

  // Honeypot: if filled, pretend success but don't save
  if (website) {
    return NextResponse.json({ id: "ok" }, { status: 201 });
  }

  // Rate limiting by IP
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Zu viele Anfragen. Bitte warte etwas." },
      { status: 429 }
    );
  }

  // Validate required fields
  if (!type || !name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json(
      { error: "Name, E-Mail, Typ und Nachricht sind erforderlich" },
      { status: 400 }
    );
  }

  if (!["feedback", "fehler", "wunsch", "glossar"].includes(type)) {
    return NextResponse.json({ error: "Ungültiger Typ" }, { status: 400 });
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    return NextResponse.json({ error: "Ungültige E-Mail-Adresse" }, { status: 400 });
  }

  if (message.trim().length < 10) {
    return NextResponse.json(
      { error: "Nachricht muss mindestens 10 Zeichen lang sein" },
      { status: 400 }
    );
  }

  recordSubmission(ip);

  const feedback = await prisma.feedback.create({
    data: {
      type,
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      page: page || null,
    },
  });

  return NextResponse.json(feedback, { status: 201 });
}
