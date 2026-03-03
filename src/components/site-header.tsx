import Link from "next/link";
import { cookies } from "next/headers";
import { GraduationCap } from "lucide-react";
import { LogoutButton } from "./logout-button";
import { GlossaryQuickAccess } from "./glossary-quick-access";

export async function SiteHeader() {
  const cookieStore = await cookies();
  const role = cookieStore.get("auth-role")?.value;

  return (
    <header className="border-b border-border/60 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground leading-tight">
              PMT Lernplattform
            </h1>
            <p className="text-xs text-muted-foreground leading-tight">
              Packmitteltechnologie
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/glossar"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
          >
            Glossar
          </Link>
          <GlossaryQuickAccess />
          {role === "admin" && (
            <Link
              href="/admin"
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Admin
            </Link>
          )}
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
