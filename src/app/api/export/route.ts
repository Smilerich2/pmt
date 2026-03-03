import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const role = cookieStore.get("auth-role")?.value;
  if (role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [categories, posts, glossaryTerms] = await Promise.all([
    prisma.category.findMany({
      orderBy: { position: "asc" },
    }),
    prisma.post.findMany({
      include: {
        category: { select: { title: true, slug: true } },
      },
      orderBy: { position: "asc" },
    }),
    prisma.glossaryTerm.findMany({
      orderBy: { term: "asc" },
    }),
  ]);

  const exportData = {
    exportedAt: new Date().toISOString(),
    version: 1,
    stats: {
      categories: categories.length,
      posts: posts.length,
      published: posts.filter((p) => p.published).length,
      drafts: posts.filter((p) => !p.published).length,
    },
    categories,
    posts,
    glossaryTerms,
  };

  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="pmt-backup-${date}.json"`,
    },
  });
}
