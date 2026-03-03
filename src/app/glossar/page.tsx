import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import { GlossaryPageClient } from "@/components/glossary-page-client";

export const dynamic = "force-dynamic";

export default async function GlossarPage() {
  const today = new Date().toISOString().slice(0, 10);
  await prisma.pageView.upsert({
    where: { path_date: { path: "/glossar", date: today } },
    update: { count: { increment: 1 } },
    create: { path: "/glossar", date: today, count: 1 },
  }).catch(() => {});

  const terms = await prisma.glossaryTerm.findMany({
    orderBy: { term: "asc" },
  });

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/20 to-accent py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Glossar
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Alle Fachbegriffe auf einen Blick
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <GlossaryPageClient terms={terms} />
      </section>

      <footer className="border-t border-border/60 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          PMT Lernplattform &mdash; Packmitteltechnologie
        </div>
      </footer>
    </div>
  );
}
