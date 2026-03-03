import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

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
  const { type, message, page } = body;

  if (!type || !message?.trim()) {
    return NextResponse.json({ error: "Typ und Nachricht sind erforderlich" }, { status: 400 });
  }

  if (!["feedback", "fehler", "wunsch"].includes(type)) {
    return NextResponse.json({ error: "Ungültiger Typ" }, { status: 400 });
  }

  const feedback = await prisma.feedback.create({
    data: {
      type,
      message: message.trim(),
      page: page || null,
    },
  });

  return NextResponse.json(feedback, { status: 201 });
}
