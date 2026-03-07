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
  Code2,
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
  Globe,
  Bold,
  Italic,
  Strikethrough,
  Link,
  BookA,
  Music,
  Maximize2,
  Minimize2,
  ImagePlus,
  Columns2,
  ArrowUpDown,
  CopyPlus,
  Focus,
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
  type: "image" | "video" | "audio";
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
    id: "glossar",
    label: "Glossar-Begriff",
    description: "Fachbegriff mit Tooltip-Erklärung",
    icon: BookA,
    category: "Text",
    action: "insert",
    template: "::glossar[Begriff]",
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
    id: "audio",
    label: "Audio einfügen",
    description: "Audiodatei hochladen oder URL einfügen",
    icon: Music,
    category: "Medien",
    action: "modal",
    modalType: "audio",
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
  {
    id: "htmldemo",
    label: "HTML/CSS/JS Demo",
    description: "Interaktives Beispiel mit HTML, CSS und JavaScript",
    icon: Globe,
    category: "Blöcke",
    action: "modal",
    modalType: "htmldemo",
  },
  {
    id: "spalten",
    label: "Spalten-Layout",
    description: "Inhalte nebeneinander anordnen (2 oder 3 Spalten)",
    icon: Columns2,
    category: "Blöcke",
    action: "modal",
    modalType: "spalten",
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
  initialUrl,
}: {
  onInsert: (md: string) => void;
  onClose: () => void;
  initialUrl?: string;
}) {
  const [url, setUrl] = useState(initialUrl || "");
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
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
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
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Abbrechen
          </button>
          <button
            type="button"
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

// ─── Audio Modal ───

function AudioModal({
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

  function getMarkdown() {
    return `<audio src="${url}" controls class="w-full"></audio>\n`;
  }

  return (
    <ModalShell title="Audio einfügen" onClose={onClose}>
      <div
        onClick={() => fileRef.current?.click()}
        className="flex flex-col items-center justify-center gap-2 h-28 rounded-lg border-2 border-dashed border-border/60 hover:border-primary/50 cursor-pointer transition-colors mb-4"
      >
        {uploading ? (
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        ) : (
          <>
            <Music className="w-6 h-6 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Audiodatei hochladen
            </span>
          </>
        )}
      </div>
      <input ref={fileRef} type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />

      <div className="mb-4">
        <label className="text-sm text-muted-foreground">Oder Audio-URL</label>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="/uploads/audio.mp3"
          className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      {url && (
        <div className="mb-4">
          <audio src={url} controls className="w-full" />
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
  onInsertWithOptions,
}: {
  onInsert: (md: string) => void;
  onClose: () => void;
  onInsertWithOptions?: (url: string) => void;
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
              type="button"
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
            <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*,video/*,audio/*" onChange={handleUpload} className="hidden" />
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
                  type="button"
                  key={file.url}
                  onClick={() => setSelected(file.url === selected ? null : file.url)}
                  onDoubleClick={() => {
                    const f = files.find((mf) => mf.url === file.url);
                    if (f?.type === "video") {
                      onInsert(`<video src="${file.url}" controls class="rounded-lg w-full"></video>\n`);
                    } else {
                      onInsert(`![](${file.url})\n`);
                    }
                  }}
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
        <div className="flex items-center justify-between gap-2 p-4 border-t border-border/40">
          <div>
            {onInsertWithOptions && selected && files.find((f) => f.url === selected)?.type !== "video" && (
              <button
                type="button"
                onClick={() => onInsertWithOptions(selected)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-primary border border-primary/30 hover:bg-primary/10 transition-colors"
              >
                Mit Optionen einfügen
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={handleInsert}
              disabled={!selected}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              Einfügen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── HTML Demo Modal ───

type HtmlTab = "html" | "css" | "js";

function HtmlDemoModal({
  onInsert,
  onClose,
}: {
  onInsert: (md: string) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<HtmlTab>("html");
  const [html, setHtml] = useState("<h2>Überschrift</h2>\n<p>Hallo Welt!</p>\n<button onclick=\"greet()\">Klick mich</button>");
  const [css, setCss] = useState("h2 { color: #2563eb; }\nbutton { padding: 8px 16px; border-radius: 6px; border: none; background: #2563eb; color: white; cursor: pointer; }");
  const [js, setJs] = useState("function greet() {\n  alert('Hallo!');\n}");
  const [title, setTitle] = useState("");
  const [height, setHeight] = useState(300);
  const quickHeights = [200, 300, 400, 500];

  function generateBlock() {
    const lines = [":::htmldemo"];
    lines.push(`height: ${height}`);
    if (title.trim()) lines.push(`title: ${title.trim()}`);
    if (html.trim()) { lines.push("---html"); lines.push(html); }
    if (css.trim())  { lines.push("---css");  lines.push(css);  }
    if (js.trim())   { lines.push("---js");   lines.push(js);   }
    lines.push(":::");
    return lines.join("\n") + "\n";
  }

  const tabs: { id: HtmlTab; label: string; value: string; setter: (v: string) => void; placeholder: string }[] = [
    { id: "html", label: "HTML", value: html, setter: setHtml, placeholder: "<h1>Hallo</h1>" },
    { id: "css",  label: "CSS",  value: css,  setter: setCss,  placeholder: "h1 { color: navy; }" },
    { id: "js",   label: "JS",   value: js,   setter: setJs,   placeholder: "console.log('Hallo');" },
  ];
  const activeTab = tabs.find((t) => t.id === tab)!;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border/60 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/40 shrink-0">
          <div>
            <h3 className="font-semibold text-foreground">HTML/CSS/JS Demo einfügen</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Wird als isolierter iframe eingebettet – kein React, reines HTML/CSS/JS.
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Tabs */}
          <div>
            <div className="flex gap-1 mb-2 border-b border-border/40">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${
                    tab === t.id
                      ? "bg-card border border-b-card border-border/40 -mb-px text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <textarea
              key={activeTab.id}
              value={activeTab.value}
              onChange={(e) => activeTab.setter(e.target.value)}
              rows={12}
              spellCheck={false}
              placeholder={activeTab.placeholder}
              className="w-full rounded-lg border border-input bg-foreground/[0.03] px-3 py-2.5 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Title */}
          <div>
            <label className="text-sm text-muted-foreground">
              Titel <span className="opacity-60">(optional)</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z. B. Klick-Zähler"
              className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          {/* Height */}
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Höhe (px)</label>
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
              min={100}
              max={1200}
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-border/40 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={() => onInsert(generateBlock())}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
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

// ─── Spalten Modal ───

function SpaltenModal({
  onInsert,
  onClose,
}: {
  onInsert: (md: string) => void;
  onClose: () => void;
}) {
  const [colCount, setColCount] = useState(2);
  const [cols, setCols] = useState(["Inhalt links...", "Inhalt rechts..."]);

  function updateColCount(n: number) {
    setColCount(n);
    setCols((prev) => {
      const next = [...prev];
      while (next.length < n) next.push(`Spalte ${next.length + 1}...`);
      return next.slice(0, n);
    });
  }

  function updateCol(index: number, val: string) {
    setCols((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  }

  const labels = colCount === 2 ? ["links", "rechts"] : ["links", "mitte", "rechts"];

  function generate() {
    const lines = [":::spalten"];
    cols.forEach((col, i) => {
      lines.push(`---${labels[i]}`);
      lines.push(col);
    });
    lines.push(":::");
    onInsert(lines.join("\n") + "\n");
  }

  return (
    <ModalShell title="Spalten-Layout einfügen" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="text-sm text-muted-foreground mb-1.5 block">Anzahl Spalten</label>
          <div className="flex gap-1.5">
            {[2, 3].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => updateColCount(n)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  colCount === n
                    ? "bg-primary text-primary-foreground"
                    : "bg-accent/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                {n} Spalten
              </button>
            ))}
          </div>
        </div>

        {cols.map((col, i) => (
          <div key={i}>
            <label className="text-sm text-muted-foreground mb-1 block capitalize">
              {labels[i]}
            </label>
            <textarea
              value={col}
              onChange={(e) => updateCol(i, e.target.value)}
              rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder={`Markdown für Spalte ${labels[i]}...`}
            />
          </div>
        ))}

        <div className="p-3 rounded-lg bg-accent/50 text-xs text-muted-foreground">
          Jede Spalte unterstützt normales Markdown (Text, Listen, Fettdruck, etc.)
        </div>
      </div>
      <div className="mt-4">
        <ModalFooter onClose={onClose} onConfirm={generate} label="Einfügen" />
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
        type="button"
        onClick={onClose}
        className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Abbrechen
      </button>
      <button
        type="button"
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
    name: "Glossar-Tooltips",
    description: "Fachbegriffe aus dem Glossar mit Tooltip-Erklärung einbetten. Der Begriff muss im Admin-Glossar angelegt sein.",
    syntax: `::glossar[Wellpappe]

Wird als gepunktete Unterstreichung angezeigt. Beim Hover/Tap erscheint die Definition als Tooltip.`,
    icon: BookA,
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

## 6. Glossar-Tooltips

Fachbegriffe, die im Glossar der Plattform hinterlegt sind, können als Tooltip eingebunden werden:
::glossar[Wellpappe]

Der Begriff wird mit gepunkteter Unterstreichung angezeigt und zeigt beim Hover die Definition.

## 7. Tabellen (Standard Markdown)

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
              type="button"
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
            <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
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
                    type="button"
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
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [modal, setModal] = useState<string | null>(null);
  const [imageModalUrl, setImageModalUrl] = useState<string | undefined>(undefined);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingInline, setUploadingInline] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  // "edit" = nur Editor, "split" = Editor + Vorschau, "preview" = nur Vorschau
  const [viewMode, setViewMode] = useState<"edit" | "split" | "preview">("edit");
  const previewRef = useRef<HTMLDivElement>(null);
  const quickUploadRef = useRef<HTMLInputElement>(null);
  const [quickUploading, setQuickUploading] = useState(false);
  const [debouncedContent, setDebouncedContent] = useState(value);
  const [formatPopover, setFormatPopover] = useState<{ top: number; left: number } | null>(null);
  const formatPopoverRef = useRef<HTMLDivElement>(null);

  // ─── Undo/Redo Stack ───
  const historyRef = useRef<string[]>([value]);
  const historyIndexRef = useRef(0);
  const isUndoRedoRef = useRef(false);
  const historyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Push to history (debounced for typing, immediate for format actions)
  const pushHistory = useCallback((newValue: string, immediate = false) => {
    if (isUndoRedoRef.current) return;
    if (historyTimerRef.current) clearTimeout(historyTimerRef.current);
    const push = () => {
      const h = historyRef.current;
      const idx = historyIndexRef.current;
      // Don't push if value hasn't changed
      if (h[idx] === newValue) return;
      // Truncate any redo history
      historyRef.current = h.slice(0, idx + 1);
      historyRef.current.push(newValue);
      // Limit to 100 entries
      if (historyRef.current.length > 100) historyRef.current.shift();
      historyIndexRef.current = historyRef.current.length - 1;
    };
    if (immediate) {
      push();
    } else {
      historyTimerRef.current = setTimeout(push, 500);
    }
  }, []);

  function undo() {
    const idx = historyIndexRef.current;
    if (idx <= 0) return;
    // Flush any pending history push first
    if (historyTimerRef.current) {
      clearTimeout(historyTimerRef.current);
      historyTimerRef.current = null;
      const h = historyRef.current;
      if (h[h.length - 1] !== value) {
        historyRef.current = h.slice(0, historyIndexRef.current + 1);
        historyRef.current.push(value);
        historyIndexRef.current = historyRef.current.length - 1;
      }
    }
    const newIdx = historyIndexRef.current - 1;
    isUndoRedoRef.current = true;
    onChange(historyRef.current[newIdx]);
    historyIndexRef.current = newIdx;
    requestAnimationFrame(() => { isUndoRedoRef.current = false; });
  }

  function redo() {
    const idx = historyIndexRef.current;
    if (idx >= historyRef.current.length - 1) return;
    const newIdx = idx + 1;
    isUndoRedoRef.current = true;
    onChange(historyRef.current[newIdx]);
    historyIndexRef.current = newIdx;
    requestAnimationFrame(() => { isUndoRedoRef.current = false; });
  }
  const scrollSyncSource = useRef<"editor" | "preview" | null>(null);

  // Debounce preview rendering (300ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedContent(value), 300);
    return () => clearTimeout(timer);
  }, [value]);

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
      pushHistory(newValue, true);
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
    [value, onChange, pushHistory]
  );

  const insertAtSlash = useCallback(
    (text: string) => {
      const ta = textareaRef.current;
      if (!ta || slashPos === null) return;

      const before = value.slice(0, slashPos);
      const after = value.slice(ta.selectionStart);
      const newValue = before + text + after;
      pushHistory(newValue, true);
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
    [value, onChange, slashPos, pushHistory]
  );

  // ─── Wrap selection (formatting) ───

  const wrapSelection = useCallback(
    (prefix: string, suffix: string, placeholder: string) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const selected = value.slice(start, end);

      if (selected) {
        const newValue = value.slice(0, start) + prefix + selected + suffix + value.slice(end);
        pushHistory(newValue, true);
        onChange(newValue);
        requestAnimationFrame(() => {
          ta.selectionStart = start + prefix.length;
          ta.selectionEnd = end + prefix.length;
          ta.focus();
        });
      } else {
        const newValue = value.slice(0, start) + prefix + placeholder + suffix + value.slice(end);
        pushHistory(newValue, true);
        onChange(newValue);
        requestAnimationFrame(() => {
          ta.selectionStart = start + prefix.length;
          ta.selectionEnd = start + prefix.length + placeholder.length;
          ta.focus();
        });
      }
    },
    [value, onChange, pushHistory]
  );

  const wrapLinkSelection = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.slice(start, end);

    if (selected) {
      const newValue = value.slice(0, start) + "[" + selected + "](url)" + value.slice(end);
      pushHistory(newValue, true);
      onChange(newValue);
      requestAnimationFrame(() => {
        // Select "url"
        ta.selectionStart = start + selected.length + 3;
        ta.selectionEnd = start + selected.length + 6;
        ta.focus();
      });
    } else {
      const newValue = value.slice(0, start) + "[Linktext](url)" + value.slice(end);
      pushHistory(newValue, true);
      onChange(newValue);
      requestAnimationFrame(() => {
        // Select "Linktext"
        ta.selectionStart = start + 1;
        ta.selectionEnd = start + 9;
        ta.focus();
      });
    }
  }, [value, onChange, pushHistory]);

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

  // ─── Quick Upload (direct file picker, no modal) ───

  async function handleQuickUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setQuickUploading(true);
    const url = await uploadFile(file);
    setQuickUploading(false);
    if (url) {
      insertText(`![${file.name}](${url})\n`);
    }
    e.target.value = "";
  }

  // ─── Format Popover (appears on text selection) ───

  function calculateSelectionPosition(): { top: number; left: number } | null {
    const ta = textareaRef.current;
    if (!ta) return null;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    if (start === end) return null;

    const mirror = document.createElement("div");
    const style = window.getComputedStyle(ta);
    mirror.style.position = "absolute";
    mirror.style.visibility = "hidden";
    mirror.style.whiteSpace = "pre-wrap";
    mirror.style.wordWrap = "break-word";
    mirror.style.width = ta.clientWidth + "px";
    mirror.style.font = style.font;
    mirror.style.lineHeight = style.lineHeight;
    mirror.style.padding = style.padding;
    mirror.style.border = style.border;
    mirror.style.boxSizing = style.boxSizing;

    const textBefore = ta.value.substring(0, start);
    const span = document.createElement("span");
    mirror.textContent = textBefore;
    span.textContent = ta.value.substring(start, end) || ".";
    mirror.appendChild(span);
    document.body.appendChild(mirror);

    const top = span.offsetTop - ta.scrollTop - 44;
    const left = Math.min(span.offsetLeft + span.offsetWidth / 2, ta.clientWidth - 160);

    document.body.removeChild(mirror);
    return { top: Math.max(-44, top), left: Math.max(12, left) };
  }

  function handleSelectionChange() {
    const ta = textareaRef.current;
    if (!ta || showMenu) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    if (start !== end && end - start >= 1) {
      const pos = calculateSelectionPosition();
      setFormatPopover(pos);
    } else {
      setFormatPopover(null);
    }
  }

  function applyInlineFormat(before: string, after: string) {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.slice(start, end);
    if (!selected) return;
    const newValue = value.slice(0, start) + before + selected + after + value.slice(end);
    pushHistory(newValue, true);
    onChange(newValue);
    setFormatPopover(null);
    requestAnimationFrame(() => {
      ta.selectionStart = start + before.length;
      ta.selectionEnd = start + before.length + selected.length;
      ta.focus();
    });
  }

  function applyBlockFormat(before: string, after: string) {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.slice(start, end);
    if (!selected) return;
    // Block-level: ensure newlines around the wrapped block
    const needNewlineBefore = start > 0 && value[start - 1] !== "\n";
    const needNewlineAfter = end < value.length && value[end] !== "\n";
    const prefix = needNewlineBefore ? "\n" : "";
    const suffix = needNewlineAfter ? "\n" : "";
    const newValue = value.slice(0, start) + prefix + before + selected + after + suffix + value.slice(end);
    pushHistory(newValue, true);
    onChange(newValue);
    setFormatPopover(null);
    requestAnimationFrame(() => {
      const newStart = start + prefix.length + before.length;
      ta.selectionStart = newStart;
      ta.selectionEnd = newStart + selected.length;
      ta.focus();
    });
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

  function calculateMenuPosition(): { top: number; left: number } {
    const ta = textareaRef.current;
    if (!ta) return { top: 0, left: 60 };

    // Create a mirror div to measure cursor position accurately
    const mirror = document.createElement("div");
    const style = window.getComputedStyle(ta);
    mirror.style.position = "absolute";
    mirror.style.visibility = "hidden";
    mirror.style.whiteSpace = "pre-wrap";
    mirror.style.wordWrap = "break-word";
    mirror.style.width = ta.clientWidth + "px";
    mirror.style.font = style.font;
    mirror.style.lineHeight = style.lineHeight;
    mirror.style.padding = style.padding;
    mirror.style.border = style.border;
    mirror.style.boxSizing = style.boxSizing;

    const textBefore = ta.value.substring(0, ta.selectionStart);
    const span = document.createElement("span");
    mirror.textContent = textBefore.slice(0, -1);
    span.textContent = "/";
    mirror.appendChild(span);
    document.body.appendChild(mirror);

    const top = span.offsetTop - ta.scrollTop + 28;
    const left = Math.min(span.offsetLeft + 12, ta.clientWidth - 290);

    document.body.removeChild(mirror);
    return { top: Math.max(0, Math.min(top, ta.clientHeight - 40)), left: Math.max(12, left) };
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key === "z" && !e.shiftKey) {
      e.preventDefault();
      undo();
      return;
    }
    if (mod && e.key === "z" && e.shiftKey) {
      e.preventDefault();
      redo();
      return;
    }
    if (mod && e.key === "b") {
      e.preventDefault();
      wrapSelection("**", "**", "fetter Text");
      return;
    }
    if (mod && e.key === "i") {
      e.preventDefault();
      wrapSelection("*", "*", "kursiver Text");
      return;
    }
    if (mod && e.key === "k") {
      e.preventDefault();
      wrapLinkSelection();
      return;
    }
    if (mod && e.key === "d") {
      e.preventDefault();
      duplicateLineOrBlock();
      return;
    }
    if (mod && e.shiftKey && e.key === "ArrowUp") {
      e.preventDefault();
      moveBlock("up");
      return;
    }
    if (mod && e.shiftKey && e.key === "ArrowDown") {
      e.preventDefault();
      moveBlock("down");
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      if (e.shiftKey) {
        const lineStart = value.lastIndexOf("\n", start - 1) + 1;
        if (value.slice(lineStart, lineStart + 2) === "  ") {
          const newVal = value.slice(0, lineStart) + value.slice(lineStart + 2);
          onChange(newVal);
          requestAnimationFrame(() => {
            const ta = textareaRef.current;
            if (ta) { ta.selectionStart = Math.max(start - 2, lineStart); ta.selectionEnd = Math.max(end - 2, lineStart); }
          });
        }
      } else {
        const newVal = value.slice(0, start) + "  " + value.slice(end);
        onChange(newVal);
        requestAnimationFrame(() => {
          const ta = textareaRef.current;
          if (ta) { ta.selectionStart = ta.selectionEnd = start + 2; }
        });
      }
      return;
    }

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
    pushHistory(newValue);
    setFormatPopover(null);

    const charBefore = pos >= 2 ? newValue[pos - 2] : "\n";
    const currentChar = newValue[pos - 1];

    if (currentChar === "/" && (charBefore === "\n" || pos === 1)) {
      setSlashPos(pos - 1);
      setShowMenu(true);
      setFilter("");
      setSelectedIndex(0);
      // Defer position calculation so the DOM is up to date
      requestAnimationFrame(() => setMenuPosition(calculateMenuPosition()));
    } else if (showMenu && slashPos !== null) {
      // Close if the slash was deleted or cursor moved before it
      if (pos <= slashPos || newValue[slashPos] !== "/") {
        setShowMenu(false);
        setFilter("");
        setSlashPos(null);
        return;
      }
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

  // ─── Block detection & movement ───

  const getBlockAtCursor = useCallback((): { start: number; end: number } | null => {
    const ta = textareaRef.current;
    if (!ta) return null;
    const cursor = ta.selectionStart;
    const lines = value.split("\n");
    let charIdx = 0;
    let cursorLine = 0;
    for (let i = 0; i < lines.length; i++) {
      if (charIdx + lines[i].length >= cursor) { cursorLine = i; break; }
      charIdx += lines[i].length + 1;
    }

    // Block delimiters: :::, +++, ???, $$
    const openers = /^(:::(?:merke|tipp|warnung|info|bild\[|demo\[|htmldemo|spalten)|^\+\+\+|^\?\?\?|^\$\$)/;
    const closers = /^(:::|\+\+\+|\?\?\?|\$\$)\s*$/;

    // Search upward for opener
    let blockStart = -1;
    for (let i = cursorLine; i >= 0; i--) {
      if (openers.test(lines[i].trim())) { blockStart = i; break; }
      if (i < cursorLine && closers.test(lines[i].trim())) break; // hit a closer before an opener
    }
    if (blockStart === -1) return null;

    // Search downward for closer
    let blockEnd = -1;
    const opener = lines[blockStart].trim();
    const closePattern = opener.startsWith(":::") ? ":::" : opener.startsWith("+++") ? "+++" : opener.startsWith("???") ? "???" : "$$";
    for (let i = blockStart + 1; i < lines.length; i++) {
      if (lines[i].trim() === closePattern) { blockEnd = i; break; }
    }
    if (blockEnd === -1) return null;
    if (cursorLine < blockStart || cursorLine > blockEnd) return null;

    // Convert line indices to character positions
    let startChar = 0;
    for (let i = 0; i < blockStart; i++) startChar += lines[i].length + 1;
    let endChar = startChar;
    for (let i = blockStart; i <= blockEnd; i++) endChar += lines[i].length + 1;

    return { start: startChar, end: Math.min(endChar, value.length + 1) };
  }, [value]);

  const moveBlock = useCallback((direction: "up" | "down") => {
    const block = getBlockAtCursor();
    if (!block) return;

    const blockText = value.slice(block.start, block.end);
    const before = value.slice(0, block.start);
    const after = value.slice(block.end);

    if (direction === "up") {
      // Find the previous line/block boundary
      const prevLines = before.trimEnd();
      if (!prevLines) return;
      // Find start of previous paragraph/block (last double newline or start)
      const prevBlockStart = Math.max(0, prevLines.lastIndexOf("\n\n") + 2);
      const prevText = value.slice(prevBlockStart, block.start);
      const newValue = value.slice(0, prevBlockStart) + blockText + prevText + after;
      onChange(newValue);
      requestAnimationFrame(() => {
        const ta = textareaRef.current;
        if (ta) { ta.selectionStart = ta.selectionEnd = prevBlockStart; ta.focus(); }
      });
    } else {
      // Find the next block boundary
      const remaining = after;
      if (!remaining.trim()) return;
      // Find end of next paragraph/block (first double newline or end)
      let nextEnd = remaining.indexOf("\n\n");
      if (nextEnd === -1) nextEnd = remaining.length;
      else nextEnd += 2;
      const nextText = remaining.slice(0, nextEnd);
      const newValue = before + nextText + blockText + remaining.slice(nextEnd);
      onChange(newValue);
      requestAnimationFrame(() => {
        const ta = textareaRef.current;
        if (ta) { const pos = before.length + nextText.length; ta.selectionStart = ta.selectionEnd = pos; ta.focus(); }
      });
    }
  }, [value, onChange, getBlockAtCursor]);

  // ─── Duplicate line/block (Cmd+D) ───

  const duplicateLineOrBlock = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;

    const block = getBlockAtCursor();
    if (block) {
      // Duplicate the entire block
      const blockText = value.slice(block.start, block.end);
      const newValue = value.slice(0, block.end) + "\n" + blockText + value.slice(block.end);
      onChange(newValue);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = block.end + 1;
        ta.focus();
      });
    } else {
      // Duplicate current line
      const cursor = ta.selectionStart;
      const lineStart = value.lastIndexOf("\n", cursor - 1) + 1;
      let lineEnd = value.indexOf("\n", cursor);
      if (lineEnd === -1) lineEnd = value.length;
      const line = value.slice(lineStart, lineEnd);
      const newValue = value.slice(0, lineEnd) + "\n" + line + value.slice(lineEnd);
      onChange(newValue);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = lineEnd + line.length + 1;
        ta.focus();
      });
    }
  }, [value, onChange, getBlockAtCursor]);

  // Manage textarea height across all mode combinations
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;

    if (isFullscreen) {
      // Fullscreen: fill available space
      ta.style.height = "100%";
    } else if (viewMode === "edit") {
      // Edit-only (no fullscreen): auto-resize to fit content
      ta.style.height = "auto";
      ta.style.height = ta.scrollHeight + "px";
    } else {
      // Split mode (no fullscreen): clear inline height, let CSS handle it
      ta.style.height = "";
    }

  }, [value, viewMode, isFullscreen]);

  // Escape exits focus mode / fullscreen
  useEffect(() => {
    if (!isFullscreen) return;
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape" && !showMenu && !modal && !showHelp) {
        if (isFocusMode) {
          setIsFocusMode(false);
          setIsFullscreen(false);
        } else {
          setIsFullscreen(false);
        }
      }
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isFullscreen, isFocusMode, showMenu, modal, showHelp]);

  function syncEditorScroll() {
    const ta = textareaRef.current;
    if (!ta) return;
    // Sync preview (proportional scroll)
    if (scrollSyncSource.current === "preview") return;
    scrollSyncSource.current = "editor";
    const preview = previewRef.current;
    if (preview && viewMode === "split") {
      const editorRatio = ta.scrollTop / (ta.scrollHeight - ta.clientHeight || 1);
      preview.scrollTop = editorRatio * (preview.scrollHeight - preview.clientHeight);
    }
    requestAnimationFrame(() => { scrollSyncSource.current = null; });
  }

  function syncPreviewScroll() {
    if (scrollSyncSource.current === "editor") return;
    scrollSyncSource.current = "preview";
    const preview = previewRef.current;
    const ta = textareaRef.current;
    if (preview && ta && viewMode === "split") {
      const previewRatio = preview.scrollTop / (preview.scrollHeight - preview.clientHeight || 1);
      ta.scrollTop = previewRatio * (ta.scrollHeight - ta.clientHeight);
    }
    requestAnimationFrame(() => { scrollSyncSource.current = null; });
  }

  const lineCount = value.split("\n").length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = value.length;

  return (
    <div className={isFullscreen ? "fixed inset-0 z-50 bg-background flex flex-col p-4 space-y-2" : "space-y-2"}>
      {/* Toolbar */}
      <div className={`flex items-center gap-1 p-1 rounded-lg border border-border/40 transition-colors ${isFocusMode ? "bg-transparent border-transparent" : "bg-accent/50"}`}>
        {viewMode !== "preview" && !isFocusMode && (
          <>
            <button
              type="button"
              onClick={() => quickUploadRef.current?.click()}
              disabled={quickUploading}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-60"
              title="Bild direkt hochladen und einfügen"
            >
              {quickUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
              <span className="hidden sm:inline">Upload</span>
            </button>
            <input
              ref={quickUploadRef}
              type="file"
              accept="image/*"
              onChange={handleQuickUpload}
              className="hidden"
            />
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
            <FormatButton
              icon={Bold}
              label="Fett (⌘B)"
              onMouseDown={() => wrapSelection("**", "**", "fetter Text")}
            />
            <FormatButton
              icon={Italic}
              label="Kursiv (⌘I)"
              onMouseDown={() => wrapSelection("*", "*", "kursiver Text")}
            />
            <FormatButton
              icon={Strikethrough}
              label="Durchgestrichen"
              onMouseDown={() => wrapSelection("~~", "~~", "durchgestrichen")}
            />
            <FormatButton
              icon={Code2}
              label="Inline-Code"
              onMouseDown={() => wrapSelection("`", "`", "code")}
            />
            <FormatButton
              icon={Link}
              label="Link (⌘K)"
              onMouseDown={() => wrapLinkSelection()}
            />
            <div className="w-px h-5 bg-border/60 mx-1" />
            <FormatButton
              icon={ArrowUpDown}
              label="Block verschieben (⌘⇧↑↓)"
              onMouseDown={() => moveBlock("up")}
            />
            <FormatButton
              icon={CopyPlus}
              label="Zeile/Block duplizieren (⌘D)"
              onMouseDown={() => duplicateLineOrBlock()}
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
        {!isFocusMode && (
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
        )}

        <ToolbarButton
          icon={Focus}
          label={isFocusMode ? "Fokus-Modus beenden" : "Fokus-Modus"}
          onClick={() => {
            if (!isFocusMode) {
              setIsFocusMode(true);
              setIsFullscreen(true);
              setViewMode("edit");
            } else {
              setIsFocusMode(false);
            }
          }}
          active={isFocusMode}
        />
        {!isFocusMode && (
          <ToolbarButton
            icon={isFullscreen ? Minimize2 : Maximize2}
            label={isFullscreen ? "Vollbild beenden" : "Vollbild"}
            onClick={() => setIsFullscreen(!isFullscreen)}
          />
        )}
        {!isFocusMode && <div className="w-px h-5 bg-border/60 mx-1" />}
        {!isFocusMode && (
          <ToolbarButton
            icon={CircleHelp}
            label="Hilfe"
            onClick={() => setShowHelp(true)}
          />
        )}
      </div>

      {/* Editor + Preview Area */}
      <div className={`${viewMode === "split" ? "grid grid-cols-2 gap-3" : ""} ${isFullscreen ? "flex-1 min-h-0 overflow-hidden" : ""}`}>
        {/* Editor Panel */}
        {viewMode !== "preview" && (
          <div
            className={`relative rounded-lg transition-colors ${isFullscreen ? "h-full flex flex-col" : ""} ${isFullscreen && viewMode === "split" ? "overflow-hidden" : ""} ${
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

            <div className={`relative ${isFullscreen ? "flex-1 min-h-0" : ""}`}>
              <textarea
                ref={textareaRef}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                onScroll={syncEditorScroll}
                onMouseUp={handleSelectionChange}
                onSelect={handleSelectionChange}
                placeholder={"Schreibe deinen Inhalt...\nTippe / für Blöcke · Bilder per Drag & Drop oder Strg+V einfügen"}
                className={`w-full rounded-lg border border-input bg-background px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                  isFullscreen ? "h-full resize-none" : viewMode === "split" ? "min-h-[500px] max-h-[700px] resize-none" : "min-h-[300px] resize-none"
                }`}
                style={{ lineHeight: "22px" }}
              />
            </div>

            {/* Format Popover */}
            {formatPopover && !showMenu && (
              <div
                ref={formatPopoverRef}
                className="absolute z-50 flex items-center gap-0.5 px-1.5 py-1 rounded-lg border border-border/60 bg-card shadow-xl"
                style={{ top: formatPopover.top, left: formatPopover.left, transform: "translateX(-50%)" }}
                onMouseDown={(e) => e.preventDefault()}
              >
                {/* Colors */}
                {[
                  { color: "#ea580c", label: "Orange" },
                  { color: "#2563eb", label: "Blau" },
                  { color: "#16a34a", label: "Grün" },
                  { color: "#dc2626", label: "Rot" },
                  { color: "#7c3aed", label: "Violett" },
                  { color: "#6b7280", label: "Grau" },
                ].map((c) => (
                  <button
                    key={c.color}
                    type="button"
                    title={c.label}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      applyInlineFormat(`<span style="color:${c.color}">`, "</span>");
                    }}
                    className="w-5 h-5 rounded-full border border-border/40 hover:scale-125 transition-transform"
                    style={{ backgroundColor: c.color }}
                  />
                ))}

                <div className="w-px h-4 bg-border/60 mx-1" />

                {/* Sizes */}
                {[
                  { size: "0.8rem", label: "S", title: "Klein" },
                  { size: "1.25rem", label: "L", title: "Groß" },
                  { size: "1.5rem", label: "XL", title: "Extra Groß" },
                ].map((s) => (
                  <button
                    key={s.size}
                    type="button"
                    title={s.title}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      applyInlineFormat(`<span style="font-size:${s.size}">`, "</span>");
                    }}
                    className="px-1.5 py-0.5 rounded text-[10px] font-bold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    {s.label}
                  </button>
                ))}

                <div className="w-px h-4 bg-border/60 mx-1" />

                {/* Alignment */}
                {[
                  { align: "left", icon: "≡", title: "Linksbündig" },
                  { align: "center", icon: "≡", title: "Zentriert" },
                  { align: "right", icon: "≡", title: "Rechtsbündig" },
                ].map((a) => (
                  <button
                    key={a.align}
                    type="button"
                    title={a.title}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      applyBlockFormat(`<div style="text-align:${a.align}">`, "</div>");
                    }}
                    className={`px-1 py-0.5 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors ${
                      a.align === "center" ? "tracking-tight" : a.align === "right" ? "tracking-tighter" : ""
                    }`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      {a.align === "left" && <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></>}
                      {a.align === "center" && <><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></>}
                      {a.align === "right" && <><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/></>}
                    </svg>
                  </button>
                ))}

                <div className="w-px h-4 bg-border/60 mx-1" />

                {/* Highlight */}
                <button
                  type="button"
                  title="Hervorheben"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applyInlineFormat("<mark>", "</mark>");
                  }}
                  className="px-1.5 py-0.5 rounded text-[10px] font-bold hover:bg-accent transition-colors"
                  style={{ backgroundColor: "#fef08a", color: "#854d0e" }}
                >
                  H
                </button>

                {/* Chip / Badge */}
                <button
                  type="button"
                  title="Chip / Badge"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applyInlineFormat(
                      '<span style="display:inline-block;padding:2px 10px;border-radius:999px;font-size:0.8rem;font-weight:600;background:#fff7ed;color:#ea580c;border:1px solid #fed7aa">',
                      "</span>"
                    );
                  }}
                  className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 transition-colors"
                >
                  Chip
                </button>
              </div>
            )}

            {/* Slash Command Menu */}
            {showMenu && flatFiltered.length > 0 && (
              <div
                ref={menuRef}
                className="absolute z-50 w-72 max-h-80 overflow-y-auto rounded-xl border border-border/60 bg-card shadow-xl"
                style={{ top: menuPosition?.top ?? 0, left: menuPosition?.left ?? 16 }}
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
            ref={previewRef}
            onScroll={viewMode === "split" ? syncPreviewScroll : undefined}
            className={`rounded-lg border border-border/60 bg-card overflow-y-auto ${
              isFullscreen
                ? "h-full"
                : viewMode === "split"
                  ? "min-h-[500px] max-h-[700px]"
                  : "min-h-[300px]"
            }`}
          >
            {value.trim() ? (
              <div className="p-6">
                <MarkdownRenderer content={debouncedContent} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[200px] text-muted-foreground text-sm">
                Vorschau erscheint hier...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status bar */}
      {isFocusMode ? (
        <div className="flex items-center justify-center px-2 text-[11px] text-muted-foreground/40">
          <span>{wordCount} Wörter</span>
          <span className="mx-2">·</span>
          <span>Esc = Beenden</span>
        </div>
      ) : (
        <div className="flex items-center justify-between px-2 text-[11px] text-muted-foreground/60">
          <div className="flex items-center gap-3">
            <span>{wordCount} Wörter</span>
            <span>{charCount} Zeichen</span>
            <span>{lineCount} Zeilen</span>
          </div>
          <div className="flex items-center gap-3">
            <span>/ = Blöcke</span>
            <span>⌘B ⌘I ⌘K = Format</span>
            <span>⌘Z = Zurück</span>
            <span>⌘D = Duplizieren</span>
            <span>⌘⇧↑↓ = Verschieben</span>
            {isFullscreen && <span>Esc = Vollbild beenden</span>}
          </div>
        </div>
      )}

      {/* Modals */}
      {modal === "table" && (
        <TableModal onInsert={handleModalInsert} onClose={() => setModal(null)} />
      )}
      {modal === "image" && (
        <ImageModal
          onInsert={(md) => { setImageModalUrl(undefined); handleModalInsert(md); }}
          onClose={() => { setImageModalUrl(undefined); setModal(null); }}
          initialUrl={imageModalUrl}
        />
      )}
      {modal === "video" && (
        <VideoModal onInsert={handleModalInsert} onClose={() => setModal(null)} />
      )}
      {modal === "audio" && (
        <AudioModal onInsert={handleModalInsert} onClose={() => setModal(null)} />
      )}
      {modal === "media" && (
        <MediaLibraryModal
          onInsert={handleModalInsert}
          onClose={() => setModal(null)}
          onInsertWithOptions={(url) => {
            setImageModalUrl(url);
            setModal("image");
          }}
        />
      )}
      {modal === "demo" && (
        <DemoModal onInsert={handleModalInsert} onClose={() => setModal(null)} />
      )}
      {modal === "htmldemo" && (
        <HtmlDemoModal onInsert={handleModalInsert} onClose={() => setModal(null)} />
      )}
      {modal === "spalten" && (
        <SpaltenModal onInsert={handleModalInsert} onClose={() => setModal(null)} />
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
  active,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs transition-colors ${
        active
          ? "text-primary bg-primary/10"
          : "text-muted-foreground hover:text-foreground hover:bg-accent"
      }`}
      title={label}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function FormatButton({
  icon: Icon,
  label,
  onMouseDown,
}: {
  icon: LucideIcon;
  label: string;
  onMouseDown: () => void;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onMouseDown();
      }}
      className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      title={label}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}
