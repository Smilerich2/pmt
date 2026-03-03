import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!post) {
    return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  }

  return NextResponse.json(post);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  // Build data object with only provided fields (supports partial updates)
  const data: Record<string, unknown> = {};
  if ("title" in body) data.title = body.title;
  if ("description" in body) data.description = body.description || null;
  if ("content" in body) data.content = body.content;
  if ("editorType" in body) data.editorType = body.editorType || "MARKDOWN";
  if ("categoryId" in body) data.categoryId = body.categoryId;
  if ("coverImage" in body) data.coverImage = body.coverImage || null;
  if ("type" in body) data.type = body.type || "text";
  if ("duration" in body) data.duration = body.duration || null;
  if ("tags" in body) data.tags = body.tags || null;
  if ("published" in body) data.published = body.published ?? false;

  const post = await prisma.post.update({
    where: { id },
    data,
  });

  return NextResponse.json(post);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
