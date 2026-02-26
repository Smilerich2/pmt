import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  const studentPw = process.env.STUDENT_PASSWORD || "lernen2024";
  const adminPw = process.env.ADMIN_PASSWORD || "admin2024";

  if (password === adminPw) {
    const response = NextResponse.json({ role: "admin" });
    response.cookies.set("auth-role", "admin", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 Tage
      path: "/",
    });
    return response;
  }

  if (password === studentPw) {
    const response = NextResponse.json({ role: "student" });
    response.cookies.set("auth-role", "student", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  }

  return NextResponse.json({ error: "Falsches Passwort" }, { status: 401 });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("auth-role");
  return response;
}
