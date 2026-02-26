"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  FolderOpen,
  Trash2,
  Pencil,
  Loader2,
  AlertTriangle,
  ArrowRightLeft,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ImageUpload } from "@/components/image-upload";

type Category = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  parent: { title: string } | null;
  _count: { posts: number; children: number };
};

type DeleteInfo = {
  title: string;
  postCount: number;
  subcategoryCount: number;
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state (shared for create & edit)
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [parentId, setParentId] = useState("");

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteInfo, setDeleteInfo] = useState<DeleteInfo | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Move dialog
  const [moveSource, setMoveSource] = useState<Category | null>(null);
  const [moveTargetId, setMoveTargetId] = useState("");
  const [moving, setMoving] = useState(false);

  async function loadCategories() {
    try {
      const res = await fetch("/api/categories");
      const text = await res.text();
      const data = text ? JSON.parse(text) : [];
      setCategories(data);
    } catch (e) {
      console.error("Failed to load categories:", e);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function resetForm() {
    setEditId(null);
    setTitle("");
    setDescription("");
    setImage("");
    setParentId("");
  }

  function openCreate() {
    resetForm();
    setOpen(true);
  }

  function openEdit(cat: Category) {
    setEditId(cat.id);
    setTitle(cat.title);
    setDescription(cat.description ?? "");
    setImage(cat.image ?? "");
    setParentId(cat.parentId ?? "");
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      title,
      description: description || null,
      image: image || null,
      parentId: parentId || null,
    };

    if (editId) {
      await fetch(`/api/categories/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    resetForm();
    setOpen(false);
    setSaving(false);
    loadCategories();
  }

  // ─── Delete with info ───

  async function openDeleteDialog(cat: Category) {
    setDeleteTarget(cat);
    setDeleteInfo(null);
    setDeleteLoading(true);

    const res = await fetch(`/api/categories/${cat.id}`);
    const info = await res.json();
    setDeleteInfo(info);
    setDeleteLoading(false);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    await fetch(`/api/categories/${deleteTarget.id}`, { method: "DELETE" });
    setDeleting(false);
    setDeleteTarget(null);
    setDeleteInfo(null);
    loadCategories();
  }

  // ─── Move posts ───

  function openMoveDialog(cat: Category) {
    setMoveSource(cat);
    setMoveTargetId("");
  }

  async function handleMove() {
    if (!moveSource || !moveTargetId) return;
    setMoving(true);

    // Get all posts from this category
    const res = await fetch("/api/posts");
    const allPosts = await res.json();
    const postIds = allPosts
      .filter((p: { categoryId: string }) => p.categoryId === moveSource.id)
      .map((p: { id: string }) => p.id);

    if (postIds.length > 0) {
      await fetch("/api/posts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postIds, targetCategoryId: moveTargetId }),
      });
    }

    setMoving(false);
    setMoveSource(null);
    loadCategories();
  }

  async function handleReorder(id: string, direction: "up" | "down") {
    await fetch("/api/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "category", id, direction }),
    });
    loadCategories();
  }

  const topLevel = categories.filter((c) => !c.parentId);

  // Helper to get full category label
  function catLabel(cat: Category) {
    return cat.parent ? `${cat.parent.title} → ${cat.title}` : cat.title;
  }

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
        <h1 className="text-2xl font-bold text-foreground">Kategorien</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Neue Kategorie
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editId ? "Kategorie bearbeiten" : "Neue Kategorie erstellen"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titel</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="z.B. Werkstoffkunde"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Kurze Beschreibung der Kategorie..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Bild</Label>
                <ImageUpload value={image} onChange={setImage} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parent">Übergeordnete Kategorie (optional)</Label>
                <select
                  id="parent"
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Keine (Hauptkategorie)</option>
                  {topLevel
                    .filter((cat) => cat.id !== editId)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.title}
                      </option>
                    ))}
                </select>
              </div>

              <Button type="submit" className="w-full" disabled={saving || !title}>
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : editId ? (
                  "Speichern"
                ) : (
                  "Erstellen"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category List */}
      <div className="space-y-2">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/60"
          >
            {cat.image ? (
              cat.image.startsWith("linear-gradient") ? (
                <div
                  className="w-16 h-12 rounded-lg shrink-0"
                  style={{ background: cat.image }}
                />
              ) : (
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-16 h-12 rounded-lg object-cover shrink-0"
                />
              )
            ) : (
              <div className="w-16 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <FolderOpen className="w-5 h-5 text-muted-foreground/50" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground truncate">
                  {cat.title}
                </p>
                {cat.parent && (
                  <span className="text-xs text-muted-foreground bg-accent px-2 py-0.5 rounded">
                    in {cat.parent.title}
                  </span>
                )}
              </div>
              {cat.description && (
                <p className="text-sm text-muted-foreground truncate">{cat.description}</p>
              )}
              <p className="text-xs text-muted-foreground mt-0.5">
                {cat._count.children} Unterkategorien &middot; {cat._count.posts} Beiträge
              </p>
            </div>

            <div className="flex items-center gap-0.5 shrink-0">
              {/* Reorder buttons */}
              <div className="flex flex-col mr-1">
                {(() => {
                  const siblings = categories.filter((c) => c.parentId === cat.parentId);
                  const idx = siblings.findIndex((c) => c.id === cat.id);
                  return (
                    <>
                      <button
                        onClick={() => handleReorder(cat.id, "up")}
                        disabled={idx === 0}
                        className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                        title="Nach oben"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleReorder(cat.id, "down")}
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
              {cat._count.posts > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openMoveDialog(cat)}
                  className="text-muted-foreground hover:text-foreground"
                  title="Beiträge verschieben"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openEdit(cat)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openDeleteDialog(cat)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Delete Confirmation Dialog ─── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => { setDeleteTarget(null); setDeleteInfo(null); }}>
          <div
            className="bg-card border border-border/60 rounded-xl shadow-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Kategorie löschen</h3>
                <p className="text-sm text-muted-foreground">
                  &bdquo;{deleteTarget.title}&ldquo; wirklich löschen?
                </p>
              </div>
            </div>

            {deleteLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : deleteInfo && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm space-y-1">
                <p className="font-medium text-red-800">Folgendes wird unwiderruflich gelöscht:</p>
                <ul className="text-red-700 space-y-0.5 ml-4 list-disc">
                  <li>Die Kategorie &bdquo;{deleteInfo.title}&ldquo;</li>
                  {deleteInfo.subcategoryCount > 0 && (
                    <li>{deleteInfo.subcategoryCount} Unterkategorie{deleteInfo.subcategoryCount !== 1 && "n"}</li>
                  )}
                  {deleteInfo.postCount > 0 && (
                    <li>{deleteInfo.postCount} Beitrag{deleteInfo.postCount !== 1 && "e" }</li>
                  )}
                </ul>
                {deleteInfo.postCount > 0 && (
                  <p className="text-red-600 text-xs mt-2">
                    Tipp: Du kannst Beiträge vorher mit dem <ArrowRightLeft className="w-3 h-3 inline" /> Button in eine andere Kategorie verschieben.
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => { setDeleteTarget(null); setDeleteInfo(null); }}
                className="flex-1 px-4 py-2 rounded-lg text-sm border border-border/60 text-muted-foreground hover:text-foreground transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting || deleteLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Endgültig löschen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Move Posts Dialog ─── */}
      {moveSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setMoveSource(null)}>
          <div
            className="bg-card border border-border/60 rounded-xl shadow-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <ArrowRightLeft className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Beiträge verschieben</h3>
                <p className="text-sm text-muted-foreground">
                  {moveSource._count.posts} Beitrag{moveSource._count.posts !== 1 && "e"} aus &bdquo;{moveSource.title}&ldquo;
                </p>
              </div>
            </div>

            <div className="mb-4 space-y-2">
              <Label>Verschieben nach:</Label>
              <select
                value={moveTargetId}
                onChange={(e) => setMoveTargetId(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Ziel-Kategorie wählen...</option>
                {categories
                  .filter((c) => c.id !== moveSource.id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {catLabel(c)}
                    </option>
                  ))}
              </select>
            </div>

            {moveTargetId && (
              <div className="mb-4 p-3 rounded-lg bg-accent/50 text-sm text-foreground">
                <strong>{moveSource._count.posts}</strong> Beitrag{moveSource._count.posts !== 1 && "e"} werden von{" "}
                <strong>{moveSource.title}</strong> nach{" "}
                <strong>{categories.find((c) => c.id === moveTargetId)?.title}</strong> verschoben.
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setMoveSource(null)}
                className="flex-1 px-4 py-2 rounded-lg text-sm border border-border/60 text-muted-foreground hover:text-foreground transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleMove}
                disabled={moving || !moveTargetId}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {moving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRightLeft className="w-4 h-4" />
                )}
                Verschieben
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
