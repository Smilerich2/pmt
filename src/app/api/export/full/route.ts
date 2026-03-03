import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import archiver from "archiver";
import path from "path";
import { existsSync } from "fs";
import { Readable } from "stream";

export async function GET() {
  const cookieStore = await cookies();
  const role = cookieStore.get("auth-role")?.value;
  if (role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [categories, posts, glossaryTerms] = await Promise.all([
    prisma.category.findMany({ orderBy: { position: "asc" } }),
    prisma.post.findMany({
      include: { category: { select: { title: true, slug: true } } },
      orderBy: { position: "asc" },
    }),
    prisma.glossaryTerm.findMany({ orderBy: { term: "asc" } }),
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

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  const date = new Date().toISOString().slice(0, 10);

  // Bridge archiver (Node.js stream) → Web ReadableStream
  const webStream = new ReadableStream({
    start(controller) {
      const archive = archiver("zip", { zlib: { level: 6 } });

      archive.on("data", (chunk: Buffer) => controller.enqueue(chunk));
      archive.on("end", () => controller.close());
      archive.on("error", (err: Error) => controller.error(err));

      // Add backup.json
      archive.append(JSON.stringify(exportData, null, 2), {
        name: "backup.json",
      });

      // Add uploads folder (if it exists and has files)
      if (existsSync(uploadsDir)) {
        archive.directory(uploadsDir, "uploads");
      }

      archive.finalize();
    },
  });

  return new Response(webStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="pmt-vollbackup-${date}.zip"`,
    },
  });
}
