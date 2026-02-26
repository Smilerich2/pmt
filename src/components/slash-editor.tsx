"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Heading2,
  Heading3,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  Info,
  ChevronDown,
  HelpCircle,
  Table,
  List,
  ListOrdered,
  Image,
  Code,
  Minus,
  Upload,
  FolderOpen,
  Film,
  Loader2,
  X,
  Check,
  CircleHelp,
  Copy,
  CheckCheck,
  Sigma,
  PanelLeftClose,
  PanelLeft,
  Eye,
  Pencil,
  Play,
  type LucideIcon,
} from "lucide-react";

import { MarkdownRenderer } from "./markdown-renderer";

// ─── Types ───

type SlashCommand = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  category: string;
  action: "insert" | "modal";
  template?: string;
  modalType?: string;
};

type MediaFile = {
  name: string;
  url: string;
  size: number;
  type: "image" | "video";
  createdAt: string;
};

// ─── Slash Commands ───

const slashCommands: SlashCommand[] = [
  {
    id: "h2",
    label: "Überschrift 2",
    description: "Große Abschnittsüberschrift",
    icon: Heading2,
    category: "Text",
    action: "insert",
    template: "## Überschrift\n",
  },
  {
    id: "h3",
    label: "Überschrift 3",
    description: "Kleinere Unterüberschrift",
    icon: Heading3,
    category: "Text",
    action: "insert",
    template: "### Überschrift\n",
  },
  {
    id: "ul",
    label: "Aufzählung",
    description: "Ungeordnete Liste",
    icon: List,
    category: "Text",
    action: "insert",
    template: "- Punkt 1\n- Punkt 2\n- Punkt 3\n",
  },
  {
    id: "ol",
    label: "Nummerierung",
    description: "Nummerierte Liste",
    icon: ListOrdered,
    category: "Text",
    action: "insert",
    template: "1. Schritt 1\n2. Schritt 2\n3. Schritt 3\n",
  },
  {
    id: "code",
    label: "Code-Block",
    description: "Code mit Syntax-Highlighting",
    icon: Code,
    category: "Text",
    action: "insert",
    template: "```\nCode hier...\n```\n",
  },
  {
    id: "hr",
    label: "Trennlinie",
    description: "Horizontale Trennlinie",
    icon: Minus,
    category: "Text",
    action: "insert",
    template: "---\n",
  },
  {
    id: "merke",
    label: "Merke-Box",
    description: "Wichtiger Hinweis zum Merken",
    icon: BookOpen,
    category: "Blöcke",
    action: "insert",
    template: ":::merke\nHier steht der wichtige Hinweis.\n:::\n",
  },
  {
    id: "tipp",
    label: "Tipp-Box",
    description: "Hilfreicher Tipp oder Eselsbrücke",
    icon: Lightbulb,
    category: "Blöcke",
    action: "insert",
    template: ":::tipp\nHier steht der hilfreiche Tipp.\n:::\n",
  },
  {
    id: "warnung",
    label: "Warnung-Box",
    description: "Warnung oder Sicherheitshinweis",
    icon: AlertTriangle,
    category: "Blöcke",
    action: "insert",
    template: ":::warnung\nHier steht die Warnung.\n:::\n",
  },
  {
    id: "info",
    label: "Info-Box",
    description: "Zusätzliche Information",
    icon: Info,
    category: "Blöcke",
    action: "insert",
    template: ":::info\nHier steht die Info.\n:::\n",
  },
  {
    id: "accordion",
    label: "Aufklappbar",
    description: "Auf-/zuklappbarer Bereich",
    icon: ChevronDown,
    category: "Blöcke",
    action: "insert",
    template: "+++Titel des aufklappbaren Bereichs\nHier steht der versteckte Inhalt.\n+++\n",
  },
  {
    id: "quiz",
    label: "Quiz-Frage",
    description: "Multiple-Choice Lernfrage",
    icon: HelpCircle,
    category: "Blöcke",
    action: "insert",
    template:
      "???Hier steht die Frage?\n[ ] Falsche Antwort A\n[x] Richtige Antwort B\n[ ] Falsche Antwort C\n>>>Hier steht die Erklärung zur richtigen Antwort.\n???\n",
  },
  {
    id: "table",
    label: "Tabelle",
    description: "Tabelle mit Zeilen und Spalten",
    icon: Table,
    category: "Medien",
    action: "modal",
    modalType: "table",
  },
  {
    id: "bild",
    label: "Bild einfügen",
    description: "Bild mit Größe, Position & Zuschnitt",
    icon: Image,
    category: "Medien",
    action: "modal",
    modalType: "image",
  },
  {
    id: "medien",
    label: "Medienbibliothek",
    description: "Aus vorhandenen Uploads wählen",
    icon: FolderOpen,
    category: "Medien",
    action: "modal",
    modalType: "media",
  },
  {
    id: "video",
    label: "Video einfügen",
    description: "Video hochladen oder URL einfügen",
    icon: Film,
    category: "Medien",
    action: "modal",
    modalType: "video",
  },
  {
    id: "formel",
    label: "Formel (Block)",
    description: "Mathematische Formel als eigener Block",
    icon: Sigma,
    category: "Blöcke",
    action: "insert",
    template: "$$\nx = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}\n$$\n",
  },
  {
    id: "formel-inline",
    label: "Formel (Inline)",
    description: "Formel innerhalb des Fließtexts",
    icon: Sigma,
    category: "Blöcke",
    action: "insert",
    template: "$E = mc^2$",
  },
  {
    id: "demo",
    label: "Interaktive Demo",
    description: "Eingebettete React-Komponente als iframe",
    icon: Play,
    category: "Blöcke",
    action: "modal",
    modalType: "demo",
  },
];

