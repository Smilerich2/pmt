"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/image-upload";
import { SlashEditor } from "@/components/slash-editor";
import { HtmlPageEditor } from "@/components/html-page-editor";

type Category = {
  id: string;
  title: string;
  parentId: string | null;
  parent: { title: string } | null;
};

export default function EditPostPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [postType, setPostType] = useState("text");
  const [editorType, setEditorType] = useState("MARKDOWN");
  const [duration, setDuration] = useState("");
  const [published, setPublished] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/posts/${id}`).then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]).then(([post, cats]) => {
      setTitle(post.title);
      setDescription(post.description ?? "");
      setCategoryId(post.categoryId ?? "");
      setContent(post.content ?? "");
      setCoverImage(post.coverImage ?? "");
      setPostType(post.type ?? "text");
      setEditorType(post.editorType === "HTML" ? "HTML" : "MARKDOWN");
      setDuration(post.duration ?? "");
      setPublished(post.published ?? false);
      setCategories(cats);
      setLoading(false);
    });
  }, [id]);

  function handlePostTypeChange(value: string) {
    setPostType(value);
    setEditorType(value === "webpage" ? "HTML" : "MARKDOWN");
    setContent("");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || null,
          content,
          editorType,
          categoryId,
          coverImage: coverImage || null,
          type: postType,
          duration: duration || null,
          published,
        }),
      });

      if (res.ok) {
        router.push("/admin/posts");
      }
    } catch {
      alert("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isWebpage = editorType === "HTML";

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/posts">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Beitrag bearbeiten</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titel</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Kategorie</Label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            >
              <option value="">Kategorie wählen...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.parent ? `${cat.parent.title} → ` : ""}
                  {cat.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Beschreibung (Vorschau)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Coverbild</Label>
            <ImageUpload value={coverImage} onChange={setCoverImage} />
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Typ</Label>
              <select
                id="type"
                value={postType}
                onChange={(e) => handlePostTypeChange(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="text">Text</option>
                <option value="video">Video</option>
                <option value="webpage">Webseite (HTML/CSS/JS)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Dauer (optional)</Label>
              <Input
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="z.B. 12 Min"
              />
            </div>
          </div>
        </div>

        {/* Editor – Markdown oder HTML je nach Typ */}
        <div className="space-y-2">
          {isWebpage ? (
            <>
              <Label>
                Inhalt (HTML/CSS/JS) —{" "}
                <span className="text-muted-foreground font-normal">
                  Vollständige Webseite einfügen oder Template nutzen
                </span>
              </Label>
              <HtmlPageEditor value={content} onChange={setContent} />
            </>
          ) : (
            <>
              <Label>
                Inhalt (Markdown) —{" "}
                <span className="text-muted-foreground font-normal">
                  Tippe <kbd className="px-1.5 py-0.5 rounded bg-accent text-xs font-mono">/</kbd> für Blöcke
                </span>
              </Label>
              <SlashEditor value={content} onChange={setContent} />
            </>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border/60 pt-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="rounded border-border"
            />
            <span className="text-sm text-foreground">Veröffentlicht</span>
          </label>

          <Button type="submit" disabled={saving || !title || !categoryId}>
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Speichern
          </Button>
        </div>
      </form>
    </div>
  );
}
