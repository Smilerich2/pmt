import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";
import { FolderOpen, FileText, Eye, EyeOff, ImageIcon } from "lucide-react";
import { readdir } from "fs/promises";
import path from "path";

export default async function AdminDashboard() {
  let mediaCount = 0;
  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const files = await readdir(uploadDir);
    mediaCount = files.filter((f) => /\.(jpg|jpeg|png|gif|webp|svg|mp4|webm|mov|pdf)$/i.test(f)).length;
  } catch { /* no uploads dir yet */ }

  const [categoryCount, postCount, publishedCount, draftCount, categories] =
    await Promise.all([
      prisma.category.count(),
      prisma.post.count(),
      prisma.post.count({ where: { published: true } }),
      prisma.post.count({ where: { published: false } }),
      prisma.category.findMany({
        where: { parentId: null },
        include: {
          _count: { select: { posts: true, children: true } },
          children: {
            include: { _count: { select: { posts: true } } },
          },
        },
        orderBy: { position: "asc" },
      }),
    ]);

  const stats = [
    { label: "Kategorien", value: categoryCount, icon: FolderOpen, href: "/admin/categories" },
    { label: "Beiträge gesamt", value: postCount, icon: FileText, href: "/admin/posts" },
    { label: "Veröffentlicht", value: publishedCount, icon: Eye, href: "/admin/posts" },
    { label: "Entwürfe", value: draftCount, icon: EyeOff, href: "/admin/posts" },
    { label: "Medien", value: mediaCount, icon: ImageIcon, href: "/admin/media" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="p-5 rounded-xl bg-card border border-border/60 hover:border-primary/30 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{stat.value}</p>
          </Link>
        ))}
      </div>

      {/* Kategorien-Übersicht */}
      <h2 className="text-lg font-semibold text-foreground mb-4">Nach Kategorie</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((cat) => {
          const totalPosts =
            cat._count.posts +
            cat.children.reduce((sum, child) => sum + child._count.posts, 0);

          return (
            <Link
              key={cat.id}
              href={`/admin/posts?kategorie=${cat.id}`}
              className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/60 hover:border-primary/30 hover:shadow-md transition-all duration-200"
            >
              {cat.image ? (
                cat.image.startsWith("linear-gradient") ? (
                  <div
                    className="w-12 h-12 rounded-lg shrink-0"
                    style={{ background: cat.image }}
                  />
                ) : (
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-12 h-12 rounded-lg object-cover shrink-0"
                  />
                )
              ) : (
                <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center shrink-0">
                  <FolderOpen className="w-5 h-5 text-primary" />
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-foreground truncate">{cat.title}</p>
                <p className="text-sm text-muted-foreground">
                  {totalPosts} Beiträge
                  {cat.children.length > 0 && ` · ${cat.children.length} Unterkategorien`}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