// ─── Upload Helper ───

async function uploadFile(file: File): Promise<string | null> {
  const formData = new FormData();
  formData.append("image", file);
  try {
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (data.success === 1) return data.file.url;
  } catch {
    // ignore
  }
  return null;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

// ─── Table Modal ───

function TableModal({
  onInsert,
  onClose,
}: {
  onInsert: (md: string) => void;
  onClose: () => void;
}) {
  const [cols, setCols] = useState(3);
  const [rows, setRows] = useState(3);
  const [headers, setHeaders] = useState(["Spalte 1", "Spalte 2", "Spalte 3"]);

  useEffect(() => {
    setHeaders((prev) => {
      const next = [...prev];
      while (next.length < cols) next.push(`Spalte ${next.length + 1}`);
      return next.slice(0, cols);
    });
  }, [cols]);

  function generate() {
    const headerRow = "| " + headers.join(" | ") + " |";
    const separator = "| " + headers.map(() => "---").join(" | ") + " |";
    const dataRows = Array.from({ length: rows }, () =>
      "| " + headers.map(() => " ").join(" | ") + " |"
    ).join("\n");
    onInsert(`${headerRow}\n${separator}\n${dataRows}\n`);
  }

  return (
    <ModalShell title="Tabelle erstellen" onClose={onClose}>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-sm text-muted-foreground">Spalten</label>
          <input
            type="number"
            min={1}
            max={8}
            value={cols}
            onChange={(e) => setCols(Number(e.target.value))}
            className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Zeilen</label>
          <input
            type="number"
            min={1}
            max={20}
            value={rows}
            onChange={(e) => setRows(Number(e.target.value))}
            className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <label className="text-sm text-muted-foreground">Spaltenüberschriften</label>
        {headers.map((h, i) => (
          <input
            key={i}
            value={h}
            onChange={(e) => {
              const next = [...headers];
              next[i] = e.target.value;
              setHeaders(next);
            }}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        ))}
      </div>
      <ModalFooter onClose={onClose} onConfirm={generate} label="Einfügen" />
    </ModalShell>
  );
}

// ─── Image Upload Modal (with :::bild config) ───

const sizeOptions = [
  { value: "small", label: "Klein (33%)" },
  { value: "medium", label: "Mittel (50%)" },
  { value: "large", label: "Groß (75%)" },
  { value: "full", label: "Volle Breite" },
];

const positionOptions = [
  { value: "left", label: "Links" },
  { value: "center", label: "Zentriert" },
  { value: "right", label: "Rechts" },
];

const ratioOptions = [
  { value: "original", label: "Original" },
  { value: "16:9", label: "16:9" },
  { value: "4:3", label: "4:3" },
  { value: "3:2", label: "3:2" },
  { value: "1:1", label: "1:1" },
];

function ImageModal({
  onInsert,
  onClose,
}: {
  onInsert: (md: string) => void;
  onClose: () => void;
}) {
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
  const [size, setSize] = useState("full");
  const [position, setPosition] = useState("center");
  const [ratio, setRatio] = useState("original");
  const [rounded, setRounded] = useState(true);
  const [shadow, setShadow] = useState(false);
  const [border, setBorder] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const result = await uploadFile(file);
    if (result) setUrl(result);
    setUploading(false);
  }

  function generateBlock() {
    const lines = [`:::bild[${url}]`];
    if (alt) lines.push(`alt: ${alt}`);
    if (caption) lines.push(`caption: ${caption}`);
    if (size !== "full") lines.push(`size: ${size}`);
    if (position !== "center") lines.push(`position: ${position}`);
    if (ratio !== "original") lines.push(`ratio: ${ratio}`);
    if (rounded) lines.push(`rounded: true`);
    if (shadow) lines.push(`shadow: true`);
    if (border) lines.push(`border: true`);
    lines.push(":::");
    return lines.join("\n") + "\n";
  }

  // Preview classes
  const previewRatio: Record<string, string> = {
    "16:9": "aspect-video",
    "4:3": "aspect-[4/3]",
    "3:2": "aspect-[3/2]",
    "1:1": "aspect-square",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-card border border-border/60 rounded-xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <h3 className="font-semibold text-foreground">Bild einfügen & konfigurieren</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Upload zone */}
          <div
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 h-24 rounded-lg border-2 border-dashed border-border/60 hover:border-primary/50 cursor-pointer transition-colors"
          >
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            ) : url ? (
              <div className="flex items-center gap-2 text-sm text-emerald-600">
                <Check className="w-4 h-4" />
                Bild hochgeladen
              </div>
            ) : (
              <>
                <Upload className="w-6 h-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Klicke zum Hochladen</span>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />

          {/* URL input */}
          <div>
            <label className="text-sm text-muted-foreground">Oder Bild-URL</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://... oder /uploads/bild.jpg"
              className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          {/* Preview */}
          {url && (
            <div className={`overflow-hidden ${rounded ? "rounded-xl" : ""} ${shadow ? "shadow-md" : ""} ${border ? "border border-border/60" : ""}`}>
              <img
                src={url}
                alt={alt || "Vorschau"}
                className={`w-full object-cover ${ratio !== "original" ? previewRatio[ratio] || "" : "max-h-40"}`}
              />
            </div>
          )}

          {/* Alt text & caption */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground">Alt-Text</label>
              <input
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                placeholder="Was zeigt das Bild?"
                className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Bildunterschrift</label>
              <input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Quelle, Beschreibung..."
                className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Size */}
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Größe</label>
            <div className="flex gap-1.5">
              {sizeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSize(opt.value)}
                  className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    size === opt.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Position */}
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Position</label>
            <div className="flex gap-1.5">
              {positionOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPosition(opt.value)}
                  className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    position === opt.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect ratio */}
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Seitenverhältnis</label>
            <div className="flex gap-1.5">
              {ratioOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRatio(opt.value)}
                  className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    ratio === opt.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Style toggles */}
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Stil</label>
            <div className="flex gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rounded}
                  onChange={(e) => setRounded(e.target.checked)}
                  className="rounded border-border"
                />
                <span className="text-sm">Abgerundet</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shadow}
                  onChange={(e) => setShadow(e.target.checked)}
                  className="rounded border-border"
                />
                <span className="text-sm">Schatten</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={border}
                  onChange={(e) => setBorder(e.target.checked)}
                  className="rounded border-border"
                />
                <span className="text-sm">Rahmen</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-border/40">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={() => onInsert(generateBlock())}
            disabled={!url}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40"
          >
            Einfügen
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Video Modal ───

