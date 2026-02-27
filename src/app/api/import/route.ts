import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  // Auth check
  const cookieStore = await cookies();
  const role = cookieStore.get("auth-role")?.value;
  if (role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let data: {
    version?: number;
    categories?: { id: string; title: string; slug: string; description?: string | null; image?: string | null; parentId?: string | null; position?: number }[];
    posts?: { id: string; title: string; slug: string; content?: string | null; published?: boolean; editorType?: string; categoryId: string; position?: number; createdAt?: string; updatedAt?: string }[];
  };

  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültige JSON-Datei" }, { status: 400 });
  }

  if (!Array.isArray(data.categories) || !Array.isArray(data.posts)) {
    return NextResponse.json({ error: "Ungültiges Backup-Format" }, { status: 400 });
  }

  // Sort categories: parents before children
  function sortByHierarchy(cats: typeof data.categories) {
    if (!cats) return [];
    const result: typeof cats = [];
    const inserted = new Set<string>();

    // Root categories first
    for (const cat of cats) {
      if (!cat.parentId) {
        result.push(cat);
        inserted.add(cat.id);
      }
    }

    // Children level by level (max 10 levels deep)
    for (let i = 0; i < 10 && result.length < cats.length; i++) {
      for (const cat of cats) {
        if (!inserted.has(cat.id) && cat.parentId && inserted.has(cat.parentId)) {
          result.push(cat);
          inserted.add(cat.id);
        }
      }
    }

    // Any remaining (orphaned) categories
    for (const cat of cats) {
      if (!inserted.has(cat.id)) {
        result.push({ ...cat, parentId: null });
      }
    }

    return result;
  }

  try {
    // Clear existing data (posts first due to FK)
    await prisma.post.deleteMany();
    await prisma.category.deleteMany();

    // Import categories (parents before children)
    const sortedCategories = sortByHierarchy(data.categories);
    for (const cat of sortedCategories) {
      await prisma.category.create({
        data: {
          id: cat.id,
          title: cat.title,
          slug: cat.slug,
          description: cat.description ?? null,
          image: cat.image ?? null,
          parentId: cat.parentId ?? null,
          position: cat.position ?? 0,
        },
      });
    }

    // Import posts
    for (const post of data.posts) {
      await prisma.post.create({
        data: {
          id: post.id,
          title: post.title,
          slug: post.slug,
          content: post.content ?? "",
          published: post.published ?? false,
          editorType: (post.editorType as "MARKDOWN") ?? "MARKDOWN",
          categoryId: post.categoryId,
          position: post.position ?? 0,
          createdAt: post.createdAt ? new Date(post.createdAt) : undefined,
          updatedAt: post.updatedAt ? new Date(post.updatedAt) : undefined,
        },
      });
    }

    return NextResponse.json({
      success: true,
      imported: {
        categories: sortedCategories.length,
        posts: data.posts.length,
      },
    });
  } catch (err) {
    console.error("Import error:", err);
    return NextResponse.json({ error: "Import fehlgeschlagen", detail: String(err) }, { status: 500 });
  }
}
