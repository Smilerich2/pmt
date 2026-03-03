import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";
import {
  FolderOpen,
  FileText,
  Eye,
  EyeOff,
  ImageIcon,
  Users,
  TrendingUp,
  HardDrive,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { readdir, stat, statfs } from "fs/promises";
import path from "path";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function relativeDate(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "gerade eben";
  if (minutes < 60) return `vor ${minutes} Min.`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `vor ${hours} Std.`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "gestern";
  if (days < 30) return `vor ${days} Tagen`;
  return date.toLocaleDateString("de-DE");
}

export default async function AdminDashboard() {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  const MEDIA_EXTS = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".mp4", ".webm", ".mov", ".pdf"];

  // ── File scan ──────────────────────────────────────────────────────────────
  const allFiles = await readdir(uploadsDir).catch(() => [] as string[]);
  let uploadsBytes = 0;
  let imageCount = 0;
  let videoCount = 0;
  let pdfCount = 0;
  let mediaFileCount = 0;

  const statResults = await Promise.all(
    allFiles.map(async (f) => {
      const ext = path.extname(f).toLowerCase();
      if (!MEDIA_EXTS.includes(ext)) return null;
      const s = await stat(path.join(uploadsDir, f)).catch(() => null);
      if (!s?.isFile()) return null;
      return { name: f, size: s.size, ext };
    })
  );

  // We'll need post content for unused-file detection — fetch posts early
  const [allPosts, disk] = await Promise.all([
    prisma.post.findMany({ select: { content: true, coverImage: true } }),
    statfs(uploadsDir).catch(() => null),
  ]);

  const allContent = allPosts
    .map((p) => (p.content ?? "") + (p.coverImage ?? ""))
    .join(" ");

  let unusedCount = 0;
  for (const r of statResults) {
    if (!r) continue;
    mediaFileCount++;
    uploadsBytes += r.size;
    if ([".mp4", ".webm", ".mov"].includes(r.ext)) videoCount++;
    else if (r.ext === ".pdf") pdfCount++;
    else imageCount++;
    if (!allContent.includes(r.name)) unusedCount++;
  }

  const diskFree = disk ? disk.bfree * disk.bsize : null;
  const diskTotal = disk ? disk.blocks * disk.bsize : null;
  const diskUsed = diskTotal && diskFree ? diskTotal - diskFree : null;
  const diskPercent = diskTotal && diskUsed ? Math.round((diskUsed / diskTotal) * 100) : null;

  // ── DB queries ─────────────────────────────────────────────────────────────
  const today = new Date().toISOString().slice(0, 10);

  const [
    categoryCount,
    postCount,
    publishedCount,
    draftCount,
    viewsTotal,
    viewsToday,
    topPages,
    recentPosts,
    categories,
  ] = await Promise.all([
    prisma.category.count(),
    prisma.post.count(),
    prisma.post.count({ where: { published: true } }),
    prisma.post.count({ where: { published: false } }),
    prisma.pageView.aggregate({ _sum: { count: true } }),
    prisma.pageView.aggregate({ where: { date: today }, _sum: { count: true } }),
    prisma.pageView.groupBy({
      by: ["path"],
      _sum: { count: true },
      orderBy: { _sum: { count: "desc" } },
      take: 5,
    }),
    prisma.post.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        published: true,
        updatedAt: true,
        category: { select: { title: true } },
      },
    }),
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
    { label: "Medien", value: mediaFileCount, icon: ImageIcon, href: "/admin/media" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Dashboard</h1>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
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

      {/* Visitor + Storage row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Besucher heute */}
        <div className="p-5 rounded-xl bg-card border border-border/60">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Seitenaufrufe heute</span>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {viewsToday._sum.count ?? 0}
          </p>
        </div>

        {/* Besucher gesamt */}
        <div className="p-5 rounded-xl bg-card border border-border/60">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Seitenaufrufe gesamt</span>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {viewsTotal._sum.count ?? 0}
          </p>
        </div>

        {/* Speicher */}
        <div className="p-5 rounded-xl bg-card border border-border/60">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Speicherplatz</span>
          </div>
          {diskTotal && diskUsed !== null && diskPercent !== null ? (
            <>
              <div className="w-full bg-muted rounded-full h-2.5 mb-2">
                <div
                  className={`h-2.5 rounded-full transition-all ${diskPercent > 85 ? "bg-red-500" : diskPercent > 65 ? "bg-yellow-500" : "bg-primary"}`}
                  style={{ width: `${diskPercent}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {formatBytes(diskUsed)} von {formatBytes(diskTotal)} belegt ({diskPercent}%)
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Uploads-Ordner: {formatBytes(uploadsBytes)} in {mediaFileCount} Dateien
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Uploads: {formatBytes(uploadsBytes)} in {mediaFileCount} Dateien
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">Gesamtspeicher n/v</p>
            </>
          )}
        </div>
      </div>

      {/* Zuletzt bearbeitet + Medien-Analyse */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Zuletzt bearbeitet */}
        <div className="p-5 rounded-xl bg-card border border-border/60">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Zuletzt bearbeitet
          </h2>
          <ul className="space-y-2.5">
            {recentPosts.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/admin/posts/${post.id}`}
                  className="flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                      {post.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {post.category.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full ${
                        post.published
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {post.published ? "Live" : "Entwurf"}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {relativeDate(post.updatedAt)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Medien-Analyse */}
        <div className="p-5 rounded-xl bg-card border border-border/60">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-primary" />
            Medien-Analyse
          </h2>
          <div className="flex flex-wrap gap-3 mb-4">
            <span className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium">
              🖼 {imageCount} Bilder
            </span>
            <span className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 font-medium">
              🎬 {videoCount} Videos
            </span>
            <span className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 font-medium">
              📄 {pdfCount} PDFs
            </span>
          </div>

          {unusedCount > 0 ? (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
              <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                  {unusedCount} {unusedCount === 1 ? "Datei wird" : "Dateien werden"} nicht verwendet
                </p>
                <Link
                  href="/admin/media"
                  className="text-xs text-yellow-700 dark:text-yellow-400 hover:underline"
                >
                  Medien aufräumen →
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Alle Dateien werden verwendet.
            </p>
          )}
        </div>
      </div>

      {/* Top 5 Seiten */}
      {topPages.length > 0 && (
        <div className="p-5 rounded-xl bg-card border border-border/60 mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Top 5 Seiten
          </h2>
          <ul className="space-y-2.5">
            {topPages.map((page, i) => {
              const total = topPages[0]._sum.count ?? 1;
              const count = page._sum.count ?? 0;
              const pct = Math.round((count / total) * 100);
              return (
                <li key={page.path} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-4 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-foreground truncate font-mono">{page.path}</span>
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">{count}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-primary/60"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

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
