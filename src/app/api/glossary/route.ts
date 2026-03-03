import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const terms = await prisma.glossaryTerm.findMany({
      orderBy: { term: "asc" },
    });
    return NextResponse.json(terms);
  } catch (e) {
    console.error("GET /api/glossary error:", e);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
    // Append suffix if slug already exists
    let finalSlug = slug;
    const existing = await prisma.glossaryTerm.findUnique({ where: { slug } });
    if (existing) {
      finalSlug = `${slug}-${Date.now()}`;
    }

    const term = await prisma.glossaryTerm.create({
      data: {
        term: body.term,
        slug: finalSlug,
        definition: body.definition,
      },
    });

    return NextResponse.json(term, { status: 201 });
  } catch (e) {
    console.error("POST /api/glossary error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
