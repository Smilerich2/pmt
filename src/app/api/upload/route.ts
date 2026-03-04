import { NextRequest, NextResponse } from "next/server";
import { createWriteStream } from "fs";
import { mkdir, readFile, writeFile, unlink } from "fs/promises";
import { Readable } from "stream";
import path from "path";
import busboy from "busboy";
import sharp from "sharp";

// Allow up to 5 minutes for large file uploads
export const maxDuration = 300;

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".tiff", ".bmp"];
const MAX_WIDTH = 1920;
const WEBP_QUALITY = 80;

async function convertToWebP(filePath: string): Promise<string> {
  const buffer = await readFile(filePath);
  const webpPath = filePath.replace(/\.[^.]+$/, ".webp");

  await sharp(buffer)
    .resize(MAX_WIDTH, null, { withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toFile(webpPath);

  // Remove original file
  if (webpPath !== filePath) {
    await unlink(filePath);
  }

  return webpPath;
}

export async function POST(request: NextRequest) {
  if (!request.body) {
    return NextResponse.json({ success: 0, message: "Keine Datei" }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  return new Promise<NextResponse>((resolve) => {
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => { headers[key] = value; });

    const bb = busboy({ headers, limits: { fileSize: 500 * 1024 * 1024 } }); // 500 MB

    let savedFilePath: string | null = null;
    let savedUrl: string | null = null;
    let originalExt: string = "";
    let writeError: Error | null = null;
    let writeFinished = false;

    bb.on("file", (_field, fileStream, info) => {
      const ext = path.extname(info.filename) || ".bin";
      originalExt = ext.toLowerCase();
      const baseName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const filename = `${baseName}${ext}`;
      const filepath = path.join(uploadDir, filename);
      savedFilePath = filepath;
      savedUrl = `/uploads/${filename}`;

      const ws = createWriteStream(filepath);
      fileStream.pipe(ws);
      ws.on("error", (err) => { writeError = err; });
      ws.on("finish", () => { writeFinished = true; });
    });

    bb.on("finish", async () => {
      if (writeError) {
        resolve(NextResponse.json({ success: 0, message: writeError.message }, { status: 500 }));
        return;
      }
      if (!savedUrl || !savedFilePath) {
        resolve(NextResponse.json({ success: 0, message: "Keine Datei" }, { status: 400 }));
        return;
      }

      // Wait briefly for write stream to finish if needed
      if (!writeFinished) {
        await new Promise<void>((r) => setTimeout(r, 100));
      }

      // Convert images to WebP
      if (IMAGE_EXTENSIONS.includes(originalExt)) {
        try {
          const webpPath = await convertToWebP(savedFilePath);
          const webpFilename = path.basename(webpPath);
          savedUrl = `/uploads/${webpFilename}`;
        } catch (err) {
          // If conversion fails, keep original file
          console.error("WebP conversion failed, keeping original:", err);
        }
      }

      resolve(NextResponse.json({ success: 1, file: { url: savedUrl } }));
    });

    bb.on("error", (err: Error) => {
      resolve(NextResponse.json({ success: 0, message: err.message }, { status: 500 }));
    });

    Readable.fromWeb(request.body as Parameters<typeof Readable.fromWeb>[0]).pipe(bb);
  });
}
