import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const posts = await prisma.post.findMany({
    where: {
      published: true,
      OR: [
        { title: { contains: q } },
        { description: { contains: q } },
      ],
    },
    select: {
      id: true,
      title: true,
      slug: true,
      type: true,
      description: true,
      category: { select: { title: true, slug: true } },
    },
    take: 8,
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(posts);
}
