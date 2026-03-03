import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const term = await prisma.glossaryTerm.findUnique({ where: { id } });
    if (!term) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(term);
  } catch (e) {
    console.error("GET /api/glossary/[id] error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const role = cookieStore.get("auth-role")?.value;
  if (role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  if (!body.term || !body.definition) {
    return NextResponse.json({ error: "Term und Definition erforderlich" }, { status: 400 });
  }

  const slug = body.term
    .toLowerCase()
    .replace(/[äÄ]/g, "ae")
    .replace(/[öÖ]/g, "oe")
    .replace(/[üÜ]/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  try {
    const term = await prisma.glossaryTerm.update({
      where: { id },
      data: { term: body.term, slug, definition: body.definition },
    });
    return NextResponse.json(term);
  } catch (e) {
    console.error("PUT /api/glossary/[id] error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const role = cookieStore.get("auth-role")?.value;
  if (role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.glossaryTerm.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/glossary/[id] error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
