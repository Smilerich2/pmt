import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        parent: true,
        _count: { select: { posts: true, children: true } },
      },
      orderBy: { position: "asc" },
    });
    return NextResponse.json(categories);
  } catch (e) {
    console.error("GET /api/categories error:", e);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const slug = body.slug || body.title
    .toLowerCase()
    .replace(/[äÄ]/g, "ae")
    .replace(/[öÖ]/g, "oe")
    .replace(/[üÜ]/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  // Auto-assign next position
  const maxPos = await prisma.category.aggregate({
    where: { parentId: body.parentId || null },
    _max: { position: true },
  });
  const nextPosition = (maxPos._max.position ?? -1) + 1;

  const category = await prisma.category.create({
    data: {
      title: body.title,
      slug,
      description: body.description || null,
      image: body.image || null,
      parentId: body.parentId || null,
      position: nextPosition,
    },
  });

  return NextResponse.json(category, { status: 201 });
}
