"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
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
  LayoutGrid,
  PanelTop,
  Smile,
  Trash2,
  FileText,
  Boxes,
  Superscript,
  type LucideIcon,
} from "lucide-react";

import { MarkdownRenderer } from "./markdown-renderer";
import { AVAILABLE_ICONS, InlineIcon } from "./content-blocks";

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
  {
    id: "karten",
    label: "Karten",
    description: "Karten-Grid mit Titel, Badge und Inhalt",
    icon: LayoutGrid,
    category: "Blöcke",
    action: "modal",
    modalType: "karten",
  },
  {
    id: "tabs",
    label: "Tabs",
    description: "Tab-Navigation mit umschaltbaren Inhalten",
    icon: PanelTop,
    category: "Blöcke",
    action: "modal",
    modalType: "tabs",
  },
  {
    id: "icon",
    label: "Icon",
    description: "Lucide-Icon inline einfügen",
    icon: Smile,
    category: "Medien",
    action: "modal",
    modalType: "icon",
  },
  {
    id: "einheit",
    label: "Einheit",
    description: "Physikalische Einheit einfügen (g/m², N/mm² …)",
    icon: Superscript,
    category: "Inline",
    action: "modal",
    modalType: "einheit",
  },
  {
    id: "vorlage",
    label: "Vorlagen",
    description: "Fertige Module und Layouts einfuegen",
    icon: Boxes,
    category: "Vorlagen",
    action: "modal",
    modalType: "vorlage",
  },
];

// ─── Shortcut Labels (displayed in slash menu) ───

const isMac = typeof navigator !== "undefined" && /Mac/.test(navigator.userAgent);
const modLabel = isMac ? "⌘" : "Ctrl+";
const shiftLabel = isMac ? "⇧" : "Shift+";

const COMMAND_SHORTCUTS: Record<string, string> = {
  code: `${modLabel}${shiftLabel}E`,
  hr: `${modLabel}${shiftLabel}H`,
  bild: `${modLabel}${shiftLabel}P`,
};

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

// ─── Vorlage (Template) Modal ───

