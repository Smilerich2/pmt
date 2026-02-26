import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH: Swap positions of two items
// Body: { type: "category" | "post", id: string, direction: "up" | "down" }
export async function PATCH(request: NextRequest) {
  const { type, id, direction } = await request.json();

  if (!type || !id || !direction) {
    return NextResponse.json({ error: "type, id, direction nötig" }, { status: 400 });
  }

  if (type === "category") {
    const current = await prisma.category.findUnique({
      where: { id },
      select: { position: true, parentId: true },
    });
    if (!current) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });

    // Find the neighbor to swap with (same parent level)
    const neighbor = await prisma.category.findFirst({
      where: {
        parentId: current.parentId ?? null,
        position: direction === "up"
          ? { lt: current.position }
          : { gt: current.position },
      },
      orderBy: { position: direction === "up" ? "desc" : "asc" },
      select: { id: true, position: true },
    });

    if (!neighbor) {
      return NextResponse.json({ error: "Bereits am Rand" }, { status: 400 });
    }

    // Swap positions
    await prisma.$transaction([
      prisma.category.update({
        where: { id },
        data: { position: neighbor.position },
      }),
      prisma.category.update({
        where: { id: neighbor.id },
        data: { position: current.position },
      }),
    ]);

    return NextResponse.json({ success: true });
  }

  if (type === "post") {
    const current = await prisma.post.findUnique({
      where: { id },
      select: { position: true, categoryId: true },
    });
    if (!current) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });

    // Find neighbor in the same category
    const neighbor = await prisma.post.findFirst({
      where: {
        categoryId: current.categoryId,
        position: direction === "up"
          ? { lt: current.position }
          : { gt: current.position },
      },
      orderBy: { position: direction === "up" ? "desc" : "asc" },
      select: { id: true, position: true },
    });

    if (!neighbor) {
      return NextResponse.json({ error: "Bereits am Rand" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.post.update({
        where: { id },
        data: { position: neighbor.position },
      }),
      prisma.post.update({
        where: { id: neighbor.id },
        data: { position: current.position },
      }),
    ]);

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Ungültiger Typ" }, { status: 400 });
}