function VideoModal({
  onInsert,
  onClose,
}: {
  onInsert: (md: string) => void;
  onClose: () => void;
}) {
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const result = await uploadFile(file);
    if (result) setUrl(result);
    setUploading(false);
  }

  // Detect if YouTube URL
  function isYouTube(u: string) {
    return u.includes("youtube.com") || u.includes("youtu.be");
  }

  function getMarkdown() {
    if (isYouTube(url)) {
      // Extract video ID and create embed-friendly link
      return `[![Video](https://img.youtube.com/vi/${extractYTId(url)}/maxresdefault.jpg)](${url})\n`;
    }
    // Local video
    return `<video src="${url}" controls class="rounded-lg w-full"></video>\n`;
  }

  function extractYTId(u: string) {
    const match = u.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : "";
  }

  return (
    <ModalShell title="Video einfügen" onClose={onClose}>
      <div
        onClick={() => fileRef.current?.click()}
        className="flex flex-col items-center justify-center gap-2 h-28 rounded-lg border-2 border-dashed border-border/60 hover:border-primary/50 cursor-pointer transition-colors mb-4"
      >
        {uploading ? (
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        ) : (
          <>
            <Film className="w-6 h-6 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Video-Datei hochladen
            </span>
          </>
        )}
      </div>
      <input ref={fileRef} type="file" accept="video/*" onChange={handleFileUpload} className="hidden" />

      <div className="mb-4">
        <label className="text-sm text-muted-foreground">Oder YouTube / Video-URL</label>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=... oder /uploads/video.mp4"
          className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      {url && isYouTube(url) && extractYTId(url) && (
        <div className="mb-4 rounded-lg overflow-hidden border border-border/60">
          <img
            src={`https://img.youtube.com/vi/${extractYTId(url)}/hqdefault.jpg`}
            alt="YouTube Vorschau"
            className="w-full h-32 object-cover"
          />
        </div>
      )}

      <ModalFooter
        onClose={onClose}
        onConfirm={() => onInsert(getMarkdown())}
        label="Einfügen"
        disabled={!url}
      />
    </ModalShell>
  );
}

// ─── Media Library Modal ───

