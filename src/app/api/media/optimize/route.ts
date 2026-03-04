import { NextResponse } from "next/server";
import { readdir, readFile, writeFile, unlink, stat } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".tiff", ".bmp"];
const MAX_WIDTH = 1920;
const WEBP_QUALITY = 80;

export async function POST() {
  const uploadDir = path.join(process.cwd(), "public", "uploads");

  try {
    const files = await readdir(uploadDir);
    const imagesToConvert = files.filter((f) => {
      const ext = path.extname(f).toLowerCase();
      return IMAGE_EXTENSIONS.includes(ext);
    });

    if (imagesToConvert.length === 0) {
      return NextResponse.json({ converted: 0, savedBytes: 0, message: "Keine Bilder zum Konvertieren gefunden." });
    }

    let converted = 0;
    let totalSavedBytes = 0;
    const urlUpdates: { oldUrl: string; newUrl: string }[] = [];

    for (const fileName of imagesToConvert) {
      const filePath = path.join(uploadDir, fileName);
      const webpName = fileName.replace(/\.[^.]+$/, ".webp");
      const webpPath = path.join(uploadDir, webpName);

      // Skip if webp version already exists
      try {
        await stat(webpPath);
        continue;
      } catch {
        // Good — doesn't exist yet
      }

      try {
        const originalStats = await stat(filePath);
        const buffer = await readFile(filePath);

        await sharp(buffer)
          .resize(MAX_WIDTH, null, { withoutEnlargement: true })
          .webp({ quality: WEBP_QUALITY })
          .toFile(webpPath);

        const webpStats = await stat(webpPath);
        totalSavedBytes += originalStats.size - webpStats.size;

        // Track URL change for DB updates
        urlUpdates.push({
          oldUrl: `/uploads/${fileName}`,
          newUrl: `/uploads/${webpName}`,
        });

        // Remove original
        await unlink(filePath);
        converted++;
      } catch (err) {
        console.error(`Failed to convert ${fileName}:`, err);
      }
    }

    // Update all references in posts and categories
    for (const { oldUrl, newUrl } of urlUpdates) {
      // Update posts: content and coverImage
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

      // Update categories: image
      const cats = await prisma.category.findMany({
        where: { image: { contains: oldUrl } },
      });

      for (const cat of cats) {
        await prisma.category.update({
          where: { id: cat.id },
          data: { image: cat.image!.replaceAll(oldUrl, newUrl) },
        });
      }
    }

    return NextResponse.json({
      converted,
      savedBytes: totalSavedBytes,
      savedMB: (totalSavedBytes / (1024 * 1024)).toFixed(1),
      updatedReferences: urlUpdates.length,
      message: `${converted} Bild(er) zu WebP konvertiert. ${(totalSavedBytes / (1024 * 1024)).toFixed(1)} MB eingespart.`,
    });
  } catch (err) {
    console.error("Optimize error:", err);
    return NextResponse.json({ error: "Fehler bei der Optimierung" }, { status: 500 });
  }
}
