"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  ImageIcon,
  Film,
  FileText,
  Upload,
  Loader2,
  Trash2,
  Copy,
  Check,
  X,
  Search,
  AlertTriangle,
  ExternalLink,
  Pencil,
} from "lucide-react";

type MediaFile = {
  name: string;
  url: string;
  size: number;
  type: "image" | "video";
  createdAt: string;
  usedIn: { id: string; title: string }[];
};

type FilterType = "all" | "image" | "video";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<MediaFile | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameName, setRenameName] = useState("");
  const [renameError, setRenameError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchMedia = useCallback(async () => {
    const res = await fetch("/api/media");
    const data = await res.json();
    setFiles(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  async function handleUpload(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);

    for (const file of Array.from(fileList)) {
      const formData = new FormData();
      formData.append("image", file);
      await fetch("/api/upload", { method: "POST", body: formData });
    }

    await fetchMedia();
    setUploading(false);
  }

  async function handleDelete(fileName: string) {
    setDeleting(true);
    await fetch(`/api/media?file=${encodeURIComponent(fileName)}`, {
      method: "DELETE",
    });
    setSelected(null);
    setConfirmDelete(false);
    await fetchMedia();
    setDeleting(false);
  }

  function startRename(file: MediaFile) {
    const nameWithoutExt = file.name.replace(/\.[^.]+$/, "");
    setRenameName(nameWithoutExt);
    setRenaming(true);
    setRenameError("");
  }

  async function handleRename(oldName: string) {
    const ext = oldName.substring(oldName.lastIndexOf("."));
    const newFullName = renameName + ext;

    if (newFullName === oldName) {
      setRenaming(false);
      return;
    }

    const res = await fetch("/api/media", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldName, newName: newFullName }),
    });

    const data = await res.json();

    if (!res.ok) {
      setRenameError(data.error || "Fehler beim Umbenennen");
      return;
    }

    setRenaming(false);
    setRenameError("");
    await fetchMedia();
    // Update selected to reflect new name
    setSelected((prev) =>
      prev ? { ...prev, name: data.newName, url: `/uploads/${data.newName}` } : null
    );
  }

  function handleCopyUrl(url: string) {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleCleanupUnused() {
    const unused = files.filter((f) => f.usedIn.length === 0);
    if (unused.length === 0) return;
    if (!window.confirm(`${unused.length} unbenutzte Datei(en) wirklich löschen?`)) return;

    setDeleting(true);
    for (const f of unused) {
      await fetch(`/api/media?file=${encodeURIComponent(f.name)}`, {
        method: "DELETE",
      });
    }
    setSelected(null);
    await fetchMedia();
    setDeleting(false);
  }

  const filtered = files.filter((f) => {
    if (filter !== "all" && f.type !== filter) return false;
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const unusedCount = files.filter((f) => f.usedIn.length === 0).length;
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Medienverwaltung</h1>
        <div className="flex items-center gap-2">
          {unusedCount > 0 && (
            <button
              onClick={handleCleanupUnused}
              disabled={deleting}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {unusedCount} unbenutzte aufräumen
            </button>
          )}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Hochladen
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*,.pdf"
            multiple
            onChange={(e) => handleUpload(e.target.files)}
            className="hidden"
          />
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
        <span>{files.length} Dateien</span>
        <span>{formatFileSize(totalSize)} gesamt</span>
        <span>{files.filter((f) => f.type === "image").length} Bilder</span>
        <span>{files.filter((f) => f.type === "video").length} Videos</span>
      </div>

      {/* Filter & Search */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex gap-1 bg-accent/50 rounded-lg p-0.5">
          {(["all", "image", "video"] as FilterType[]).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filter === t
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "all" ? "Alle" : t === "image" ? "Bilder" : "Videos"}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Datei suchen..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-sm"
          />
        </div>
      </div>

      <div className="flex gap-6">
        {/* Grid */}
        <div
          className={`flex-1 ${isDragging ? "ring-2 ring-primary ring-offset-2 rounded-xl" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleUpload(e.dataTransfer.files);
          }}
        >
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground border-2 border-dashed border-border/60 rounded-xl">
              <ImageIcon className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">
                {files.length === 0
                  ? "Noch keine Medien. Lade Dateien hoch oder ziehe sie hierher."
                  : "Keine Dateien gefunden."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
              {filtered.map((file) => (
                <button
                  key={file.url}
                  onClick={() => { setSelected(selected?.url === file.url ? null : file); setRenaming(false); setRenameError(""); setConfirmDelete(false); }}
                  className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    selected?.url === file.url
                      ? "border-primary shadow-lg scale-[1.02]"
                      : "border-border/40 hover:border-border hover:shadow-md"
                  }`}
                >
                  {file.type === "video" ? (
                    <div className="w-full h-full bg-muted flex flex-col items-center justify-center">
                      <Film className="w-10 h-10 text-muted-foreground/40" />
                    </div>
                  ) : file.name.endsWith(".pdf") ? (
                    <div className="w-full h-full bg-muted flex flex-col items-center justify-center">
                      <FileText className="w-10 h-10 text-muted-foreground/40" />
                    </div>
                  ) : (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Usage badge */}
                  {file.usedIn.length > 0 && (
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full bg-emerald-500 text-[9px] text-white font-medium">
                      {file.usedIn.length}x
                    </div>
                  )}
                  {file.usedIn.length === 0 && (
                    <div className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-orange-400" />
                  )}

                  {/* Bottom info */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5 pt-4">
                    <p className="text-[10px] text-white truncate">{file.name}</p>
                    <p className="text-[9px] text-white/60">{formatFileSize(file.size)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Drag overlay */}
          {isDragging && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/10 pointer-events-none">
              <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-card border border-primary shadow-2xl">
                <Upload className="w-6 h-6 text-primary" />
                <span className="font-medium text-foreground">Dateien hier ablegen</span>
              </div>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="w-80 shrink-0 bg-card border border-border/60 rounded-xl p-4 self-start sticky top-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground text-sm">Details</h3>
              <button
                onClick={() => { setSelected(null); setConfirmDelete(false); }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Preview */}
            <div className="rounded-lg overflow-hidden border border-border/40 mb-4">
              {selected.type === "video" ? (
                <video
                  src={selected.url}
                  controls
                  className="w-full aspect-video bg-black"
                />
              ) : (
                <img
                  src={selected.url}
                  alt={selected.name}
                  className="w-full max-h-48 object-contain bg-muted/30"
                />
              )}
            </div>

            {/* File info */}
            <div className="space-y-2 mb-4 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>
                {renaming ? (
                  <div className="mt-1 space-y-1.5">
                    <div className="flex gap-1.5">
                      <input
                        value={renameName}
                        onChange={(e) => { setRenameName(e.target.value); setRenameError(""); }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRename(selected.name);
                          if (e.key === "Escape") { setRenaming(false); setRenameError(""); }
                        }}
                        autoFocus
                        className="flex-1 min-w-0 rounded-md border border-input bg-background px-2 py-1 text-sm"
                      />
                      <span className="self-center text-xs text-muted-foreground">
                        {selected.name.substring(selected.name.lastIndexOf("."))}
                      </span>
                    </div>
                    {renameError && (
                      <p className="text-xs text-red-600">{renameError}</p>
                    )}
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleRename(selected.name)}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
                      >
                        <Check className="w-3 h-3" />
                        Speichern
                      </button>
                      <button
                        onClick={() => { setRenaming(false); setRenameError(""); }}
                        className="flex-1 px-2 py-1 rounded-md border border-border/60 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Abbrechen
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <p className="font-medium text-foreground break-all flex-1">{selected.name}</p>
                    <button
                      onClick={() => startRename(selected)}
                      className="shrink-0 p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                      title="Umbenennen"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex gap-4">
                <div>
                  <span className="text-muted-foreground">Größe:</span>
                  <p className="font-medium text-foreground">{formatFileSize(selected.size)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Typ:</span>
                  <p className="font-medium text-foreground">{selected.type === "image" ? "Bild" : "Video"}</p>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Hochgeladen:</span>
                <p className="font-medium text-foreground">{formatDate(selected.createdAt)}</p>
              </div>
            </div>

            {/* Copy URL */}
            <button
              onClick={() => handleCopyUrl(selected.url)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border/60 text-sm hover:bg-accent transition-colors mb-3"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-600">Kopiert!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  URL kopieren
                </>
              )}
            </button>

            {/* Usage info */}
            <div className="mb-4">
              <span className="text-sm text-muted-foreground">
                Verwendet in {selected.usedIn.length} Beitrag{selected.usedIn.length !== 1 ? "en" : ""}:
              </span>
              {selected.usedIn.length > 0 ? (
                <div className="mt-1.5 space-y-1">
                  {selected.usedIn.map((post) => (
                    <a
                      key={post.id}
                      href={`/admin/posts/${post.id}`}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-accent/50 text-sm text-foreground hover:bg-accent transition-colors"
                    >
                      <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0" />
                      <span className="truncate">{post.title}</span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-orange-600">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Wird nirgends verwendet
                </p>
              )}
            </div>

            {/* Delete */}
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Löschen
              </button>
            ) : (
              <div className="space-y-2">
                {selected.usedIn.length > 0 && (
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      Diese Datei wird in {selected.usedIn.length} Beitrag{selected.usedIn.length !== 1 ? "en" : ""} verwendet!
                      Nach dem Löschen werden die Bilder dort nicht mehr angezeigt.
                    </span>
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground border border-border/60 transition-colors"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={() => handleDelete(selected.name)}
                    disabled={deleting}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
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
            )}
          </div>
        )}
      </div>
    </div>
  );
}