function VorlageModal({
  onInsert,
  onClose,
}: {
  onInsert: (md: string) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return moduleTemplates;
    return moduleTemplates.filter(
      (t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
    );
  }, [search]);

  const grouped = useMemo(() => {
    const g: Record<string, typeof filtered> = {};
    for (const t of filtered) {
      if (!g[t.category]) g[t.category] = [];
      g[t.category].push(t);
    }
    return g;
  }, [filtered]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-card border border-border/60 rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <div>
            <h3 className="font-semibold text-foreground">Vorlage einfuegen</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{moduleTemplates.length} fertige Module</p>
          </div>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-4 pt-3">
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPreview(null); }}
            placeholder="Vorlage suchen... (z.B. Karten, Tabs, Quiz)"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            autoFocus
          />
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {Object.entries(grouped).map(([category, templates]) => (
            <div key={category}>
              <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-2">{category}</p>
              <div className="grid grid-cols-2 gap-2">
                {templates.map((tmpl) => {
                  const globalIdx = moduleTemplates.indexOf(tmpl);
                  const Icon = tmpl.icon;
                  const isOpen = preview === globalIdx;
                  return (
                    <div key={tmpl.name} className="rounded-lg border border-border/40 overflow-hidden">
                      <div className="flex items-center gap-2.5 p-2.5">
                        <div className="w-8 h-8 rounded-md bg-accent/70 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{tmpl.name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{tmpl.description}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 px-2.5 pb-2.5">
                        <button
                          type="button"
                          onClick={() => setPreview(isOpen ? null : globalIdx)}
                          className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                            isOpen ? "bg-primary/10 text-primary" : "bg-accent/50 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {isOpen ? "Ausblenden" : "Vorschau"}
                        </button>
                        <button
                          type="button"
                          onClick={() => { onInsert(tmpl.content + "\n"); onClose(); }}
                          className="flex-1 px-2 py-1 rounded text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                          Einfuegen
                        </button>
                      </div>
                      {isOpen && (
                        <div className="border-t border-border/40 p-2.5 max-h-48 overflow-y-auto">
                          <pre className="text-[11px] font-mono text-foreground/60 whitespace-pre-wrap">{tmpl.content}</pre>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">Keine Vorlage gefunden</p>
          )}
        </div>
      </div>
    </div>
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

// ─── Einheit (Unit) Picker Modal ───

const UNIT_CATEGORIES: { label: string; units: { label: string; value: string }[] }[] = [
  {
    label: "Fläche & Volumen",
    units: [
      { label: "m²", value: "m²" },
      { label: "cm²", value: "cm²" },
      { label: "mm²", value: "mm²" },
      { label: "m³", value: "m³" },
      { label: "cm³", value: "cm³" },
      { label: "mm³", value: "mm³" },
    ],
  },
  {
    label: "Flächengewicht & Dichte",
    units: [
      { label: "g/m²", value: "g/m²" },
      { label: "kg/m²", value: "kg/m²" },
      { label: "g/cm²", value: "g/cm²" },
      { label: "kg/m³", value: "kg/m³" },
      { label: "g/cm³", value: "g/cm³" },
    ],
  },
  {
    label: "Kraft & Druck",
    units: [
      { label: "N/m²", value: "N/m²" },
      { label: "N/mm²", value: "N/mm²" },
      { label: "kN/m²", value: "kN/m²" },
      { label: "kPa", value: "kPa" },
      { label: "MPa", value: "MPa" },
    ],
  },
  {
    label: "Geschwindigkeit & Durchsatz",
    units: [
      { label: "m/s", value: "m/s" },
      { label: "m/min", value: "m/min" },
      { label: "Stk/min", value: "Stk/min" },
      { label: "Stk/h", value: "Stk/h" },
    ],
  },
  {
    label: "Temperatur & Sonstiges",
    units: [
      { label: "°C", value: "°C" },
      { label: "°F", value: "°F" },
      { label: "µm", value: "µm" },
      { label: "%", value: "%" },
      { label: "‰", value: "‰" },
    ],
  },
];

function EinheitModal({
  onInsert,
  onClose,
}: {
  onInsert: (text: string) => void;
  onClose: () => void;
}) {
  const [filter, setFilter] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = useMemo(() => {
    if (!filter) return UNIT_CATEGORIES;
    const q = filter.toLowerCase();
    return UNIT_CATEGORIES.map((cat) => ({
      ...cat,
      units: cat.units.filter(
        (u) => u.label.toLowerCase().includes(q) || u.value.toLowerCase().includes(q) || cat.label.toLowerCase().includes(q)
      ),
    })).filter((cat) => cat.units.length > 0);
  }, [filter]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card rounded-xl shadow-2xl border border-border/60 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <h3 className="font-semibold text-foreground">Einheit einfügen</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-accent text-muted-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-3 border-b border-border/40">
          <input
            ref={inputRef}
            type="text"
            placeholder="Suchen… z.B. g/m²"
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <div className="p-3 max-h-72 overflow-y-auto space-y-3">
          {filtered.map((cat) => (
            <div key={cat.label}>
              <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider px-1 pb-1">{cat.label}</p>
              <div className="flex flex-wrap gap-1.5">
                {cat.units.map((u) => (
                  <button
                    key={u.value}
                    className="px-3 py-1.5 rounded-lg border border-border/60 bg-background hover:bg-primary/10 hover:border-primary/40 text-sm font-medium text-foreground transition-colors"
                    onClick={() => { onInsert(u.value); onClose(); }}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Keine Einheit gefunden</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Icon Picker Modal ───

function IconModal({
  onInsert,
  onClose,
}: {
  onInsert: (md: string) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(120);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return AVAILABLE_ICONS;
    return AVAILABLE_ICONS.filter((name) => name.includes(q));
  }, [search]);

  const visible = filtered.slice(0, visibleCount);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
      setVisibleCount((prev) => Math.min(prev + 120, filtered.length));
    }
  }, [filtered.length]);

  // Reset visible count when search changes
  useEffect(() => {
    setVisibleCount(120);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [search]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-card border border-border/60 rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <h3 className="font-semibold text-foreground">Icon einfuegen</h3>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-4 pt-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Icon suchen... (z.B. arrow, check, heart, star)"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            autoFocus
          />
          <p className="text-xs text-muted-foreground mt-1.5">
            {filtered.length} Icons verfuegbar
          </p>
        </div>
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4"
        >
          <div className="grid grid-cols-8 gap-1.5">
            {visible.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => onInsert(`:icon[${name}] `)}
                className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-accent transition-colors"
                title={name}
              >
                <InlineIcon name={name} size={20} />
                <span className="text-[8px] text-muted-foreground truncate max-w-full leading-tight">{name}</span>
              </button>
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">Kein Icon gefunden</p>
          )}
          {visibleCount < filtered.length && (
            <p className="text-xs text-muted-foreground text-center py-2">Scrolle fuer mehr...</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Karten Modal ───

type CardEntry = { title: string; badge: string; badgeColor: string; content: string };

function KartenModal({
  onInsert,
  onClose,
}: {
  onInsert: (md: string) => void;
  onClose: () => void;
}) {
  const [cards, setCards] = useState<CardEntry[]>([
    { title: "Karte 1", badge: "", badgeColor: "gray", content: "Inhalt hier..." },
    { title: "Karte 2", badge: "", badgeColor: "gray", content: "Inhalt hier..." },
  ]);
  const [columns, setColumns] = useState(2);

  function addCard() {
    setCards([...cards, { title: `Karte ${cards.length + 1}`, badge: "", badgeColor: "gray", content: "Inhalt hier..." }]);
  }

  function removeCard(index: number) {
    if (cards.length <= 1) return;
    setCards(cards.filter((_, i) => i !== index));
  }

  function updateCard(index: number, field: keyof CardEntry, value: string) {
    setCards(cards.map((c, i) => i === index ? { ...c, [field]: value } : c));
  }

  function generate() {
    const lines = [`:::karten${columns !== 2 ? `|${columns}` : ""}`];
    cards.forEach((card) => {
      const parts = [card.title];
      if (card.badge) parts.push(card.badge);
      if (card.badge && card.badgeColor !== "gray") parts.push(card.badgeColor);
      lines.push(`---${parts.join("|")}`);
      lines.push(card.content);
    });
    lines.push(":::");
    onInsert(lines.join("\n") + "\n");
  }

  const colorOptions = ["gray", "orange", "blue", "green", "red", "purple", "beige"];
  const colorLabels: Record<string, string> = { gray: "Grau", orange: "Orange", blue: "Blau", green: "Grun", red: "Rot", purple: "Violett", beige: "Beige" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-card border border-border/60 rounded-xl shadow-xl w-full max-w-xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <h3 className="font-semibold text-foreground">Karten-Grid einfugen</h3>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Column count */}
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Spalten</label>
            <div className="flex gap-1.5">
              {[2, 3].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setColumns(n)}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    columns === n ? "bg-primary text-primary-foreground" : "bg-accent/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {n} Spalten
                </button>
              ))}
            </div>
          </div>

          {/* Cards */}
          {cards.map((card, i) => (
            <div key={i} className="rounded-lg border border-border/40 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Karte {i + 1}</span>
                <button
                  type="button"
                  onClick={() => removeCard(i)}
                  disabled={cards.length <= 1}
                  className="p-1 rounded text-muted-foreground hover:text-red-500 disabled:opacity-30 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <input
                value={card.title}
                onChange={(e) => updateCard(i, "title", e.target.value)}
                placeholder="Titel"
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={card.badge}
                  onChange={(e) => updateCard(i, "badge", e.target.value)}
                  placeholder="Badge (optional)"
                  className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                />
                <select
                  value={card.badgeColor}
                  onChange={(e) => updateCard(i, "badgeColor", e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                >
                  {colorOptions.map((c) => (
                    <option key={c} value={c}>{colorLabels[c]}</option>
                  ))}
                </select>
              </div>
              <textarea
                value={card.content}
                onChange={(e) => updateCard(i, "content", e.target.value)}
                rows={2}
                placeholder="Inhalt (Markdown)"
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm font-mono resize-none"
              />
            </div>
          ))}

          <button
            type="button"
            onClick={addCard}
            className="w-full py-2 rounded-lg border-2 border-dashed border-border/60 text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
          >
            + Karte hinzufugen
          </button>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-border/40">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors">
            Abbrechen
          </button>
          <button type="button" onClick={generate} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            Einfugen
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tabs Modal ───

type TabEntry = { title: string; icon: string; content: string };

function TabsModal({
  onInsert,
  onClose,
}: {
  onInsert: (md: string) => void;
  onClose: () => void;
}) {
  const [tabs, setTabs] = useState<TabEntry[]>([
    { title: "Tab 1", icon: "", content: "Inhalt hier..." },
    { title: "Tab 2", icon: "", content: "Inhalt hier..." },
  ]);
  const [iconSearch, setIconSearch] = useState<number | null>(null);
  const [iconFilter, setIconFilter] = useState("");

  function addTab() {
    setTabs([...tabs, { title: `Tab ${tabs.length + 1}`, icon: "", content: "Inhalt hier..." }]);
  }

  function removeTab(index: number) {
    if (tabs.length <= 1) return;
    setTabs(tabs.filter((_, i) => i !== index));
  }

  function updateTab(index: number, field: keyof TabEntry, value: string) {
    setTabs(tabs.map((t, i) => i === index ? { ...t, [field]: value } : t));
  }

  function generate() {
    const lines = [":::tabs"];
    tabs.forEach((tab) => {
      const parts = [tab.title];
      if (tab.icon) parts.push(tab.icon);
      lines.push(`---${parts.join("|")}`);
      lines.push(tab.content);
    });
    lines.push(":::");
    onInsert(lines.join("\n") + "\n");
  }

  const filteredIcons = useMemo(() => {
    const q = iconFilter.toLowerCase();
    if (!q) return AVAILABLE_ICONS.slice(0, 80);
    return AVAILABLE_ICONS.filter((name) => name.includes(q)).slice(0, 80);
  }, [iconFilter]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-card border border-border/60 rounded-xl shadow-xl w-full max-w-xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <h3 className="font-semibold text-foreground">Tabs einfugen</h3>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Preview tab bar */}
          <div className="flex items-center gap-1 border-b-2 border-border/60 pb-0 overflow-x-auto">
            {tabs.map((tab, i) => (
              <div key={i} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 -mb-[2px] border-primary text-primary whitespace-nowrap">
                {tab.icon && <InlineIcon name={tab.icon} size={14} />}
                {tab.title || `Tab ${i + 1}`}
              </div>
            ))}
          </div>

          {/* Tab entries */}
          {tabs.map((tab, i) => (
            <div key={i} className="rounded-lg border border-border/40 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Tab {i + 1}</span>
                <button
                  type="button"
                  onClick={() => removeTab(i)}
                  disabled={tabs.length <= 1}
                  className="p-1 rounded text-muted-foreground hover:text-red-500 disabled:opacity-30 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-[1fr,auto] gap-2">
                <input
                  value={tab.title}
                  onChange={(e) => updateTab(i, "title", e.target.value)}
                  placeholder="Tab-Titel"
                  className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                />
                <button
                  type="button"
                  onClick={() => { setIconSearch(iconSearch === i ? null : i); setIconFilter(""); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm transition-colors ${
                    tab.icon ? "border-primary/40 text-primary" : "border-input text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.icon ? <InlineIcon name={tab.icon} size={14} /> : <Smile className="w-3.5 h-3.5" />}
                  {tab.icon || "Icon"}
                </button>
              </div>
              {/* Icon picker inline */}
              {iconSearch === i && (
                <div className="rounded-md border border-border/40 bg-background p-2">
                  <input
                    value={iconFilter}
                    onChange={(e) => setIconFilter(e.target.value)}
                    placeholder="Icon suchen..."
                    className="w-full rounded border border-input px-2 py-1 text-xs mb-2"
                    autoFocus
                  />
                  <div className="grid grid-cols-8 gap-1 max-h-32 overflow-y-auto">
                    {tab.icon && (
                      <button
                        type="button"
                        onClick={() => { updateTab(i, "icon", ""); setIconSearch(null); }}
                        className="flex items-center justify-center p-1.5 rounded hover:bg-red-50 text-red-400"
                        title="Icon entfernen"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    {filteredIcons.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => { updateTab(i, "icon", name); setIconSearch(null); }}
                        className={`flex items-center justify-center p-1.5 rounded hover:bg-accent transition-colors ${
                          tab.icon === name ? "bg-primary/10 text-primary" : ""
                        }`}
                        title={name}
                      >
                        <InlineIcon name={name} size={16} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <textarea
                value={tab.content}
                onChange={(e) => updateTab(i, "content", e.target.value)}
                rows={3}
                placeholder="Inhalt (Markdown — alle Bloecke erlaubt)"
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm font-mono resize-none"
              />
            </div>
          ))}

          <button
            type="button"
            onClick={addTab}
            className="w-full py-2 rounded-lg border-2 border-dashed border-border/60 text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
          >
            + Tab hinzufugen
          </button>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-border/40">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors">
            Abbrechen
          </button>
          <button type="button" onClick={generate} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            Einfugen
          </button>
        </div>
      </div>
    </div>
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
    name: "Spalten-Layout",
    description: "Inhalte nebeneinander in 2 oder 3 Spalten anordnen. Trennzeichen: ---links, ---mitte, ---rechts.",
    syntax: `:::spalten
---links
Linke Spalte mit **beliebigem** Inhalt.
---rechts
Rechte Spalte.
:::`,
    icon: Columns2,
  },
  {
    name: "Tabs",
    description: "Tab-Navigation mit umschaltbaren Inhalten. Optional mit Icon (Lucide-Name nach |). Verschachtelung moeglich.",
    syntax: `:::tabs
---Uebersicht|book-open
Inhalt des ersten Tabs.
---Details|settings
Inhalt des zweiten Tabs.

:::merke
Verschachtelte Bloecke funktionieren!
:::
:::`,
    icon: PanelTop,
  },
  {
    name: "Karten",
    description: "Responsive Karten-Grid. Spaltenanzahl nach |, Badges pro Karte mit Titel|Badge|Farbe. Verschachtelung moeglich.",
    syntax: `:::karten|3
---Karte 1|Basis|orange
Inhalt der ersten Karte.
---Karte 2|Premium|blue
Inhalt der zweiten Karte.
---Karte 3
Karte ohne Badge.
:::`,
    icon: LayoutGrid,
    properties: [
      { key: "Spalten", desc: ":::karten|2 oder :::karten|3 (Standard: 2)" },
      { key: "Badge-Farben", desc: "orange | gray | blue | green | red | purple | beige" },
    ],
  },
  {
    name: "Icons (inline)",
    description: "Lucide-Icons inline im Text einfuegen. Ueber 1600 Icons verfuegbar.",
    syntax: `:icon[heart] :icon[star] :icon[arrow-right] :icon[check]

Im Fliesstext: Das Paket :icon[package] wird versendet :icon[truck].`,
    icon: Smile,
  },
  {
    name: "HTML/CSS/JS Demo",
    description: "Interaktives Code-Beispiel mit HTML, CSS und JavaScript in einem Sandbox-iFrame.",
    syntax: `:::htmldemo
title: Farbmischer
height: 200
---html
<button onclick="change()">Klick mich</button>
<div id="box" style="width:100px;height:100px;background:red"></div>
---css
button { padding: 8px 16px; cursor: pointer; }
---js
function change() {
  const c = '#'+Math.floor(Math.random()*16777215).toString(16);
  document.getElementById('box').style.background = c;
}
:::`,
    icon: Globe,
  },
  {
    name: "Textformatierung (inline)",
    description: "Ueber den Format-Popover (Text markieren) oder direkt als HTML im Markdown.",
    syntax: `<span style="color: #ef4444">Roter Text</span>
<span style="font-size: 1.25rem">Grosser Text</span>
<span style="background: #fef08a; padding: 0 4px; border-radius: 4px">Highlight</span>
<span style="text-align: center; display: block">Zentriert</span>
<span style="background: #f97316; color: white; padding: 2px 10px; border-radius: 9999px; font-size: 0.8rem">Chip/Badge</span>`,
    icon: Bold,
  },
  {
    name: "Standard Markdown",
    description: "Alle ueblichen Markdown-Elemente werden unterstuetzt.",
    syntax: `# Ueberschrift 1
## Ueberschrift 2
### Ueberschrift 3

**Fett**, *Kursiv*, ~~Durchgestrichen~~

- Aufzaehlung
- Weiterer Punkt

1. Nummerierte Liste
2. Zweiter Punkt

> Zitat / Blockquote

\`Inline-Code\` und Code-Bloecke:
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

## 8. Spalten-Layout

:::spalten
---links
Linke Spalte
---rechts
Rechte Spalte
:::

Trennzeichen: ---links, ---mitte, ---rechts (2 oder 3 Spalten).

## 9. Tabs

:::tabs
---Tab 1|book-open
Inhalt des ersten Tabs.
---Tab 2|settings
Inhalt des zweiten Tabs.
:::

Format: ---Titel|icon-name (Icon optional, Lucide-Iconname). Verschachtelung mit anderen Bloecken moeglich.

## 10. Karten-Grid

:::karten|3
---Titel|Badge|orange
Inhalt der Karte.
---Titel 2
Karte ohne Badge.
:::

Format: :::karten|Spaltenanzahl, ---Titel|Badge-Text|Badge-Farbe. Farben: orange, gray, blue, green, red, purple, beige.

## 11. Inline-Icons

:icon[heart] :icon[star] :icon[package] :icon[truck]

Ueber 1600 Lucide-Icons verfuegbar. Werden inline im Text gerendert.

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

// ─── Example Templates ───

const exampleTemplates = [
  {
    name: "Lernbeitrag mit Struktur",
    description: "Typischer Lernbeitrag mit Callouts, Quiz, Accordion und Tabelle",
    content: `## Einfuehrung

Hier beginnt der Lernbeitrag mit einer kurzen Einleitung, die das Thema vorstellt und erklaert, warum es wichtig ist.

:::merke
Die wichtigste Definition oder Kernaussage steht in einer Merke-Box, damit sie sofort ins Auge faellt.
:::

## Grundlagen

Erklaere hier die Grundlagen des Themas. Nutze **fetten Text** fuer Fachbegriffe und *kursiven Text* fuer Betonungen.

### Vergleichstabelle

| Eigenschaft | Variante A | Variante B | Variante C |
| --- | --- | --- | --- |
| Gewicht | Leicht | Mittel | Schwer |
| Kosten | Guenstig | Mittel | Teuer |
| Stabilitaet | Niedrig | Mittel | Hoch |

:::tipp
Praxistipp: So merkst du dir den Unterschied am besten...
:::

???Welche Variante eignet sich am besten fuer schwere Gueter?
[ ] Variante A
[ ] Variante B
[x] Variante C
>>>Variante C hat die hoechste Stabilitaet und ist daher fuer schwere Gueter am besten geeignet.
???

## Vertiefung

+++Exkurs: Historischer Hintergrund
Hier stehen optionale Zusatzinfos, die nicht pruefungsrelevant sind, aber das Verstaendnis vertiefen.
+++

:::warnung
Achtung: Dieser haeufige Fehler fuehrt in der Praxis oft zu Problemen!
:::

## Zusammenfassung

:::merke
Die drei wichtigsten Punkte:
1. Erster Kernpunkt
2. Zweiter Kernpunkt
3. Dritter Kernpunkt
:::`,
  },
  {
    name: "Interaktiver Vergleich",
    description: "Tabs und Karten fuer uebersichtliche Vergleiche",
    content: `## :icon[layers] Materialien im Vergleich

Verschiedene Materialien haben unterschiedliche Eigenschaften. Nutze die Tabs um zwischen den Kategorien zu wechseln.

:::tabs
---Uebersicht|book-open
Hier siehst du alle Materialien auf einen Blick:

:::karten|3
---Material A|Leicht|green
- Gewicht: 100g/m²
- Kosten: Guenstig
- Einsatz: Leichte Produkte

:icon[check] Recycelbar
---Material B|Standard|blue
- Gewicht: 250g/m²
- Kosten: Mittel
- Einsatz: Allround

:icon[check] Recycelbar
---Material C|Premium|orange
- Gewicht: 400g/m²
- Kosten: Hoch
- Einsatz: Schwere Gueter

:icon[check] Recycelbar
:::

---Vorteile & Nachteile|arrow-right

:::spalten
---links
### :icon[check] Vorteile

- Hohe Stabilitaet
- Guter Produktschutz
- Vielseitig einsetzbar

---rechts
### :icon[circle-x] Nachteile

- Hoehere Kosten
- Mehr Materialeinsatz
- Schwerer zu transportieren
:::

---Quiz|help-circle
Teste dein Wissen zu den Materialien:

???Welches Material hat das beste Verhaeltnis von Gewicht zu Stabilitaet?
[ ] Material A
[x] Material B
[ ] Material C
>>>Material B bietet als Allround-Loesung das beste Verhaeltnis aus Gewicht und Stabilitaet.
???
:::`,
  },
  {
    name: "Schritt-fuer-Schritt Anleitung",
    description: "Nummerierte Anleitung mit Bildern, Tipps und Warnungen",
    content: `## :icon[book-open] Anleitung: Prozess Schritt fuer Schritt

Diese Anleitung fuehrt dich durch den gesamten Prozess. Folge den Schritten der Reihe nach.

:::info
**Benoetigte Materialien:** Liste hier alle Materialien und Werkzeuge auf, die benoetigt werden.
:::

### Schritt 1: Vorbereitung

Beschreibe den ersten Schritt ausfuehrlich. Erklaere, worauf man achten muss.

:::tipp
Bereite alle Materialien vor, bevor du beginnst. Das spart Zeit und verhindert Fehler.
:::

### Schritt 2: Durchfuehrung

Beschreibe den Hauptschritt. Nutze eine nummerierte Liste fuer die Reihenfolge:

1. Ersten Arbeitsschritt ausfuehren
2. Ergebnis kontrollieren
3. Zweiten Arbeitsschritt ausfuehren
4. Qualitaetskontrolle durchfuehren

:::warnung
**Sicherheitshinweis:** Trage immer Schutzhandschuhe bei diesem Arbeitsschritt!
:::

### Schritt 3: Kontrolle

+++Checkliste zur Qualitaetskontrolle
- [ ] Punkt 1 geprueft?
- [ ] Punkt 2 geprueft?
- [ ] Punkt 3 geprueft?
- [ ] Ergebnis dokumentiert?
+++

???Was ist der wichtigste Schritt bei der Qualitaetskontrolle?
[ ] Schnell durchfuehren
[x] Systematisch nach Checkliste pruefen
[ ] Nur das Endergebnis ansehen
>>>Eine systematische Kontrolle nach Checkliste stellt sicher, dass kein Pruefpunkt vergessen wird.
???

### Zusammenfassung

:::merke
Die drei wichtigsten Regeln:
1. **Vorbereitung** — Alle Materialien bereithalten
2. **Sorgfalt** — Jeden Schritt genau ausfuehren
3. **Kontrolle** — Ergebnis systematisch pruefen
:::`,
  },
];

// ─── Module Templates (quick-insert building blocks) ───

type ModuleTemplate = {
  name: string;
  description: string;
  icon: LucideIcon;
  category: string;
  content: string;
};

const moduleTemplates: ModuleTemplate[] = [
  // ─── Karten ───
  {
    name: "2 Karten",
    description: "Zwei Karten nebeneinander",
    icon: LayoutGrid,
    category: "Karten",
    content: `:::karten
---Karte 1
Inhalt der ersten Karte.
---Karte 2
Inhalt der zweiten Karte.
:::`,
  },
  {
    name: "3 Karten mit Badges",
    description: "Drei Karten mit farbigen Badges",
    icon: LayoutGrid,
    category: "Karten",
    content: `:::karten|3
---Basis|Standard|gray
- Eigenschaft 1
- Eigenschaft 2
- Eigenschaft 3
---Erweitert|Beliebt|blue
- Alles aus Basis
- Eigenschaft 4
- Eigenschaft 5
---Premium|Empfohlen|orange
- Alles aus Erweitert
- Eigenschaft 6
- Eigenschaft 7
:::`,
  },
  {
    name: "4 Karten Icon-Grid",
    description: "Vier Karten mit Icons als Feature-Grid",
    icon: LayoutGrid,
    category: "Karten",
    content: `:::karten
---:icon[book-open] Lernen
Grundlagen verstehen und Wissen aufbauen.
---:icon[target] Ueben
Durch Wiederholung das Gelernte festigen.
---:icon[check] Pruefen
Mit Quizfragen den Wissensstand testen.
---:icon[star] Meistern
Expertenwissen fuer die Praxis erlangen.
:::`,
  },
  // ─── Tabs ───
  {
    name: "2 Tabs",
    description: "Zwei einfache Tabs",
    icon: PanelTop,
    category: "Tabs",
    content: `:::tabs
---Theorie|book-open
Hier steht die theoretische Erklaerung.
---Praxis|wrench
Hier steht die praktische Anwendung.
:::`,
  },
  {
    name: "3 Tabs mit Inhalt",
    description: "Drei Tabs: Uebersicht, Details, Quiz",
    icon: PanelTop,
    category: "Tabs",
    content: `:::tabs
---Uebersicht|book-open
Kurze Zusammenfassung des Themas.

:::merke
Die wichtigste Erkenntnis hier zusammenfassen.
:::

---Details|layers
### Vertiefung

Ausfuehrliche Erklaerung mit allen Details.

| Aspekt | Beschreibung |
| --- | --- |
| Punkt 1 | Erklaerung |
| Punkt 2 | Erklaerung |

---Quiz|help-circle
Teste dein Wissen:

???Hier steht die Frage?
[ ] Falsche Antwort
[x] Richtige Antwort
[ ] Falsche Antwort
>>>Erklaerung der richtigen Antwort.
???
:::`,
  },
  // ─── Spalten ───
  {
    name: "2 Spalten",
    description: "Zwei Spalten nebeneinander",
    icon: Columns2,
    category: "Layouts",
    content: `:::spalten
---links
### Linke Spalte
Inhalt der linken Spalte.
---rechts
### Rechte Spalte
Inhalt der rechten Spalte.
:::`,
  },
  {
    name: "Vorteile / Nachteile",
    description: "Pro-Contra Vergleich in zwei Spalten",
    icon: Columns2,
    category: "Layouts",
    content: `:::spalten
---links
### :icon[check] Vorteile

- Vorteil 1
- Vorteil 2
- Vorteil 3

---rechts
### :icon[circle-x] Nachteile

- Nachteil 1
- Nachteil 2
- Nachteil 3
:::`,
  },
  {
    name: "Bild + Text",
    description: "Bild links, Text rechts",
    icon: Columns2,
    category: "Layouts",
    content: `:::spalten
---links
:::bild[/uploads/beispiel.jpg]
size: full
rounded: true
:::
---rechts
### Titel

Beschreibender Text neben dem Bild. Ideal fuer Erklaerungen mit visueller Unterstuetzung.
:::`,
  },
  // ─── Bloecke ───
  {
    name: "Callout-Set",
    description: "Alle vier Callout-Varianten",
    icon: BookOpen,
    category: "Bloecke",
    content: `:::merke
**Merke:** Wichtige Fakten und Definitionen hier.
:::

:::tipp
**Tipp:** Hilfreiche Hinweise und Eselsbruecken hier.
:::

:::warnung
**Achtung:** Warnungen und haeufige Fehler hier.
:::

:::info
**Info:** Zusaetzliche Hintergrundinformationen hier.
:::`,
  },
  {
    name: "FAQ Accordion",
    description: "Drei aufklappbare Fragen",
    icon: ChevronDown,
    category: "Bloecke",
    content: `+++Frage 1: Was ist ...?
Antwort auf die erste Frage. Kann auch **formatierten Text** enthalten.
+++

+++Frage 2: Wie funktioniert ...?
Ausfuehrliche Erklaerung zur zweiten Frage.
+++

+++Frage 3: Warum ist ... wichtig?
Begruendung und Zusammenhang erklaeren.
+++`,
  },
  {
    name: "Quiz-Block (3 Fragen)",
    description: "Drei Multiple-Choice Fragen",
    icon: HelpCircle,
    category: "Bloecke",
    content: `???Frage 1: Hier steht die erste Frage?
[ ] Antwort A
[x] Antwort B (richtig)
[ ] Antwort C
>>>Erklaerung: Antwort B ist richtig, weil...
???

???Frage 2: Hier steht die zweite Frage?
[x] Antwort A (richtig)
[ ] Antwort B
[ ] Antwort C
>>>Erklaerung: Antwort A ist richtig, weil...
???

???Frage 3: Hier steht die dritte Frage?
[ ] Antwort A
[ ] Antwort B
[x] Antwort C (richtig)
>>>Erklaerung: Antwort C ist richtig, weil...
???`,
  },
  {
    name: "Vergleichstabelle",
    description: "Tabelle mit Vergleich und Emojis",
    icon: Table,
    category: "Bloecke",
    content: `| Eigenschaft | Variante A | Variante B | Variante C |
| --- | --- | --- | --- |
| Gewicht | Leicht | Mittel | Schwer |
| Kosten | Guenstig | Mittel | Teuer |
| Stabilitaet | Niedrig | Mittel | Hoch |
| Empfehlung | Einfache Produkte | Allround | Schwere Gueter |`,
  },
  // ─── Kombinationen ───
  {
    name: "Lernabschnitt komplett",
    description: "Erklaerung + Merke + Quiz in einem",
    icon: FileText,
    category: "Kombinationen",
    content: `### Abschnittstitel

Hier steht die Erklaerung des Themas. Nutze **fetten Text** fuer wichtige Begriffe und beschreibe das Thema verstaendlich.

:::merke
Die zentrale Erkenntnis dieses Abschnitts in einem Satz zusammengefasst.
:::

:::tipp
Ein praktischer Tipp, der beim Lernen oder in der Praxis hilft.
:::

???Verstaendnisfrage zu diesem Abschnitt?
[ ] Falsche Antwort A
[x] Richtige Antwort B
[ ] Falsche Antwort C
>>>Erklaerung, warum B richtig ist.
???`,
  },
  {
    name: "Feature-Showcase",
    description: "Tabs mit Karten und Icons fuer Produktvorstellung",
    icon: Boxes,
    category: "Kombinationen",
    content: `:::tabs
---Uebersicht|layers
:::karten|3
---:icon[zap] Schnell
Blitzschnelle Verarbeitung in kuerzester Zeit.
---:icon[shield] Sicher
Hoechste Qualitaets- und Sicherheitsstandards.
---:icon[recycle] Nachhaltig
Umweltfreundliche Materialien und Prozesse.
:::

---Vergleich|arrow-right

| Merkmal | Standard | Premium |
| --- | --- | --- |
| Geschwindigkeit | Normal | 2x schneller |
| Material | Basis | Hochwertig |
| Garantie | 1 Jahr | 3 Jahre |

---Tipp|lightbulb
:::tipp
Fuer die meisten Anwendungen reicht die Standard-Variante. Premium lohnt sich bei hohen Stueckzahlen und besonderen Anforderungen.
:::
:::`,
  },
];

// ─── Keyboard Shortcuts Reference ───

const keyboardShortcuts = [
  { category: "Formatierung", shortcuts: [
    { keys: `${modLabel}B`, desc: "Fett" },
    { keys: `${modLabel}I`, desc: "Kursiv" },
    { keys: `${modLabel}K`, desc: "Link einfuegen" },
    { keys: `${modLabel}E`, desc: "Inline Code" },
    { keys: `${modLabel}${shiftLabel}E`, desc: "Code-Block" },
    { keys: `${modLabel}${shiftLabel}X`, desc: "Durchgestrichen" },
  ]},
  { category: "Bloecke & Medien", shortcuts: [
    { keys: `${modLabel}${shiftLabel}H`, desc: "Trennlinie einfuegen" },
    { keys: `${modLabel}${shiftLabel}P`, desc: "Bild einfuegen (Modal)" },
    { keys: "/", desc: "Slash-Menu oeffnen" },
  ]},
  { category: "Bearbeitung", shortcuts: [
    { keys: `${modLabel}Z`, desc: "Rueckgaengig (Undo)" },
    { keys: `${modLabel}${shiftLabel}Z`, desc: "Wiederholen (Redo)" },
    { keys: `${modLabel}D`, desc: "Zeile/Block duplizieren" },
    { keys: `${modLabel}${shiftLabel}↑`, desc: "Block nach oben" },
    { keys: `${modLabel}${shiftLabel}↓`, desc: "Block nach unten" },
  ]},
  { category: "Listen & Einrueckung", shortcuts: [
    { keys: "Enter", desc: "Liste automatisch fortsetzen" },
    { keys: "Enter (leer)", desc: "Liste beenden" },
    { keys: "Tab", desc: "Einruecken / Liste verschachteln" },
    { keys: `${shiftLabel}Tab`, desc: "Ausruecken" },
  ]},
  { category: "Auto-Pairing (Text markiert)", shortcuts: [
    { keys: "* oder _", desc: "Text mit *...* umschliessen" },
    { keys: "( oder [", desc: "Text mit (...) bzw. [...] umschliessen" },
    { keys: "` oder \"", desc: "Text mit `...` bzw. \"...\" umschliessen" },
  ]},
];

function BlockHelpOverlay({ onClose, onInsertTemplate }: { onClose: () => void; onInsertTemplate?: (content: string) => void }) {
  const [copied, setCopied] = useState(false);
  const [copiedBlock, setCopiedBlock] = useState<string | null>(null);
  const [tab, setTab] = useState<"blocks" | "shortcuts" | "templates">("blocks");
  const [previewTemplate, setPreviewTemplate] = useState<number | null>(null);

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

  const tabs = [
    { id: "blocks" as const, label: "Bloecke", icon: Code2 },
    { id: "shortcuts" as const, label: "Tastenkuerzel", icon: Minus },
    { id: "templates" as const, label: "Vorlagen", icon: Copy },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-card border border-border/60 rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-0 border-b border-border/40">
          <div className="flex items-center gap-4">
            <h3 className="font-semibold text-foreground text-lg">Hilfe</h3>
            <div className="flex gap-1">
              {tabs.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 -mb-[1px] transition-colors ${
                      tab === t.id
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-2 pb-2">
            {tab === "blocks" && (
              <button
                type="button"
                onClick={copyPrompt}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-accent text-xs font-medium text-foreground hover:bg-accent/80 transition-colors"
                title="KI-Prompt in die Zwischenablage kopieren"
              >
                {copied ? (
                  <><CheckCheck className="w-3.5 h-3.5 text-emerald-600" /><span className="text-emerald-600">Kopiert!</span></>
                ) : (
                  <><Copy className="w-3.5 h-3.5" />KI-Prompt</>
                )}
              </button>
            )}
            <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* ─── Blocks Tab ─── */}
          {tab === "blocks" && (
            <div className="space-y-6">
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
                                <span key={v} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-accent text-muted-foreground">{v}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{block.description}</p>
                      </div>
                    </div>
                    <div className="relative ml-11">
                      <pre className="bg-foreground/[0.03] border border-border/40 rounded-lg p-3 text-xs font-mono text-foreground/80 overflow-x-auto whitespace-pre-wrap">{block.syntax}</pre>
                      <button
                        type="button"
                        onClick={() => copyBlockSyntax(block.syntax, block.name)}
                        className="absolute top-2 right-2 p-1.5 rounded-md bg-card border border-border/40 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Syntax kopieren"
                      >
                        {copiedBlock === block.name ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {block.properties && (
                      <div className="ml-11 mt-2 rounded-lg border border-border/40 overflow-hidden">
                        <table className="w-full text-xs">
                          <thead><tr className="bg-accent/50"><th className="text-left px-3 py-1.5 font-medium text-foreground">Eigenschaft</th><th className="text-left px-3 py-1.5 font-medium text-foreground">Werte</th></tr></thead>
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
            </div>
          )}

          {/* ─── Shortcuts Tab ─── */}
          {tab === "shortcuts" && (
            <div className="space-y-6">
              {keyboardShortcuts.map((group) => (
                <div key={group.category}>
                  <h4 className="text-sm font-semibold text-foreground mb-2">{group.category}</h4>
                  <div className="rounded-lg border border-border/40 overflow-hidden">
                    {group.shortcuts.map((s, i) => (
                      <div key={i} className={`flex items-center justify-between px-4 py-2.5 ${i > 0 ? "border-t border-border/30" : ""}`}>
                        <span className="text-sm text-foreground/80">{s.desc}</span>
                        <kbd className="px-2 py-1 rounded-md bg-accent/70 border border-border/40 font-mono text-xs text-foreground/70">{s.keys}</kbd>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="rounded-lg bg-accent/30 border border-border/40 p-4">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Tipp:</strong> Markiere Text und druecke eine der Auto-Pairing-Tasten, um den Text automatisch zu umschliessen.
                  Die meisten Formatierungen sind auch ueber den <strong className="text-foreground">Format-Popover</strong> erreichbar (Text markieren → Popover erscheint).
                </p>
              </div>
            </div>
          )}

          {/* ─── Templates Tab ─── */}
          {tab === "templates" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Fertige Vorlagen zum Einfuegen. Klicke auf &quot;Vorschau&quot; um den Inhalt zu sehen, oder fuege ihn direkt in den Editor ein.
              </p>
              {exampleTemplates.map((tmpl, i) => (
                <div key={i} className="rounded-lg border border-border/40 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-accent/30">
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">{tmpl.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{tmpl.description}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      <button
                        type="button"
                        onClick={() => setPreviewTemplate(previewTemplate === i ? null : i)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          previewTemplate === i ? "bg-primary/10 text-primary" : "bg-accent text-foreground hover:bg-accent/80"
                        }`}
                      >
                        {previewTemplate === i ? "Ausblenden" : "Vorschau"}
                      </button>
                      <button
                        type="button"
                        onClick={() => { navigator.clipboard.writeText(tmpl.content); setCopiedBlock(tmpl.name); setTimeout(() => setCopiedBlock(null), 2000); }}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-accent text-foreground hover:bg-accent/80 transition-colors"
                      >
                        {copiedBlock === tmpl.name ? "Kopiert!" : "Kopieren"}
                      </button>
                      {onInsertTemplate && (
                        <button
                          type="button"
                          onClick={() => { onInsertTemplate(tmpl.content); onClose(); }}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                          Einfuegen
                        </button>
                      )}
                    </div>
                  </div>
                  {previewTemplate === i && (
                    <div className="border-t border-border/40">
                      <div className="p-4 max-h-80 overflow-y-auto">
                        <pre className="text-xs font-mono text-foreground/70 whitespace-pre-wrap">{tmpl.content}</pre>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
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
  const [menuOpensUp, setMenuOpensUp] = useState(false);
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
    // Center on selection, but clamp so the popover (~420px wide) stays in bounds
    const popoverWidth = 420;
    const centerX = span.offsetLeft + span.offsetWidth / 2;
    const halfWidth = popoverWidth / 2;
    const left = Math.max(halfWidth + 4, Math.min(centerX, ta.clientWidth - halfWidth - 4));

    document.body.removeChild(mirror);
    return { top: Math.max(-44, top), left };
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

  function calculateMenuPosition(): { top: number; left: number; opensUp: boolean } {
    const ta = textareaRef.current;
    if (!ta) return { top: 0, left: 60, opensUp: false };

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

    const cursorTopInTa = span.offsetTop - ta.scrollTop + 28;
    const left = Math.min(span.offsetLeft + 12, ta.clientWidth - 290);

    document.body.removeChild(mirror);

    // Check if menu would overflow viewport bottom
    const taRect = ta.getBoundingClientRect();
    const menuMaxHeight = Math.min(360, window.innerHeight * 0.5);
    const cursorScreenY = taRect.top + cursorTopInTa;

    let top: number;
    let opensUp = false;
    if (cursorScreenY + menuMaxHeight > window.innerHeight - 16) {
      // Not enough space below → position above cursor
      top = cursorTopInTa - menuMaxHeight - 8;
      opensUp = true;
    } else {
      top = cursorTopInTa;
    }

    return { top: Math.max(0, top), left: Math.max(12, left), opensUp };
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const mod = e.metaKey || e.ctrlKey;
    const ta = e.currentTarget;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const hasSelection = start !== end;

    // ─── Undo / Redo ───
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

    // ─── Format Shortcuts ───
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
    if (mod && e.shiftKey && e.key === "x") {
      e.preventDefault();
      wrapSelection("~~", "~~", "durchgestrichen");
      return;
    }
    if (mod && e.key === "e") {
      e.preventDefault();
      wrapSelection("`", "`", "code");
      return;
    }
    if (mod && e.shiftKey && e.key === "e") {
      e.preventDefault();
      wrapSelection("```\n", "\n```", "code");
      return;
    }
    if (mod && e.shiftKey && e.key === "h") {
      e.preventDefault();
      insertText("---\n");
      return;
    }
    if (mod && e.shiftKey && e.key === "p") {
      e.preventDefault();
      setModal("image");
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

    // ─── Auto-Pairing: wrap selection with typed character ───
    const pairMap: Record<string, [string, string]> = {
      "(": ["(", ")"],
      "[": ["[", "]"],
      "{": ["{", "}"],
      '"': ['"', '"'],
      "'": ["'", "'"],
      "*": ["*", "*"],
      "~": ["~", "~"],
      "`": ["`", "`"],
      "_": ["_", "_"],
    };
    if (hasSelection && pairMap[e.key] && !mod) {
      e.preventDefault();
      const [open, close] = pairMap[e.key];
      const selected = value.slice(start, end);
      const newVal = value.slice(0, start) + open + selected + close + value.slice(end);
      pushHistory(newVal, true);
      onChange(newVal);
      requestAnimationFrame(() => {
        ta.selectionStart = start + open.length;
        ta.selectionEnd = end + open.length;
        ta.focus();
      });
      return;
    }

    // ─── Smart Enter: list continuation ───
    if (e.key === "Enter" && !showMenu && !mod && !e.shiftKey) {
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const currentLine = value.slice(lineStart, start);

      // Match unordered list: "  - " or "- " (with any indent)
      const ulMatch = currentLine.match(/^(\s*)([-*+])\s/);
      // Match ordered list: "  1. " or "1. " (with any indent)
      const olMatch = currentLine.match(/^(\s*)(\d+)\.\s/);
      // Match checkbox: "  - [ ] " or "  - [x] "
      const cbMatch = currentLine.match(/^(\s*)([-*+])\s\[[ x]\]\s/);

      const listMatch = cbMatch || ulMatch || olMatch;

      if (listMatch) {
        const indent = listMatch[1];
        const contentAfterMarker = cbMatch
          ? currentLine.slice(cbMatch[0].length)
          : ulMatch
            ? currentLine.slice(ulMatch[0].length)
            : currentLine.slice(olMatch![0].length);

        // Empty list item → remove it and exit list
        if (!contentAfterMarker.trim()) {
          e.preventDefault();
          const newVal = value.slice(0, lineStart) + "\n" + value.slice(end);
          pushHistory(newVal, true);
          onChange(newVal);
          requestAnimationFrame(() => {
            ta.selectionStart = ta.selectionEnd = lineStart + 1;
            ta.focus();
          });
          return;
        }

        // Continue the list
        e.preventDefault();
        let nextMarker: string;
        if (cbMatch) {
          nextMarker = `${indent}${cbMatch[2]} [ ] `;
        } else if (olMatch) {
          const nextNum = parseInt(olMatch[2], 10) + 1;
          nextMarker = `${indent}${nextNum}. `;
        } else {
          nextMarker = `${indent}${ulMatch![2]} `;
        }
        const insert = "\n" + nextMarker;
        const newVal = value.slice(0, start) + insert + value.slice(end);
        pushHistory(newVal, true);
        onChange(newVal);
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = start + insert.length;
          ta.focus();
        });
        return;
      }
    }

    // ─── Tab: indent/outdent in lists ───
    if (e.key === "Tab") {
      e.preventDefault();
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const currentLine = value.slice(lineStart, value.indexOf("\n", start) === -1 ? undefined : value.indexOf("\n", start));
      const isList = /^\s*[-*+]\s|^\s*\d+\.\s/.test(currentLine);

      if (e.shiftKey) {
        // Outdent: remove up to 2 spaces from line start
        if (value.slice(lineStart, lineStart + 2) === "  ") {
          const newVal = value.slice(0, lineStart) + value.slice(lineStart + 2);
          pushHistory(newVal, true);
          onChange(newVal);
          requestAnimationFrame(() => {
            ta.selectionStart = Math.max(start - 2, lineStart);
            ta.selectionEnd = Math.max(end - 2, lineStart);
          });
        }
      } else if (isList) {
        // Indent list item
        const newVal = value.slice(0, lineStart) + "  " + value.slice(lineStart);
        pushHistory(newVal, true);
        onChange(newVal);
        requestAnimationFrame(() => {
          ta.selectionStart = start + 2;
          ta.selectionEnd = end + 2;
        });
      } else {
        // Regular tab: insert 2 spaces
        const newVal = value.slice(0, start) + "  " + value.slice(end);
        pushHistory(newVal, true);
        onChange(newVal);
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = start + 2;
        });
      }
      return;
    }

    // ─── Slash command menu navigation ───
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
      requestAnimationFrame(() => {
        const pos = calculateMenuPosition();
        setMenuPosition({ top: pos.top, left: pos.left });
        setMenuOpensUp(pos.opensUp);
      });
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
                className={`absolute z-50 w-80 rounded-xl border border-border/60 bg-card shadow-xl overflow-hidden flex flex-col ${menuOpensUp ? "animate-slash-menu-up" : "animate-slash-menu-down"}`}
                style={{ top: menuPosition?.top ?? 0, left: menuPosition?.left ?? 16, maxHeight: "min(360px, 50vh)" }}
              >
                <style dangerouslySetInnerHTML={{ __html: `
                  @keyframes slashMenuInDown {
                    from { opacity: 0; transform: translateY(-4px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                  }
                  @keyframes slashMenuInUp {
                    from { opacity: 0; transform: translateY(4px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                  }
                  .animate-slash-menu-down { animation: slashMenuInDown 120ms ease-out; }
                  .animate-slash-menu-up { animation: slashMenuInUp 120ms ease-out; }
                ` }} />
                <div className="px-3 py-2 border-b border-border/40 shrink-0">
                  <p className="text-xs text-muted-foreground">
                    {filter ? (
                      <>Suche: <span className="text-primary font-medium">{filter}</span> <span className="text-muted-foreground/60">({flatFiltered.length})</span></>
                    ) : (
                      "Bloecke einfuegen"
                    )}
                  </p>
                </div>
                <div className="overflow-y-auto overscroll-contain flex-1 p-1" style={{ scrollbarGutter: "stable" }}>
                  {(() => {
                    let idx = 0;
                    return Object.entries(grouped).map(([category, cmds]) => (
                      <div key={category}>
                        <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider px-2.5 pt-2.5 pb-1">
                          {category}
                        </p>
                        {cmds.map((cmd) => {
                          const globalIndex = idx++;
                          const shortcut = COMMAND_SHORTCUTS[cmd.id];
                          return (
                            <button
                              key={cmd.id}
                              ref={globalIndex === selectedIndex ? (el) => { el?.scrollIntoView({ block: "nearest" }); } : undefined}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleSelect(cmd);
                              }}
                              onMouseEnter={() => setSelectedIndex(globalIndex)}
                              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                                globalIndex === selectedIndex
                                  ? "bg-primary/10 text-foreground"
                                  : "text-foreground/80 hover:bg-accent/50"
                              }`}
                            >
                              <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                                globalIndex === selectedIndex ? "bg-primary/15 text-primary" : "bg-accent/70 text-muted-foreground"
                              }`}>
                                <cmd.icon className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="text-[13px] font-medium">{cmd.label}</span>
                                <span className="text-[11px] text-muted-foreground ml-1.5 hidden sm:inline">{cmd.description}</span>
                              </div>
                              {shortcut && (
                                <kbd className="shrink-0 text-[10px] font-mono text-muted-foreground/50 bg-accent/60 px-1.5 py-0.5 rounded border border-border/30">
                                  {shortcut}
                                </kbd>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ));
                  })()}
                </div>
                {!filter && (
                  <div className="px-3 py-1.5 border-t border-border/40 shrink-0">
                    <p className="text-[10px] text-muted-foreground/60">
                      <kbd className="px-1 py-0.5 rounded bg-accent/70 font-mono text-[9px]">↑↓</kbd> navigieren
                      <span className="mx-1.5">·</span>
                      <kbd className="px-1 py-0.5 rounded bg-accent/70 font-mono text-[9px]">↵</kbd> einfuegen
                      <span className="mx-1.5">·</span>
                      <kbd className="px-1 py-0.5 rounded bg-accent/70 font-mono text-[9px]">esc</kbd> schliessen
                    </p>
                  </div>
                )}
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
      {modal === "karten" && (
        <KartenModal onInsert={handleModalInsert} onClose={() => setModal(null)} />
      )}
      {modal === "tabs" && (
        <TabsModal onInsert={handleModalInsert} onClose={() => setModal(null)} />
      )}
      {modal === "icon" && (
        <IconModal onInsert={handleModalInsert} onClose={() => setModal(null)} />
      )}
      {modal === "einheit" && (
        <EinheitModal onInsert={handleModalInsert} onClose={() => setModal(null)} />
      )}
      {modal === "vorlage" && (
        <VorlageModal onInsert={handleModalInsert} onClose={() => setModal(null)} />
      )}
      {showHelp && (
        <BlockHelpOverlay onClose={() => setShowHelp(false)} onInsertTemplate={(content) => { insertText(content); }} />
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