function MediaLibraryModal({
  onInsert,
  onClose,
}: {
  onInsert: (md: string) => void;
  onClose: () => void;
}) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/media")
      .then((r) => r.json())
      .then((data) => {
        setFiles(data);
        setLoading(false);
      });
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const result = await uploadFile(file);
    if (result) {
      // Refresh the list
      const res = await fetch("/api/media");
      setFiles(await res.json());
      setSelected(result);
    }
    setUploading(false);
  }

  function handleInsert() {
    if (!selected) return;
    const file = files.find((f) => f.url === selected);
    if (file?.type === "video") {
      onInsert(`<video src="${selected}" controls class="rounded-lg w-full"></video>\n`);
    } else {
      onInsert(`![](${selected})\n`);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-card border border-border/60 rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <h3 className="font-semibold text-foreground">Medienbibliothek</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              Hochladen
            </button>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleUpload} className="hidden" />
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <FolderOpen className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-sm">Noch keine Medien hochgeladen.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {files.map((file) => (
                <button
                  key={file.url}
                  onClick={() => setSelected(file.url === selected ? null : file.url)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selected === file.url
                      ? "border-primary shadow-md"
                      : "border-border/40 hover:border-border"
                  }`}
                >
                  {file.type === "video" ? (
                    <div className="w-full h-full bg-muted flex flex-col items-center justify-center">
                      <Film className="w-8 h-8 text-muted-foreground/50" />
                      <span className="text-[10px] text-muted-foreground mt-1 px-1 truncate max-w-full">
                        {file.name}
                      </span>
                    </div>
                  ) : (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {selected === file.url && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 px-1.5 py-1">
                    <p className="text-[10px] text-white truncate">{file.name}</p>
                    <p className="text-[9px] text-white/60">{formatFileSize(file.size)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-border/40">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={handleInsert}
            disabled={!selected}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40"
          >
            Einfügen
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Demo Modal ───

const AVAILABLE_DEMOS = [
  { id: "logic-simulator", label: "Logik-Simulator", defaultHeight: 600 },
];

function DemoModal({
  onInsert,
  onClose,
}: {
  onInsert: (md: string) => void;
  onClose: () => void;
}) {
  const [selectedId, setSelectedId] = useState(AVAILABLE_DEMOS[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [height, setHeight] = useState(
    AVAILABLE_DEMOS[0]?.defaultHeight ?? 500
  );

  const quickHeights = [400, 500, 600, 800];

  function generateBlock() {
    const lines = [`:::demo[${selectedId}]`];
    lines.push(`height: ${height}`);
    if (title.trim()) lines.push(`title: ${title.trim()}`);
    lines.push(":::");
    return lines.join("\n") + "\n";
  }

  return (
    <ModalShell title="Interaktive Demo einfügen" onClose={onClose}>
      <div className="space-y-4">
        {/* Demo selection */}
        <div>
          <label className="text-sm text-muted-foreground mb-1.5 block">
            Demo auswählen
          </label>
          <div className="space-y-1.5">
            {AVAILABLE_DEMOS.map((demo) => (
              <button
                key={demo.id}
                type="button"
                onClick={() => {
                  setSelectedId(demo.id);
                  setHeight(demo.defaultHeight);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border-2 text-left transition-colors ${
                  selectedId === demo.id
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border/60 hover:border-border text-foreground/80"
                }`}
              >
                <Play
                  className={`w-4 h-4 shrink-0 ${
                    selectedId === demo.id ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <div>
                  <p className="text-sm font-medium">{demo.label}</p>
                  <p className="text-xs text-muted-foreground font-mono">{demo.id}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="text-sm text-muted-foreground">
            Titel <span className="opacity-60">(optional)</span>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="z. B. Logik-Gatter ausprobieren"
            className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        {/* Height */}
        <div>
          <label className="text-sm text-muted-foreground mb-1.5 block">
            Höhe (px)
          </label>
          <div className="flex gap-1.5 mb-2">
            {quickHeights.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setHeight(h)}
                className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  height === h
                    ? "bg-primary text-primary-foreground"
                    : "bg-accent/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                {h}
              </button>
            ))}
          </div>
          <input
            type="number"
            min={200}
            max={1200}
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        {/* Preview */}
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">
            Vorschau
          </label>
          <pre className="bg-foreground/[0.04] border border-border/40 rounded-lg p-3 text-xs font-mono text-foreground/70 whitespace-pre-wrap">
            {generateBlock()}
          </pre>
        </div>
      </div>
      <div className="mt-5">
        <ModalFooter
          onClose={onClose}
          onConfirm={() => onInsert(generateBlock())}
          label="Einfügen"
          disabled={!selectedId}
        />
      </div>
    </ModalShell>
  );
}

// ─── Shared Modal Components ───

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-card border border-border/60 rounded-xl shadow-xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-semibold text-foreground mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
}

function ModalFooter({
  onClose,
  onConfirm,
  label,
  disabled,
}: {
  onClose: () => void;
  onConfirm: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex justify-end gap-2">
      <button
        onClick={onClose}
        className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Abbrechen
      </button>
      <button
        onClick={onConfirm}
        disabled={disabled}
        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40"
      >
        {label}
      </button>
    </div>
  );
}

// ─── Block Help Overlay ───

const blockDocs = [
  {
    name: "Callout-Boxen",
    description: "Farbige Hinweisboxen für wichtige Informationen. Vier Varianten: merke (gelb), tipp (grün), warnung (rot), info (blau).",
    variants: ["merke", "tipp", "warnung", "info"],
    syntax: `:::merke
Hier steht der wichtige Hinweis.
:::

:::tipp
Ein hilfreicher Tipp.
:::

:::warnung
Eine Warnung oder Sicherheitshinweis.
:::

:::info
Zusätzliche Information.
:::`,
    icon: BookOpen,
  },
  {
    name: "Aufklappbar (Accordion)",
    description: "Auf- und zuklappbarer Bereich. Ideal für optionale Details, FAQ oder zusätzliche Erklärungen die nicht sofort sichtbar sein müssen.",
    syntax: `+++Titel des aufklappbaren Bereichs
Hier steht der versteckte Inhalt.
Kann auch mehrere Zeilen haben.
+++`,
    icon: ChevronDown,
  },
  {
    name: "Quiz-Frage",
    description: "Multiple-Choice Lernfrage mit Auswertung. Markiere die richtige Antwort mit [x], falsche mit [ ]. Optional eine Erklärung mit >>> am Anfang.",
    syntax: `???Wie heißt die Hauptstadt von Deutschland?
[ ] München
[x] Berlin
[ ] Hamburg
[ ] Köln
>>>Berlin ist seit 1990 die Hauptstadt des wiedervereinigten Deutschlands.
???`,
    icon: HelpCircle,
  },
  {
    name: "Bild-Block",
    description: "Bild mit konfigurierbarer Größe, Position, Seitenverhältnis und Stil. Alle Eigenschaften sind optional — nur die Bild-URL ist erforderlich.",
    syntax: `:::bild[/uploads/foto.jpg]
alt: Beschreibung des Bildes
caption: Bildunterschrift
size: medium
position: center
ratio: 16:9
rounded: true
shadow: true
border: false
:::`,
    icon: Image,
    properties: [
      { key: "alt", desc: "Alternativtext" },
      { key: "caption", desc: "Bildunterschrift" },
      { key: "size", desc: "small | medium | large | full" },
      { key: "position", desc: "left | center | right" },
      { key: "ratio", desc: "original | 16:9 | 4:3 | 3:2 | 1:1" },
      { key: "rounded", desc: "true | false — Abgerundete Ecken" },
      { key: "shadow", desc: "true | false — Schatten" },
      { key: "border", desc: "true | false — Rahmen" },
    ],
  },
  {
    name: "Tabelle",
    description: "Standard Markdown-Tabelle mit Spaltenüberschriften und Trennlinie.",
    syntax: `| Spalte 1 | Spalte 2 | Spalte 3 |
| --- | --- | --- |
| Zelle | Zelle | Zelle |
| Zelle | Zelle | Zelle |`,
    icon: Table,
  },
  {
    name: "Mathematische Formeln (KaTeX)",
    description: "LaTeX-Syntax für Formeln. Inline mit einzelnen $-Zeichen, Block-Formeln mit doppelten $$. Unterstützt Brüche, Wurzeln, Summen, Integrale, griechische Buchstaben und mehr.",
    syntax: `Inline: $E = mc^2$ oder $\\alpha + \\beta = \\gamma$

Block-Formel:
$$
x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$`,
    icon: Sigma,
    properties: [
      { key: "\\frac{a}{b}", desc: "Bruch: a/b" },
      { key: "\\sqrt{x}", desc: "Wurzel" },
      { key: "x^{2}", desc: "Hochgestellt (Potenz)" },
      { key: "x_{i}", desc: "Tiefgestellt (Index)" },
      { key: "\\sum_{i=0}^{n}", desc: "Summenzeichen" },
      { key: "\\int_{a}^{b}", desc: "Integral" },
      { key: "\\alpha \\beta \\gamma", desc: "Griechische Buchstaben" },
      { key: "\\pi \\theta \\omega", desc: "Weitere: Pi, Theta, Omega" },
      { key: "\\times \\div \\pm", desc: "Mal, Geteilt, Plus-Minus" },
      { key: "\\leq \\geq \\neq", desc: "Kleiner-gleich, Größer-gleich, Ungleich" },
      { key: "\\infty", desc: "Unendlich" },
      { key: "\\vec{F}", desc: "Vektor mit Pfeil" },
    ],
  },
  {
    name: "Standard Markdown",
    description: "Alle üblichen Markdown-Elemente werden unterstützt.",
    syntax: `# Überschrift 1
## Überschrift 2
### Überschrift 3

**Fett**, *Kursiv*, ~~Durchgestrichen~~

- Aufzählung
- Weiterer Punkt

1. Nummerierte Liste
2. Zweiter Punkt

> Zitat / Blockquote

\`Inline-Code\` und Code-Blöcke:
\`\`\`
Code hier
\`\`\`

[Link-Text](https://url.de)
![Alt-Text](bild-url.jpg)

---  (Trennlinie)`,
    icon: Code,
  },
];

