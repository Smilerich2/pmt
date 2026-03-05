"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2, Save, ExternalLink, ChevronDown, ChevronUp, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/image-upload";
import { SlashEditor } from "@/components/slash-editor";
import { HtmlPageEditor } from "@/components/html-page-editor";
import { TagInput } from "@/components/tag-input";

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
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [postType, setPostType] = useState("text");
  const [editorType, setEditorType] = useState("MARKDOWN");
  const [duration, setDuration] = useState("");
  const [tags, setTags] = useState("");
  const [published, setPublished] = useState(false);
  const [originalContent, setOriginalContent] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/posts/${id}`).then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]).then(([post, cats]) => {
      setTitle(post.title);
      setSlug(post.slug ?? "");
      setDescription(post.description ?? "");
      setCategoryId(post.categoryId ?? "");
      setContent(post.content ?? "");
      setCoverImage(post.coverImage ?? "");
      setPostType(post.type ?? "text");
      setEditorType(post.editorType === "HTML" ? "HTML" : "MARKDOWN");
      setDuration(post.duration ?? "");
      setTags(post.tags ?? "");
      setPublished(post.published ?? false);
      setOriginalContent(post.content ?? "");
      setCategories(cats);
      setLoading(false);
    });
  }, [id]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (content !== originalContent) {
        e.preventDefault();
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [content, originalContent]);

  function handlePostTypeChange(value: string) {
    if (content.trim() && !window.confirm("Der Inhalt wird beim Typ-Wechsel zurückgesetzt. Fortfahren?")) {
      return;
    }
    setPostType(value);
    setEditorType(value === "webpage" ? "HTML" : "MARKDOWN");
    setContent("");
  }

  const handleSave = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title || !categoryId || saving) return;
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
          tags: tags || null,
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
  }, [id, title, description, content, editorType, categoryId, coverImage, postType, duration, tags, published, saving, router]);

  // Cmd+S / Ctrl+S to save
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isWebpage = editorType === "HTML";

  return (
    <div className="pb-20">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/posts">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Beitrag bearbeiten</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Titel & Kategorie — always visible */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titel</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. Grundlagen der *Wellpappe*"
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

        {/* Collapsible settings */}
        <div className="rounded-xl border border-border/60 bg-card">
          <button
            type="button"
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Einstellungen
              {(description || tags || coverImage || postType !== "text" || duration) && (
                <span className="w-2 h-2 rounded-full bg-primary" />
              )}
            </span>
            {settingsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {settingsOpen && (
            <div className="px-4 pb-4 space-y-4 border-t border-border/40 pt-4">
              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung (Vorschau)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Tags (optional){" "}
                  <span className="text-muted-foreground font-normal text-xs">
                    — Werden als Chips im Beitrag angezeigt
                  </span>
                </Label>
                <TagInput value={tags} onChange={setTags} />
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
            </div>
          )}
        </div>

        {/* Editor */}
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
      </form>

      {/* Sticky Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border/60 px-6 py-3">
        <div className="max-w-[calc(100%-var(--sidebar-width,256px))] ml-auto flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="rounded border-border"
            />
            <span className="text-sm text-foreground">Veröffentlicht</span>
          </label>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:block">⌘S zum Speichern</span>
            {slug && (
              <Link
                href={`/post/${slug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground border border-border/60 hover:bg-accent transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Vorschau
              </Link>
            )}
            <Button onClick={() => handleSave()} disabled={saving || !title || !categoryId}>
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Speichern
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
