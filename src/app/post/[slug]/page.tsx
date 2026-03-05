import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { HtmlPostViewer } from "@/components/html-post-viewer";
import { SiteHeader } from "@/components/site-header";
import { stripAccent } from "@/lib/utils";
import { ScrollToTop } from "@/components/scroll-to-top";
import { BackToTopButton } from "@/components/back-to-top-button";

export default async function PostSeite({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const today = new Date().toISOString().slice(0, 10);
  await prisma.pageView.upsert({
    where: { path_date: { path: `/post/${slug}`, date: today } },
    update: { count: { increment: 1 } },
    create: { path: `/post/${slug}`, date: today, count: 1 },
  }).catch(() => {});

  const [post, glossaryTerms] = await Promise.all([
    prisma.post.findUnique({
      where: { slug },
      include: {
        category: {
          include: { parent: true },
        },
      },
    }),
    prisma.glossaryTerm.findMany({
      select: { term: true, definition: true },
    }),
  ]);

  if (!post || !post.published) notFound();

  const siblingPosts = await prisma.post.findMany({
    where: { categoryId: post.categoryId, published: true },
    orderBy: { position: "asc" },
    select: { slug: true, title: true },
  });
  const currentIndex = siblingPosts.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex > 0 ? siblingPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < siblingPosts.length - 1 ? siblingPosts[currentIndex + 1] : null;

  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("auth-role")?.value === "admin";

  const formattedDate = new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(post.createdAt);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <div className="relative h-auto min-h-56 md:min-h-72">
        {post.coverImage ? (
          post.coverImage.startsWith("linear-gradient") ? (
            <div
              className="absolute inset-0 w-full h-full"
              style={{ background: post.coverImage }}
            />
          ) : (
            <img
              src={post.coverImage}
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-8 pt-24 md:pt-32">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-white/70 text-sm mb-3 flex-wrap">
            <Link href="/" className="hover:text-white transition-colors">
              Startseite
            </Link>
            <span>/</span>
            {post.category.parent && (
              <>
                <Link
                  href={`/kategorie/${post.category.parent.slug}`}
                  className="hover:text-white transition-colors"
                >
                  {post.category.parent.title}
                </Link>
                <span>/</span>
              </>
            )}
            <Link
              href={`/kategorie/${post.category.slug}`}
              className="hover:text-white transition-colors"
            >
              {post.category.title}
            </Link>
          </nav>

          {/* Accent Title */}
          <div className="flex items-center gap-3">
            <AccentTitle title={post.title} />
            {isAdmin && (
              <Link
                href={`/admin/posts/${post.id}`}
                className="shrink-0 w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
                title="Beitrag bearbeiten"
              >
                <Pencil className="w-4 h-4 text-white" />
              </Link>
            )}
          </div>

          {/* Description */}
          {post.description && (
            <p className="mt-3 text-white/80 text-base max-w-2xl">
              {post.description}
            </p>
          )}

          {/* Tags */}
          {post.tags && (
            <div className="mt-3 flex flex-wrap gap-2">
              {post.tags.split(",").map((tag: string) => tag.trim()).filter(Boolean).map((tag: string, i: number) => (
                <span
                  key={i}
                  className="bg-white/15 text-white text-xs px-2.5 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Meta */}
          <div className="mt-3 flex items-center gap-4 text-white/60 text-sm">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formattedDate}
            </span>
            {post.duration && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {post.duration}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Article Content */}
        {post.editorType === "HTML" ? (
          <HtmlPostViewer content={post.content} />
        ) : (
          <article className="prose prose-lg max-w-none">
            {post.editorType === "MARKDOWN" ? (
              <MarkdownRenderer content={post.content} glossary={glossaryTerms} />
            ) : (
              <EditorJSRenderer content={post.content} />
            )}
          </article>
        )}

        {/* Bottom Navigation */}
        <div className="mt-12 pt-8 border-t border-border/60 flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/kategorie/${post.category.slug}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent/80 text-sm font-medium text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zu „{post.category.title}"
          </Link>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link
                href={`/admin/posts/${post.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium transition-colors border border-primary/20"
              >
                <Pencil className="w-4 h-4" />
                Beitrag bearbeiten
              </Link>
            )}
            <BackToTopButton />
          </div>
        </div>

        {/* Prev / Next Post Navigation */}
        {(prevPost || nextPost) && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {prevPost ? (
              <Link
                href={`/post/${prevPost.slug}`}
                className="group flex items-center gap-3 p-4 rounded-xl border border-border/60 bg-card hover:bg-accent/50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Vorheriger</p>
                  <p className="text-sm font-medium text-foreground truncate">{stripAccent(prevPost.title)}</p>
                </div>
              </Link>
            ) : (
              <div />
            )}
            {nextPost ? (
              <Link
                href={`/post/${nextPost.slug}`}
                className="group flex items-center justify-end gap-3 p-4 rounded-xl border border-border/60 bg-card hover:bg-accent/50 transition-colors text-right"
              >
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Nächster</p>
                  <p className="text-sm font-medium text-foreground truncate">{stripAccent(nextPost.title)}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
              </Link>
            ) : (
              <div />
            )}
          </div>
        )}
      </div>

      <ScrollToTop />
    </div>
  );
}

function AccentTitle({ title }: { title: string }) {
  const parts = title.split(/(\*[^*]+\*)/g);
  const hasAccent = parts.some((p) => p.startsWith("*") && p.endsWith("*"));

  if (!hasAccent) {
    return <h1 className="text-2xl md:text-4xl font-bold text-white">{title}</h1>;
  }

  return (
    <h1 className="text-2xl md:text-4xl font-bold text-white">
      {parts.map((part, i) =>
        part.startsWith("*") && part.endsWith("*") ? (
          <span key={i} className="text-primary">{part.slice(1, -1)}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </h1>
  );
}

function EditorJSRenderer({ content }: { content: string }) {
  try {
    const data = JSON.parse(content);
    if (!data.blocks) return null;

    return (
      <div className="space-y-4">
        {data.blocks.map((block: Record<string, unknown>, i: number) => {
          switch (block.type) {
            case "header": {
              const headerData = block.data as { text: string; level: number };
              const level = headerData.level;
              if (level === 1) return <h1 key={i} dangerouslySetInnerHTML={{ __html: headerData.text }} />;
              if (level === 2) return <h2 key={i} dangerouslySetInnerHTML={{ __html: headerData.text }} />;
              if (level === 3) return <h3 key={i} dangerouslySetInnerHTML={{ __html: headerData.text }} />;
              if (level === 4) return <h4 key={i} dangerouslySetInnerHTML={{ __html: headerData.text }} />;
              return <h5 key={i} dangerouslySetInnerHTML={{ __html: headerData.text }} />;
            }
            case "paragraph": {
              const pData = block.data as { text: string };
              return (
                <p key={i} dangerouslySetInnerHTML={{ __html: pData.text }} />
              );
            }
            case "list": {
              const listData = block.data as {
                style: string;
                items: string[];
              };
              const ListTag = listData.style === "ordered" ? "ol" : "ul";
              return (
                <ListTag key={i}>
                  {listData.items.map((item: string, j: number) => (
                    <li key={j} dangerouslySetInnerHTML={{ __html: item }} />
                  ))}
                </ListTag>
              );
            }
            case "image": {
              const imgData = block.data as {
                file: { url: string };
                caption?: string;
              };
              return (
                <figure key={i}>
                  <img
                    src={imgData.file.url}
                    alt={imgData.caption || ""}
                    className="rounded-lg"
                  />
                  {imgData.caption && (
                    <figcaption className="text-center text-sm text-muted-foreground mt-2">
                      {imgData.caption}
                    </figcaption>
                  )}
                </figure>
              );
            }
            case "quote": {
              const quoteData = block.data as {
                text: string;
                caption?: string;
              };
              return (
                <blockquote key={i}>
                  <p dangerouslySetInnerHTML={{ __html: quoteData.text }} />
                  {quoteData.caption && (
                    <cite className="text-sm">{quoteData.caption}</cite>
                  )}
                </blockquote>
              );
            }
            case "code": {
              const codeData = block.data as { code: string };
              return (
                <pre key={i}>
                  <code>{codeData.code}</code>
                </pre>
              );
            }
            case "embed": {
              const embedData = block.data as {
                service: string;
                embed: string;
                caption?: string;
              };
              return (
                <figure key={i}>
                  <iframe
                    src={embedData.embed}
                    className="w-full aspect-video rounded-lg"
                    allowFullScreen
                  />
                  {embedData.caption && (
                    <figcaption className="text-center text-sm text-muted-foreground mt-2">
                      {embedData.caption}
                    </figcaption>
                  )}
                </figure>
              );
            }
            case "table": {
              const tableData = block.data as {
                withHeadings: boolean;
                content: string[][];
              };
              return (
                <table key={i}>
                  <tbody>
                    {tableData.content.map((row: string[], ri: number) => (
                      <tr key={ri}>
                        {row.map((cell: string, ci: number) => {
                          const CellTag =
                            tableData.withHeadings && ri === 0 ? "th" : "td";
                          return (
                            <CellTag
                              key={ci}
                              dangerouslySetInnerHTML={{ __html: cell }}
                            />
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              );
            }
            default:
              return null;
          }
        })}
      </div>
    );
  } catch {
    return <p className="text-muted-foreground">Inhalt konnte nicht geladen werden.</p>;
  }
}