function generateAIPrompt(): string {
  return `Du bist ein Experte für die Erstellung von Lernmaterialien für Auszubildende zum Packmitteltechnologen. Du erstellst Inhalte in einem erweiterten Markdown-Format für eine Lernplattform.

# AUSGABEFORMAT

WICHTIG: Gib AUSSCHLIESSLICH den Markdown-Inhalt zurück. KEINE Code-Fences (\`\`\`), KEINE Erklärungen, KEIN "Hier ist der Inhalt:", KEIN Wrapper. Der Text den du ausgibst wird 1:1 in den Editor eingefügt.

# VERFÜGBARE BLÖCKE

Du hast neben Standard-Markdown folgende spezielle Blöcke zur Verfügung:

## 1. Callout-Boxen (4 Varianten)

:::merke
Wichtige Fakten, Definitionen, Kernaussagen die man sich einprägen muss.
:::

:::tipp
Eselsbrücken, Praxistipps, hilfreiche Hinweise für den Arbeitsalltag.
:::

:::warnung
Sicherheitshinweise, häufige Fehler, Gefahrenquellen.
:::

:::info
Zusatzwissen, Hintergrundinformationen, weiterführende Details.
:::

## 2. Aufklappbare Bereiche

+++Was ist der Unterschied zwischen Wellpappe und Vollpappe?
Wellpappe besteht aus mindestens einer glatten und einer gewellten Papierbahn...
Der versteckte Inhalt kann mehrere Absätze haben.
+++

## 3. Quiz-Fragen (Multiple Choice)

???Welche Wellpappenart hat die höchste Stabilität?
[ ] Einseitige Wellpappe
[ ] Einwellige Wellpappe
[x] Dreiwellige Wellpappe
[ ] Zweiwellige Wellpappe
>>>Dreiwellige Wellpappe (auch Triplex genannt) hat durch ihre drei Wellenlagen die höchste Stabilität und wird für schwere Güter verwendet.
???

Regeln für Quiz: [ ] = falsche Antwort, [x] = richtige Antwort, >>> = Erklärung (optional). Genau eine Antwort muss mit [x] markiert sein.

## 4. Bilder

:::bild[/uploads/beispiel.jpg]
alt: Beschreibung des Bildes
caption: Bildunterschrift oder Quelle
size: medium
position: center
:::

Mögliche Werte: size (small/medium/large/full), position (left/center/right), ratio (original/16:9/4:3/3:2/1:1), rounded (true/false), shadow (true/false), border (true/false). Alle Eigenschaften sind optional.

## 5. Mathematische Formeln (KaTeX/LaTeX)

Inline im Text: Die Formel $E = mc^2$ beschreibt...
Als eigener Block:

$$
F = \\frac{m_1 \\cdot m_2}{r^2} \\cdot G
$$

Wichtige Befehle: \\frac{a}{b} (Bruch), \\sqrt{x} (Wurzel), x^{2} (Hochgestellt), x_{i} (Tiefgestellt), \\alpha \\beta \\gamma (Griechisch), \\times \\div \\pm (Operatoren), \\sum \\int (Summe, Integral)

## 6. Tabellen (Standard Markdown)

| Eigenschaft | Wellpappe | Vollpappe |
| --- | --- | --- |
| Gewicht | Leicht | Schwer |
| Polsterung | Ja | Nein |

# STRUKTUR-VORGABEN

- Beginne JEDEN Beitrag mit einer kurzen Einleitung (2-3 Sätze), die das Thema vorstellt.
- Gliedere mit Überschriften: ## für Hauptabschnitte, ### für Unterabschnitte.
- Setze nach jedem größeren Abschnitt mindestens einen der speziellen Blöcke ein (Callout, Quiz, Accordion).
- Nutze :::merke nach jeder wichtigen Definition oder Kernaussage.
- Nutze :::tipp für Praxishinweise und Eselsbrücken.
- Nutze :::warnung bei Sicherheitsthemen oder häufigen Fehlerquellen.
- Baue pro Beitrag mindestens 2-3 Quiz-Fragen ein, verteilt über den Text (nicht alle am Ende).
- Nutze +++Aufklappbar für optionale Vertiefungen, Exkurse oder "Schon gewusst?"-Abschnitte.
- Verwende Tabellen für Vergleiche und Übersichten.
- Schließe mit einer kurzen Zusammenfassung oder einem :::merke-Block ab.

# SPRACHSTIL

- Schreibe klar, verständlich und auf dem Niveau von Berufsschülern (16-20 Jahre).
- Verwende Fachbegriffe, aber erkläre sie beim ersten Auftreten.
- Kurze Sätze. Aktive Sprache. Direkte Ansprache ("Du").
- Praxisbeispiele aus dem Berufsalltag eines Packmitteltechnologen einbauen.

# BEISPIEL-ANFRAGE

Wenn ich z.B. sage "Schreibe einen Beitrag über Wellpappenarten", dann erstellst du einen vollständigen, gut strukturierten Lernbeitrag mit Einleitung, mehreren Abschnitten, Callout-Boxen, Quiz-Fragen, einer Tabelle und einer Zusammenfassung — alles im oben beschriebenen Markdown-Format.`;
}

