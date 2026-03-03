import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";

export const dynamic = "force-dynamic";
import { CategoryCard } from "@/components/category-card";

export default async function HomePage() {
  const today = new Date().toISOString().slice(0, 10);
  await prisma.pageView.upsert({
    where: { path_date: { path: "/", date: today } },
    update: { count: { increment: 1 } },
    create: { path: "/", date: today, count: 1 },
  }).catch(() => {});

  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      _count: { select: { posts: true, children: true } },
    },
    orderBy: { position: "asc" },
  });

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Willkommen zur{" "}
            <span className="text-primary">Lernplattform</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Dein Begleiter durch die Ausbildung zum Packmitteltechnologen.
            Wähle ein Themengebiet und starte mit dem Lernen.
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              slug={category.slug}
              title={category.title}
              description={category.description}
              imageUrl={category.image}
              postCount={category._count.posts}
              subCount={category._count.children}
            />
          ))}
        </div>
      </section>

      <footer className="border-t border-border/60 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          PMT Lernplattform &mdash; Packmitteltechnologie
        </div>
      </footer>
    </div>
  );
}
