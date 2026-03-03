import { prisma } from "@/lib/prisma";
import { stripAccent } from "@/lib/utils";
import { SiteHeader } from "@/components/site-header";
import { SearchBar } from "@/components/search-bar";
import { FeedbackButton } from "@/components/feedback-button";
import { ScrollToTop } from "@/components/scroll-to-top";

export const dynamic = "force-dynamic";
import { CategoryCard } from "@/components/category-card";
import { FileText, Video, Globe } from "lucide-react";
import Link from "next/link";

const typeConfig: Record<string, { label: string; icon: typeof FileText; color: string }> = {
  text: { label: "Text", icon: FileText, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  video: { label: "Video", icon: Video, color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  webpage: { label: "Webseite", icon: Globe, color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
};

export default async function HomePage() {
  const today = new Date().toISOString().slice(0, 10);
  await prisma.pageView.upsert({
    where: { path_date: { path: "/", date: today } },
    update: { count: { increment: 1 } },
    create: { path: "/", date: today, count: 1 },
  }).catch(() => {});

  const [categories, recentPosts, postCount, categoryCount, glossaryCount] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: null },
      include: {
        _count: { select: { posts: true, children: true } },
      },
      orderBy: { position: "asc" },
    }),
    prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: {
        id: true,
        title: true,
        slug: true,
        type: true,
        description: true,
        createdAt: true,
        category: { select: { title: true } },
      },
    }),
    prisma.post.count({ where: { published: true } }),
    prisma.category.count(),
    prisma.glossaryTerm.count(),
  ]);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/15 via-accent/30 to-background py-6 md:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-2">
              Willkommen im{" "}
              <span className="text-primary">LernHub</span>
            </h2>
            <p className="text-base text-muted-foreground mb-5">
              Dein Begleiter durch die Ausbildung zum Packmitteltechnologen.
            </p>
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h3 className="text-xl font-bold text-foreground mb-6">Themengebiete</h3>
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

      {/* Recent Posts */}
      {recentPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <h3 className="text-xl font-bold text-foreground mb-6">Zuletzt hinzugefügt</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentPosts.map((post) => {
              const tc = typeConfig[post.type] || typeConfig.text;
              const Icon = tc.icon;
              return (
                <Link
                  key={post.id}
                  href={`/post/${post.slug}`}
                  className="group p-4 rounded-xl bg-card border border-border/60 hover:border-primary/30 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${tc.color}`}>
                      <Icon className="w-3 h-3" />
                      {tc.label}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
                    {stripAccent(post.title)}
                  </h4>
                  <p className="text-xs text-muted-foreground">{post.category.title}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {new Date(post.createdAt).toLocaleDateString("de-DE")}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Stats + Footer */}
      <footer className="border-t border-border/60 mt-4 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="flex items-center justify-center gap-4 sm:gap-6 text-sm text-muted-foreground">
            <span className="font-medium">{postCount} Beiträge</span>
            <span className="text-border/60">·</span>
            <span className="font-medium">{categoryCount} Kategorien</span>
            <span className="text-border/60">·</span>
            <span className="font-medium">{glossaryCount} Glossareinträge</span>
          </div>
          <p className="text-xs text-muted-foreground/70">
            Inhalte erstellt &amp; moderiert von FRI &mdash; kein Anspruch auf Vollständigkeit oder Richtigkeit.
          </p>
          <p className="text-sm text-muted-foreground">
            PMT LernHub &mdash; Packmitteltechnologie
          </p>
        </div>
      </footer>

      <FeedbackButton />
      <ScrollToTop />
    </div>
  );
}
