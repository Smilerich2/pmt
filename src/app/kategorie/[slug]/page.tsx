import { prisma } from "@/lib/prisma";
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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function KategorieSeite({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

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
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {category.parent ? category.parent.title : "Zurück zur Übersicht"}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {category.posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/post/${post.slug}`}
                  className="group flex gap-4 p-4 rounded-xl bg-card border border-border/60 hover:border-primary/30 hover:shadow-md transition-all duration-200"
                >
                  {/* Thumbnail */}
                  {post.coverImage ? (
                    <div className="shrink-0 w-28 h-20 rounded-lg overflow-hidden">
                      {post.coverImage.startsWith("linear-gradient") ? (
                        <div
                          className="w-full h-full"
                          style={{ background: post.coverImage }}
                        />
                      ) : (
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="shrink-0 w-28 h-20 rounded-lg bg-muted flex items-center justify-center">
                      <FileText className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex flex-col justify-center min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {post.type === "video" && (
                        <Badge
                          variant="secondary"
                          className="text-xs gap-1 px-1.5 py-0"
                        >
                          <Video className="w-3 h-3" />
                          Video
                        </Badge>
                      )}
                      {post.duration && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.duration}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {post.title}
                    </h3>
                    {post.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
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
      </div>
    </div>
  );
}
