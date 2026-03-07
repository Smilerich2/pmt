import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const posts = await prisma.post.findMany({
    include: { category: true },
    orderBy: { position: "asc" },
  });
  return NextResponse.json(posts);
}

// PATCH: Bulk-move posts to another category
export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { postIds, targetCategoryId } = body;

  if (!postIds?.length || !targetCategoryId) {
    return NextResponse.json({ error: "postIds und targetCategoryId nötig" }, { status: 400 });
  }

  // Get next position in target category
  const maxPos = await prisma.post.aggregate({
    where: { categoryId: targetCategoryId },
    _max: { position: true },
  });
  let nextPos = (maxPos._max.position ?? -1) + 1;

  for (const postId of postIds) {
    await prisma.post.update({
      where: { id: postId },
      data: { categoryId: targetCategoryId, position: nextPos++ },
    });
  }

  return NextResponse.json({ success: true, moved: postIds.length });
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
  const maxPos = await prisma.post.aggregate({
    where: { categoryId: body.categoryId },
    _max: { position: true },
  });
  const nextPosition = (maxPos._max.position ?? -1) + 1;

  const post = await prisma.post.create({
    data: {
      title: body.title,
      slug,
      description: body.description || null,
      content: body.content,
      editorType: body.editorType || "MARKDOWN",
      categoryId: body.categoryId,
      coverImage: body.coverImage || null,
      coverImagePos: body.coverImagePos || null,
      type: body.type || "text",
      duration: body.duration || null,
      tags: body.tags || null,
      published: body.published ?? false,
      position: nextPosition,
    },
  });

  return NextResponse.json(post, { status: 201 });
}
