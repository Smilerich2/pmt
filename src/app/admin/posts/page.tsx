"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  FileText,
  Eye,
  EyeOff,
  Loader2,
  Trash2,
  Pencil,
  X,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Category = {
  id: string;
  title: string;
  parentId: string | null;
  parent: { title: string } | null;
};

type Post = {
  id: string;
  title: string;
  slug: string;
  editorType: string;
  published: boolean;
  createdAt: string;
  categoryId: string;
  category: { title: string };
};

export default function AdminPostsPage() {
  return (
    <Suspense>
      <PostsContent />
    </Suspense>
  );
}

function PostsContent() {
  const searchParams = useSearchParams();
  const filterCategoryId = searchParams.get("kategorie");

  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(filterCategoryId || "");
  const [loading, setLoading] = useState(true);

  async function loadData() {
    const [postsRes, catsRes] = await Promise.all([
      fetch("/api/posts"),
      fetch("/api/categories"),
    ]);
    setPosts(await postsRes.json());
    setCategories(await catsRes.json());
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setSelectedCategory(filterCategoryId || "");
  }, [filterCategoryId]);

  async function handleDelete(id: string) {
    if (!confirm("Beitrag wirklich löschen?")) return;
    await fetch(`/api/posts/${id}`, { method: "DELETE" });
    loadData();
  }

  async function handleTogglePublished(id: string, published: boolean) {
    await fetch(`/api/posts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    });
    loadData();
  }

  async function handleReorder(id: string, direction: "up" | "down") {
    await fetch("/api/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "post", id, direction }),
    });
    loadData();
  }

  const filteredPosts = selectedCategory
    ? posts.filter((p) => p.categoryId === selectedCategory)
    : posts;

  const activeCategoryName = selectedCategory
    ? categories.find((c) => c.id === selectedCategory)?.title
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Beiträge</h1>
        <Link href="/admin/posts/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Neuer Beitrag
          </Button>
        </Link>
      </div>

      {/* Kategorie-Filter */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setSelectedCategory("")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            !selectedCategory
              ? "bg-primary text-primary-foreground"
              : "bg-accent text-muted-foreground hover:text-foreground"
          }`}
        >
          Alle
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() =>
              setSelectedCategory(selectedCategory === cat.id ? "" : cat.id)
            }
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === cat.id
                ? "bg-primary text-primary-foreground"
                : "bg-accent text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat.parent ? `${cat.parent.title} → ` : ""}
            {cat.title}
          </button>
        ))}
      </div>

      {/* Aktiver Filter Hinweis */}
      {activeCategoryName && (
        <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
          <span>
            Gefiltert nach <strong className="text-foreground">{activeCategoryName}</strong>{" "}
            ({filteredPosts.length} Beiträge)
          </span>
          <button
            onClick={() => setSelectedCategory("")}
            className="hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Post-Liste */}
      <div className="space-y-2">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/60"
          >
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-muted-foreground/50" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Link
                  href={`/post/${post.slug}`}
                  className="font-semibold text-foreground hover:text-primary transition-colors truncate"
                >
                  {post.title}
                </Link>
              </div>
              <p className="text-sm text-muted-foreground">
                {post.category.title} &middot;{" "}
                {new Date(post.createdAt).toLocaleDateString("de-DE")}
              </p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* Reorder */}
              <div className="flex flex-col mr-1">
                {(() => {
                  const siblings = filteredPosts.filter((p) => p.categoryId === post.categoryId);
                  const idx = siblings.findIndex((p) => p.id === post.id);
                  return (
                    <>
                      <button
                        onClick={() => handleReorder(post.id, "up")}
                        disabled={idx === 0}
                        className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                        title="Nach oben"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleReorder(post.id, "down")}
                        disabled={idx === siblings.length - 1}
                        className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                        title="Nach unten"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </>
                  );
                })()}
              </div>
              <button onClick={() => handleTogglePublished(post.id, post.published)}>
                {post.published ? (
                  <Badge className="bg-green-100 text-green-800 border-0 cursor-pointer hover:bg-green-200 transition-colors">
                    <Eye className="w-3 h-3 mr-1" />
                    Live
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="cursor-pointer hover:bg-accent transition-colors">
                    <EyeOff className="w-3 h-3 mr-1" />
                    Entwurf
                  </Badge>
                )}
              </button>
              <Link href={`/admin/posts/${post.id}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(post.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}

        {filteredPosts.length === 0 && (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground">
              {selectedCategory
                ? "Keine Beiträge in dieser Kategorie."
                : "Noch keine Beiträge erstellt."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
