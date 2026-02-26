import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("image") as File | null;

  if (!file) {
    return NextResponse.json({ success: 0, message: "Keine Datei" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Unique filename
  const ext = path.extname(file.name) || ".png";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const filepath = path.join(uploadDir, filename);
  await writeFile(filepath, buffer);

  const url = `/uploads/${filename}`;

  // EditorJS Image Tool expects this format
  return NextResponse.json({
    success: 1,
    file: { url },
  });
}
