"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, Save, ChevronDown, ChevronUp, Settings } from "lucide-react";
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

const DRAFT_KEY = "pmt-new-post-draft";

export default function NewPostPage() {
  return (
    <Suspense>
      <NewPostContent />
    </Suspense>
  );
}

function NewPostContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCategory = searchParams.get("kategorie");

  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(preselectedCategory || "");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [postType, setPostType] = useState("text");
  const [editorType, setEditorType] = useState("MARKDOWN");
  const [duration, setDuration] = useState("");
  const [tags, setTags] = useState("");
  const [published, setPublished] = useState(true);
  const [draftRestored, setDraftRestored] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories);
  }, []);

  // Restore draft from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        if (draft.title || draft.content) {
          setDraftRestored(true);
        }
      }
    } catch {}
  }, []);

  function restoreDraft() {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        if (draft.title) setTitle(draft.title);
        if (draft.description) setDescription(draft.description);
        if (draft.categoryId) setCategoryId(draft.categoryId);
        if (draft.content) setContent(draft.content);
        if (draft.coverImage) setCoverImage(draft.coverImage);
        if (draft.postType) { setPostType(draft.postType); setEditorType(draft.postType === "webpage" ? "HTML" : "MARKDOWN"); }
        if (draft.duration) setDuration(draft.duration);
        if (draft.tags) setTags(draft.tags);
      }
    } catch {}
    setDraftRestored(false);
    localStorage.removeItem(DRAFT_KEY);
  }

  function dismissDraft() {
    setDraftRestored(false);
    localStorage.removeItem(DRAFT_KEY);
  }

  // Auto-save draft every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      if (title || content) {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({
          title, description, categoryId, content, coverImage, postType, duration, tags,
        }));
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [title, description, categoryId, content, coverImage, postType, duration, tags]);

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
      const res = await fetch("/api/posts", {
        method: "POST",
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
        localStorage.removeItem(DRAFT_KEY);
        router.push("/admin/posts");
      }
    } catch {
      alert("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  }, [title, description, content, editorType, categoryId, coverImage, postType, duration, tags, published, saving, router]);

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

  const isWebpage = editorType === "HTML";

  return (
    <div className="pb-20">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/posts">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Neuer Beitrag</h1>
      </div>

      {/* Draft restore banner */}
      {draftRestored && (
        <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-between gap-3">
          <p className="text-sm text-foreground">
            Es wurde ein ungespeicherter Entwurf gefunden.
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={restoreDraft}
              className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Wiederherstellen
            </button>
            <button
              onClick={dismissDraft}
              className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Verwerfen
            </button>
          </div>
        </div>
      )}

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
                  placeholder="Kurze Zusammenfassung..."
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
            <span className="text-sm text-foreground">Sofort veröffentlichen</span>
          </label>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:block">⌘S zum Speichern</span>
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
