import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Collect all descendant category IDs recursively
async function getDescendantIds(parentId: string): Promise<string[]> {
  const children = await prisma.category.findMany({
    where: { parentId },
    select: { id: true },
  });
  const ids: string[] = [];
  for (const child of children) {
    ids.push(child.id);
    const deeper = await getDescendantIds(child.id);
    ids.push(...deeper);
  }
  return ids;
}

// GET: Info about what would be deleted (for confirmation dialog)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const category = await prisma.category.findUnique({
    where: { id },
    select: { title: true },
  });
  if (!category) {
    return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  }

  const descendantIds = await getDescendantIds(id);
  const allCategoryIds = [id, ...descendantIds];

  const postCount = await prisma.post.count({
    where: { categoryId: { in: allCategoryIds } },
  });

  const subcategoryCount = descendantIds.length;

  return NextResponse.json({
    title: category.title,
    postCount,
    subcategoryCount,
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const updated = await prisma.category.update({
    where: { id },
    data: {
      title: body.title,
      description: body.description || null,
      image: body.image || null,
      parentId: body.parentId || null,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Collect all descendant IDs
  const descendantIds = await getDescendantIds(id);
  const allCategoryIds = [id, ...descendantIds];

  // Delete all posts in all affected categories
  await prisma.post.deleteMany({
    where: { categoryId: { in: allCategoryIds } },
  });

  // Delete descendants bottom-up (reverse order ensures children before parents)
  for (const descId of descendantIds.reverse()) {
    await prisma.category.delete({ where: { id: descId } });
  }

  // Delete the category itself
  await prisma.category.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