function BlockHelpOverlay({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [copiedBlock, setCopiedBlock] = useState<string | null>(null);

  function copyPrompt() {
    navigator.clipboard.writeText(generateAIPrompt());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function copyBlockSyntax(syntax: string, name: string) {
    navigator.clipboard.writeText(syntax);
    setCopiedBlock(name);
    setTimeout(() => setCopiedBlock(null), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-card border border-border/60 rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/40">
          <div>
            <h3 className="font-semibold text-foreground text-lg">Block-Referenz</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Alle verfügbaren Blöcke und ihre Syntax
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyPrompt}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent text-sm font-medium text-foreground hover:bg-accent/80 transition-colors"
              title="KI-Prompt in die Zwischenablage kopieren"
            >
              {copied ? (
                <>
                  <CheckCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-600">Kopiert!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  KI-Prompt kopieren
                </>
              )}
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {blockDocs.map((block) => {
            const Icon = block.icon;
            return (
              <div key={block.name} className="group">
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">{block.name}</h4>
                      {"variants" in block && block.variants && (
                        <div className="flex gap-1">
                          {block.variants.map((v) => (
                            <span key={v} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-accent text-muted-foreground">
                              {v}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{block.description}</p>
                  </div>
                </div>

                {/* Syntax */}
                <div className="relative ml-11">
                  <pre className="bg-foreground/[0.03] border border-border/40 rounded-lg p-3 text-xs font-mono text-foreground/80 overflow-x-auto whitespace-pre-wrap">
                    {block.syntax}
                  </pre>
                  <button
                    onClick={() => copyBlockSyntax(block.syntax, block.name)}
                    className="absolute top-2 right-2 p-1.5 rounded-md bg-card border border-border/40 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Syntax kopieren"
                  >
                    {copiedBlock === block.name ? (
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Properties table */}
                {block.properties && (
                  <div className="ml-11 mt-2 rounded-lg border border-border/40 overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-accent/50">
                          <th className="text-left px-3 py-1.5 font-medium text-foreground">Eigenschaft</th>
                          <th className="text-left px-3 py-1.5 font-medium text-foreground">Werte</th>
                        </tr>
                      </thead>
                      <tbody>
                        {block.properties.map((prop) => (
                          <tr key={prop.key} className="border-t border-border/30">
                            <td className="px-3 py-1.5 font-mono text-primary">{prop.key}</td>
                            <td className="px-3 py-1.5 text-muted-foreground">{prop.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}

          {/* AI Prompt section */}
          <div className="border-t border-border/40 pt-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Copy className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">KI-Prompt</h4>
                <p className="text-sm text-muted-foreground mt-0.5 mb-3">
                  Klicke oben auf &quot;KI-Prompt kopieren&quot; um eine vollständige Zusammenfassung aller Blöcke und Formatierungsregeln in die Zwischenablage zu kopieren.
                  Diesen Text kannst du einer KI (z.B. ChatGPT, Claude) als Systemanweisung geben, damit sie Inhalte im richtigen Format generiert.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Editor ───

export function SlashEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [filter, setFilter] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [slashPos, setSlashPos] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [modal, setModal] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingInline, setUploadingInline] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  // "edit" = nur Editor, "split" = Editor + Vorschau, "preview" = nur Vorschau
  const [viewMode, setViewMode] = useState<"edit" | "split" | "preview">("edit");

  const filtered = slashCommands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(filter.toLowerCase()) ||
      cmd.description.toLowerCase().includes(filter.toLowerCase())
  );

  const grouped = filtered.reduce(
    (acc, cmd) => {
      if (!acc[cmd.category]) acc[cmd.category] = [];
      acc[cmd.category].push(cmd);
      return acc;
    },
    {} as Record<string, SlashCommand[]>
  );

  const flatFiltered = Object.values(grouped).flat();

  // ─── Insert at cursor helper ───

  const insertText = useCallback(
    (text: string, atPos?: number) => {
      const ta = textareaRef.current;
      if (!ta) return;

      const pos = atPos ?? ta.selectionStart;
      const before = value.slice(0, pos);
      const after = value.slice(ta.selectionEnd ?? pos);

      // Ensure newline before if needed
      const prefix = before.length > 0 && !before.endsWith("\n") ? "\n" : "";
      const newValue = before + prefix + text + after;
      onChange(newValue);

      requestAnimationFrame(() => {
        if (ta) {
          const newPos = pos + prefix.length + text.length;
          ta.selectionStart = newPos;
          ta.selectionEnd = newPos;
          ta.focus();
        }
      });
    },
    [value, onChange]
  );

  const insertAtSlash = useCallback(
    (text: string) => {
      const ta = textareaRef.current;
      if (!ta || slashPos === null) return;

      const before = value.slice(0, slashPos);
      const after = value.slice(ta.selectionStart);
      const newValue = before + text + after;
      onChange(newValue);

      requestAnimationFrame(() => {
        if (ta) {
          const pos = slashPos + text.length;
          ta.selectionStart = pos;
          ta.selectionEnd = pos;
          ta.focus();
        }
      });

      setShowMenu(false);
      setFilter("");
      setSlashPos(null);
    },
    [value, onChange, slashPos]
  );

  // ─── Inline upload (drag/paste) ───

  async function handleInlineUpload(file: File) {
    setUploadingInline(true);
    const url = await uploadFile(file);
    setUploadingInline(false);
    if (!url) return;

    const isVideo = file.type.startsWith("video/");
    if (isVideo) {
      insertText(`<video src="${url}" controls class="rounded-lg w-full"></video>\n`);
    } else {
      insertText(`![${file.name}](${url})\n`);
    }
  }

  // ─── Drag & Drop ───

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.startsWith("image/") || file.type.startsWith("video/"))) {
      handleInlineUpload(file);
    }
  }

  // ─── Paste from clipboard ───

  function handlePaste(e: React.ClipboardEvent) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) handleInlineUpload(file);
        return;
      }
    }
  }

  // ─── Slash menu handlers ───

  function handleSelect(cmd: SlashCommand) {
    if (cmd.action === "insert" && cmd.template) {
      insertAtSlash(cmd.template);
    } else if (cmd.action === "modal" && cmd.modalType) {
      setShowMenu(false);
      setFilter("");
      setModal(cmd.modalType);
    }
  }

  function handleModalInsert(md: string) {
    if (slashPos !== null) {
      insertAtSlash(md);
    } else {
      insertText(md);
    }
    setModal(null);
  }

  function calculateMenuPosition() {
    const ta = textareaRef.current;
    if (!ta) return { top: 0, left: 0 };
    const text = ta.value.substring(0, ta.selectionStart);
    const lines = text.split("\n");
    const lineHeight = 22;
    const currentLine = lines.length;
    const top = currentLine * lineHeight - ta.scrollTop + 8;
    return { top: Math.min(top, ta.clientHeight - 40), left: 16 };
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!showMenu) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, flatFiltered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flatFiltered[selectedIndex]) {
        handleSelect(flatFiltered[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      setShowMenu(false);
      setFilter("");
      setSlashPos(null);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const newValue = e.target.value;
    const pos = e.target.selectionStart;
    onChange(newValue);

    const charBefore = pos >= 2 ? newValue[pos - 2] : "\n";
    const currentChar = newValue[pos - 1];

    if (currentChar === "/" && (charBefore === "\n" || pos === 1)) {
      setSlashPos(pos - 1);
      setShowMenu(true);
      setFilter("");
      setSelectedIndex(0);
      setMenuPosition(calculateMenuPosition());
    } else if (showMenu && slashPos !== null) {
      const typed = newValue.slice(slashPos + 1, pos);
      if (typed.includes("\n") || typed.includes(" ")) {
        setShowMenu(false);
        setFilter("");
        setSlashPos(null);
      } else {
        setFilter(typed);
        setSelectedIndex(0);
      }
    }
  }

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showMenu]);

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-accent/50 border border-border/40">
        {viewMode !== "preview" && (
          <>
            <ToolbarButton
              icon={Image}
              label="Bild"
              onClick={() => setModal("image")}
            />
            <ToolbarButton
              icon={Film}
              label="Video"
              onClick={() => setModal("video")}
            />
            <ToolbarButton
              icon={FolderOpen}
              label="Medien"
              onClick={() => setModal("media")}
            />
            <div className="w-px h-5 bg-border/60 mx-1" />
            <ToolbarButton
              icon={Table}
              label="Tabelle"
              onClick={() => setModal("table")}
            />
            <div className="w-px h-5 bg-border/60 mx-1" />
          </>
        )}
        <div className="flex-1" />
        {uploadingInline && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground pr-2">
            <Loader2 className="w-3 h-3 animate-spin" />
            Wird hochgeladen...
          </span>
        )}

        {/* View Mode Toggle */}
        <div className="flex items-center rounded-md bg-background border border-border/40 p-0.5">
          <button
            type="button"
            onClick={() => setViewMode("edit")}
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === "edit"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Nur Editor"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Editor</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("split")}
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === "split"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Editor & Vorschau"
          >
            <PanelLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Split</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("preview")}
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === "preview"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Nur Vorschau"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Vorschau</span>
          </button>
        </div>

        <div className="w-px h-5 bg-border/60 mx-1" />
        <ToolbarButton
          icon={CircleHelp}
          label="Hilfe"
          onClick={() => setShowHelp(true)}
        />
      </div>

      {/* Editor + Preview Area */}
      <div className={`${viewMode === "split" ? "grid grid-cols-2 gap-3" : ""}`}>
        {/* Editor Panel */}
        {viewMode !== "preview" && (
          <div
            className={`relative rounded-lg transition-colors ${
              isDragging ? "ring-2 ring-primary ring-offset-2" : ""
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Drag overlay */}
            {isDragging && (
              <div className="absolute inset-0 z-40 rounded-lg bg-primary/10 border-2 border-dashed border-primary flex items-center justify-center pointer-events-none">
                <div className="flex items-center gap-2 text-primary font-medium">
                  <Upload className="w-5 h-5" />
                  Datei hier ablegen
                </div>
              </div>
            )}

            <textarea
              ref={textareaRef}
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder={"Schreibe deinen Inhalt...\nTippe / für Blöcke · Bilder per Drag & Drop oder Strg+V einfügen"}
              rows={20}
              className={`w-full rounded-lg border border-input bg-background px-4 py-3 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                viewMode === "split" ? "min-h-[500px]" : "min-h-[300px]"
              }`}
            />

            {/* Slash Command Menu */}
            {showMenu && flatFiltered.length > 0 && (
              <div
                ref={menuRef}
                className="absolute z-50 w-72 max-h-80 overflow-y-auto rounded-xl border border-border/60 bg-card shadow-xl"
                style={{ top: menuPosition.top, left: menuPosition.left }}
              >
                <div className="p-2 border-b border-border/40">
                  <p className="text-xs text-muted-foreground px-2 py-1">
                    Blöcke einfügen
                    {filter && (
                      <span className="ml-1 text-primary">
                        — &quot;{filter}&quot;
                      </span>
                    )}
                  </p>
                </div>
                <div className="p-1">
                  {Object.entries(grouped).map(([category, cmds]) => (
                    <div key={category}>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 pt-2 pb-1">
                        {category}
                      </p>
                      {cmds.map((cmd) => {
                        const globalIndex = flatFiltered.indexOf(cmd);
                        return (
                          <button
                            key={cmd.id}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleSelect(cmd);
                            }}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                              globalIndex === selectedIndex
                                ? "bg-accent text-foreground"
                                : "text-foreground/80 hover:bg-accent/50"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-background border border-border/40 flex items-center justify-center shrink-0">
                              <cmd.icon className="w-4 h-4 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">
                                {cmd.label}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {cmd.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Preview Panel */}
        {(viewMode === "split" || viewMode === "preview") && (
          <div
            className={`rounded-lg border border-border/60 bg-card overflow-y-auto ${
              viewMode === "split" ? "min-h-[500px] max-h-[700px]" : "min-h-[300px]"
            }`}
          >
            {value.trim() ? (
              <div className="p-5">
                <MarkdownRenderer content={value} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[200px] text-muted-foreground text-sm">
                Vorschau erscheint hier...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {modal === "table" && (
        <TableModal onInsert={handleModalInsert} onClose={() => setModal(null)} />
      )}
      {modal === "image" && (
        <ImageModal onInsert={handleModalInsert} onClose={() => setModal(null)} />
      )}
      {modal === "video" && (
        <VideoModal onInsert={handleModalInsert} onClose={() => setModal(null)} />
      )}
      {modal === "media" && (
        <MediaLibraryModal onInsert={handleModalInsert} onClose={() => setModal(null)} />
      )}
      {modal === "demo" && (
        <DemoModal onInsert={handleModalInsert} onClose={() => setModal(null)} />
      )}
      {showHelp && (
        <BlockHelpOverlay onClose={() => setShowHelp(false)} />
      )}
    </div>
  );
}

// ─── Toolbar Button ───

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      title={label}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
