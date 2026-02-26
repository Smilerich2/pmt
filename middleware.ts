import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const role = request.cookies.get("auth-role")?.value;
  const { pathname } = request.nextUrl;

  // Login-Seite und API immer erlauben
  if (pathname === "/login" || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Statische Assets durchlassen
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/uploads") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Kein Login -> zur Login-Seite
  if (!role) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Admin-Bereich nur für Admins
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
