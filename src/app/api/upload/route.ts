import { NextRequest, NextResponse } from "next/server";
import { createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import { Readable } from "stream";
import path from "path";
import busboy from "busboy";

// Allow up to 5 minutes for large file uploads
export const maxDuration = 300;

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

    let savedUrl: string | null = null;
    let writeError: Error | null = null;

    bb.on("file", (_field, fileStream, info) => {
      const ext = path.extname(info.filename) || ".bin";
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
      const filepath = path.join(uploadDir, filename);
      savedUrl = `/uploads/${filename}`;

      const ws = createWriteStream(filepath);
      fileStream.pipe(ws);
      ws.on("error", (err) => { writeError = err; });
    });

    bb.on("finish", () => {
      if (writeError) {
        resolve(NextResponse.json({ success: 0, message: writeError.message }, { status: 500 }));
      } else if (!savedUrl) {
        resolve(NextResponse.json({ success: 0, message: "Keine Datei" }, { status: 400 }));
      } else {
        resolve(NextResponse.json({ success: 1, file: { url: savedUrl } }));
      }
    });

    bb.on("error", (err: Error) => {
      resolve(NextResponse.json({ success: 0, message: err.message }, { status: 500 }));
    });

    Readable.fromWeb(request.body as Parameters<typeof Readable.fromWeb>[0]).pipe(bb);
  });
}
