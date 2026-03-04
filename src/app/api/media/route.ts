import { NextRequest, NextResponse } from "next/server";
import { readdir, stat, unlink, rename } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const uploadDir = path.join(process.cwd(), "public", "uploads");

  try {
    const files = await readdir(uploadDir);

    // Fetch all posts and categories to check usage
    const posts = await prisma.post.findMany({
      select: { id: true, title: true, content: true, coverImage: true },
    });
    const categories = await prisma.category.findMany({
      select: { id: true, title: true, image: true },
    });

    const mediaFiles = await Promise.all(
      files
        .filter((f) => /\.(jpg|jpeg|png|gif|webp|svg|mp4|webm|mov|pdf)$/i.test(f))
        .map(async (f) => {
          const filePath = path.join(uploadDir, f);
          const stats = await stat(filePath);
          const ext = path.extname(f).toLowerCase();
          const isVideo = [".mp4", ".webm", ".mov"].includes(ext);
          const fileUrl = `/uploads/${f}`;

          // Check which posts use this file (in content or as cover image)
          const usedInPosts = posts
            .filter(
              (p) =>
                (p.content && p.content.includes(fileUrl)) ||
                (p.coverImage && p.coverImage.includes(fileUrl))
            )
            .map((p) => ({ id: p.id, title: p.title }));

          // Check which categories use this file as their image
          const usedInCategories = categories
            .filter((c) => c.image && c.image.includes(fileUrl))
            .map((c) => ({ id: c.id, title: `📁 ${c.title}` }));

          return {
            name: f,
            url: fileUrl,
            size: stats.size,
            type: isVideo ? "video" : "image",
            createdAt: stats.mtime.toISOString(),
            usedIn: [...usedInPosts, ...usedInCategories],
          };
        })
    );

    // Newest first
    mediaFiles.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(mediaFiles);
  } catch {
    return NextResponse.json([]);
  }
}

export async function PATCH(request: NextRequest) {
  const { oldName, newName } = await request.json();

  if (!oldName || !newName) {
    return NextResponse.json({ error: "Alter und neuer Name nötig" }, { status: 400 });
  }

  const safeOld = path.basename(oldName);
  const ext = path.extname(safeOld);
  // Ensure new name keeps the same extension
  let safeNew = path.basename(newName);
  if (path.extname(safeNew).toLowerCase() !== ext.toLowerCase()) {
    safeNew = safeNew + ext;
  }

  // Sanitize: only allow safe characters
  if (!/^[a-zA-Z0-9_\-. äöüÄÖÜß]+$/.test(safeNew)) {
    return NextResponse.json({ error: "Ungültige Zeichen im Dateinamen" }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  const oldPath = path.join(uploadDir, safeOld);
  const newPath = path.join(uploadDir, safeNew);

  try {
    // Check if target already exists
    try {
      await stat(newPath);
      return NextResponse.json({ error: "Datei mit diesem Namen existiert bereits" }, { status: 409 });
    } catch {
      // Good - file doesn't exist yet
    }

    await rename(oldPath, newPath);

    // Update references in all posts and categories
    const oldUrl = `/uploads/${safeOld}`;
    const newUrl = `/uploads/${safeNew}`;

    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { content: { contains: oldUrl } },
          { coverImage: { contains: oldUrl } },
        ],
      },
    });

    for (const post of posts) {
      await prisma.post.update({
        where: { id: post.id },
        data: {
          content: post.content.replaceAll(oldUrl, newUrl),
          coverImage: post.coverImage?.includes(oldUrl)
            ? post.coverImage.replaceAll(oldUrl, newUrl)
            : post.coverImage,
        },
      });
    }

    const cats = await prisma.category.findMany({
      where: { image: { contains: oldUrl } },
    });

    for (const cat of cats) {
      await prisma.category.update({
        where: { id: cat.id },
        data: { image: cat.image!.replaceAll(oldUrl, newUrl) },
      });
    }

    return NextResponse.json({ success: true, newName: safeNew, updatedPosts: posts.length + cats.length });
  } catch {
    return NextResponse.json({ error: "Fehler beim Umbenennen" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileName = searchParams.get("file");

  if (!fileName) {
    return NextResponse.json({ error: "Kein Dateiname angegeben" }, { status: 400 });
  }

  // Prevent path traversal
  const safeName = path.basename(fileName);
  const filePath = path.join(process.cwd(), "public", "uploads", safeName);

  try {
    await unlink(filePath);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Datei nicht gefunden" }, { status: 404 });
  }
}
