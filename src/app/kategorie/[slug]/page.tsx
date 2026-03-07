import { prisma } from "@/lib/prisma";
import { stripAccent } from "@/lib/utils";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  FolderOpen,
  Clock,
  Video,
  FileText,
  Globe,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { ScrollToTop } from "@/components/scroll-to-top";

export default async function KategorieSeite({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const today = new Date().toISOString().slice(0, 10);
  await prisma.pageView.upsert({
    where: { path_date: { path: `/kategorie/${slug}`, date: today } },
    update: { count: { increment: 1 } },
    create: { path: `/kategorie/${slug}`, date: today, count: 1 },
  }).catch(() => {});

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      parent: true,
      children: {
        include: {
          _count: { select: { posts: true, children: true } },
        },
        orderBy: { position: "asc" },
      },
      posts: {
        where: { published: true },
        orderBy: { position: "asc" },
      },
    },
  });

  if (!category) notFound();

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <div className="relative h-64 md:h-80">
        {category.image && (
          category.image.startsWith("linear-gradient") ? (
            <div
              className="absolute inset-0 w-full h-full"
              style={{ background: category.image }}
            />
          ) : (
            <img
              src={category.image}
              alt={category.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20" />

        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-white/70 text-sm mb-4">
            <Link href="/" className="hover:text-white transition-colors">
              Startseite
            </Link>
            <span>/</span>
            {category.parent && (
              <>
                <Link
                  href={`/kategorie/${category.parent.slug}`}
                  className="hover:text-white transition-colors"
                >
                  {category.parent.title}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-white">{category.title}</span>
          </nav>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {category.title}
          </h1>
          {category.description && (
            <p className="text-white/80 text-lg max-w-2xl">
              {category.description}
            </p>
          )}
        </div>
      </div>

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link
          href={category.parent ? `/kategorie/${category.parent.slug}` : "/"}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent hover:bg-accent/80 text-sm font-medium text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {category.parent ? category.parent.title : "Zur Übersicht"}
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Unterkategorien */}
        {category.children.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-primary" />
              Unterkategorien
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {category.children.map((child) => (
                <Link
                  key={child.id}
                  href={`/kategorie/${child.slug}`}
                  className="group relative rounded-xl overflow-hidden aspect-[16/9] shadow-sm hover:shadow-lg transition-shadow duration-300"
                >
                  {child.image && (
                    child.image.startsWith("linear-gradient") ? (
                      <div
                        className="absolute inset-0 w-full h-full transition-transform duration-500 group-hover:scale-110"
                        style={{ background: child.image }}
                      />
                    ) : (
                      <img
                        src={child.image}
                        alt={child.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    )
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
                  <div className="relative h-full flex flex-col justify-end p-5">
                    <h3 className="text-lg font-bold text-white mb-1">
                      {child.title}
                    </h3>
                    {child.description && (
                      <p className="text-white/75 text-sm line-clamp-2">
                        {child.description}
                      </p>
                    )}
                    <span className="text-white/50 text-xs mt-2">
                      {child._count.posts} Beiträge
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Posts */}
        {category.posts.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Beiträge
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {category.posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/post/${post.slug}`}
                  className="group rounded-xl overflow-hidden bg-card border border-border/60 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  {/* Cover */}
                  <div className="relative aspect-[16/9] overflow-hidden">
                    {post.coverImage ? (
                      post.coverImage.startsWith("linear-gradient") ? (
                        <div
                          className="absolute inset-0 w-full h-full transition-transform duration-500 group-hover:scale-105"
                          style={{ background: post.coverImage }}
                        />
                      ) : (
                        <img
                          src={post.coverImage}
                          alt={stripAccent(post.title)}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          style={post.coverImagePos ? { objectPosition: `${post.coverImagePos.split(" ")[0]}% ${post.coverImagePos.split(" ")[1]}%` } : undefined}
                        />
                      )
                    ) : (
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                        <FileText className="w-10 h-10 text-muted-foreground/30" />
                      </div>
                    )}

                    {/* Badges on image */}
                    {(post.type === "video" || post.type === "webpage" || post.duration) && (
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        {post.type === "video" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-black/50 text-white backdrop-blur-sm">
                            <Video className="w-3 h-3" />
                            Video
                          </span>
                        )}
                        {post.type === "webpage" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-black/50 text-white backdrop-blur-sm">
                            <Globe className="w-3 h-3" />
                            Interaktiv
                          </span>
                        )}
                        {post.duration && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-black/50 text-white backdrop-blur-sm">
                            <Clock className="w-3 h-3" />
                            {post.duration}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Text area */}
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {stripAccent(post.title)}
                    </h3>
                    {post.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {post.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Leere Kategorie */}
        {category.children.length === 0 && category.posts.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground">
              Noch keine Inhalte in dieser Kategorie.
            </p>
          </div>
        )}

        {/* Bottom Back Button */}
        <div className="mt-12 pt-8 border-t border-border/60">
          <Link
            href={category.parent ? `/kategorie/${category.parent.slug}` : "/"}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent/80 text-sm font-medium text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {category.parent ? `Zurück zu „${category.parent.title}"` : "Zur Übersicht"}
          </Link>
        </div>
      </div>

      <ScrollToTop />
    </div>
  );
}
