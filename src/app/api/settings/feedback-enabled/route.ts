import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const setting = await prisma.setting.findUnique({
    where: { key: "feedback_enabled" },
  });
  const enabled = setting?.value !== "false";
  return NextResponse.json({ enabled });
}
