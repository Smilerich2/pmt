"use client";

import { useState, useRef, useEffect } from "react";
import {
  Copy,
  CheckCheck,
  FileCode,
  Eye,
  Pencil,
  Sparkles,
  FolderOpen,
  Upload,
  Film,
  Loader2,
  X,
  Check,
} from "lucide-react";

// ─── Typen ───

type MediaFile = {
  name: string;
  url: string;
  size: number;
  type: "image" | "video";
  createdAt: string;
};

// ─── Hilfsfunktionen ───

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

// ─── Base CSS – wird automatisch in jeden HTML-Beitrag injiziert ───
// User-eigene <style>-Tags überschreiben diese Regeln.
export const BASE_CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{
  font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  font-size:16px;line-height:1.6;color:#1e293b;background:#fff;padding:1.5rem
}
@media(max-width:640px){body{padding:1rem;font-size:15px}}
h1,h2,h3,h4,h5,h6{line-height:1.3;font-weight:700;margin-bottom:.5em;margin-top:1.5em;color:#0f172a}
h1:first-child,h2:first-child,h3:first-child,h4:first-child{margin-top:0}
h1{font-size:2rem}h2{font-size:1.5rem}h3{font-size:1.25rem}h4{font-size:1.1rem}
p{margin-bottom:1em}
ul,ol{margin-bottom:1em;padding-left:1.5em}li{margin-bottom:.25em}
table{width:100%;border-collapse:collapse;margin-bottom:1em}
th,td{border:1px solid #e2e8f0;padding:.5em .75em;text-align:left}
th{background:#f8fafc;font-weight:600}
img{max-width:100%;height:auto;border-radius:.5rem}
button{cursor:pointer;font-family:inherit;border-radius:.375rem;padding:.5em 1em;border:none;background:#3b82f6;color:#fff;font-size:.875rem;font-weight:500;transition:opacity .15s}
button:hover{opacity:.85}
input,select,textarea{font-family:inherit;font-size:1rem;border:1px solid #cbd5e1;border-radius:.375rem;padding:.5em .75em;width:100%;box-sizing:border-box;margin-bottom:.5em}
a{color:#3b82f6;text-decoration:underline}
code{font-family:monospace;background:#f1f5f9;padding:.1em .4em;border-radius:.25rem;font-size:.875em}
pre{background:#1e293b;color:#e2e8f0;padding:1em;border-radius:.5rem;overflow-x:auto;margin-bottom:1em}
pre code{background:none;padding:0;color:inherit}
`.trim();

// ─── Auto-Resize Script – meldet Höhe an Parent-Seite ───
const RESIZE_SCRIPT = `<script>(function(){
  function s(){parent.postMessage({iframeHeight:document.documentElement.scrollHeight},'*')}
  if(document.readyState==='loading'){window.addEventListener('load',s)}else{s()}
  new ResizeObserver(s).observe(document.body);
})()</script>`;

// ─── Baut das vollständige srcDoc: Base-Tag + Base-CSS + User-HTML + Resize-Script ───
// Der <base>-Tag sorgt dafür dass /uploads/... Pfade im iframe korrekt aufgelöst werden.
export function buildSrcDoc(html: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const baseTag = origin ? `<base href="${origin}/">` : "";
  const baseCssTag = `<style id="__pmt_base">\n${BASE_CSS}\n</style>`;
  const trimmed = html.trim();

  if (/<html/i.test(trimmed)) {
    // Vollständiges HTML-Dokument
    let result = trimmed;
    if (/<head[^>]*>/i.test(result)) {
      // Base-Tag + Base-CSS direkt nach <head> einfügen (vor User-Styles)
      result = result.replace(/(<head[^>]*>)/i, `$1\n${baseTag}\n${baseCssTag}`);
    }
    if (/<\/body>/i.test(result)) {
      result = result.replace(/<\/body>/i, `${RESIZE_SCRIPT}\n</body>`);
    } else {
      result += RESIZE_SCRIPT;
    }
    return result;
  }

  // HTML-Fragment: in vollständiges Dokument einwickeln
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${baseTag}
  ${baseCssTag}
</head>
<body>
${trimmed}
${RESIZE_SCRIPT}
</body>
</html>`;
}

// ─── Starter-Template ───
const STARTER_TEMPLATE = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* Eigene Styles hier – überschreiben das Base-CSS */

  </style>
</head>
<body>

  <h1>Titel</h1>
  <p>Dein Inhalt hier...</p>

  <script>
    // JavaScript hier
  </script>
</body>
</html>`;

// ─── Extrahiert den Inhalt des ersten <style>-Blocks ───
function extractUserStyle(html: string): string {
  const match = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  return match ? match[1].trim() : "";
}

// ─── KI-Prompt generieren (Base-CSS + User-Style + Medien-Hinweis) ───
function generateHtmlAIPrompt(userStyle: string): string {
  return `Du erstellst HTML-Inhalte für eine Lernplattform für Auszubildende zum Packmitteltechnologen.

# AUSGABEFORMAT

Gib AUSSCHLIESSLICH vollständiges, valides HTML zurück. Kein Markdown, keine Erklärungen, kein Code-Fence-Wrapper (keine \`\`\`html). Der Code wird 1:1 in den Editor eingefügt.
Nutze immer die vollständige Dokumentstruktur: <!DOCTYPE html> ... </html>

# VORHANDENES BASE-CSS (wird automatisch geladen – nicht wiederholen)

Das folgende CSS ist in jede Seite bereits eingebunden. Du musst es NICHT nochmal definieren, kannst es aber mit eigenem <style>-Tag überschreiben:

\`\`\`css
${BASE_CSS}
\`\`\`
${
  userStyle
    ? `
# AKTUELLER STIL DIESES BEITRAGS

Passe neue Inhalte an diesen bestehenden Stil an oder ergänze ihn konsistent:

\`\`\`css
${userStyle}
\`\`\`
`
    : ""
}
# MEDIEN EINBINDEN

Bilder und Videos aus der Medienbibliothek können direkt per Pfad eingebunden werden:
- Bilder: <img src="/uploads/dateiname.jpg" alt="Beschreibung">
- Videos: <video src="/uploads/dateiname.mp4" controls></video>
Die konkreten Dateinamen erfährst du vom Nutzer oder lässt Platzhalter stehen.

# VORGABEN

- Nutze das Base-CSS als Basis. Überschreibe oder ergänze im <style>-Tag nur was wirklich nötig ist.
- Responsiv: Inhalte müssen auf Handy (320 px), Tablet (768 px) und Desktop (1280 px) gut aussehen.
- Verwende CSS-Variablen oder Klassen für konsistente Farben und Abstände.
- Interaktive Elemente (Buttons, Tabs, Animationen) sind erwünscht – sauber in vanilla JS.
- Kein externes CSS-Framework (kein Bootstrap, kein Tailwind CDN), nur plain CSS.
- Schreibe für Berufsschüler (16–20 Jahre): klare Sprache, kurze Sätze, aktive Ansprache ("Du").
- Fachbegriffe aus der Packmitteltechnologie beim ersten Vorkommen kurz erklären.
- Praxisbeispiele aus dem Berufsalltag eines Packmitteltechnologen einbauen.

# BEISPIEL-ANFRAGE

"Erstelle eine interaktive Übersicht der Wellpappenarten mit aufklappbaren Karten und farbiger Hervorhebung."`;
}

// ─── Media-Modal: Bibliothek + Direkt-Upload ───

function MediaModal({
  onInsert,
  onClose,
}: {
  onInsert: (html: string) => void;
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
      const res = await fetch("/api/media");
      const data = await res.json();
      setFiles(data);
      setSelected(result);
    }
    setUploading(false);
    // Input zurücksetzen damit dieselbe Datei nochmal gewählt werden kann
    e.target.value = "";
  }

  function handleInsert() {
    if (!selected) return;
    const file = files.find((f) => f.url === selected);
    if (file?.type === "video") {
      onInsert(`<video src="${selected}" controls style="max-width:100%;border-radius:.5rem;"></video>\n`);
    } else {
      onInsert(`<img src="${selected}" alt="" style="max-width:100%;">\n`);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
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
              disabled={uploading}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              Hochladen
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleUpload}
            className="hidden"
          />
        </div>

        {/* Datei-Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <FolderOpen className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-sm">Noch keine Medien hochgeladen.</p>
              <p className="text-xs mt-1 opacity-60">Klicke auf „Hochladen" um Dateien hinzuzufügen.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {files.map((file) => (
                <button
                  key={file.url}
                  type="button"
                  onClick={() => setSelected(file.url === selected ? null : file.url)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selected === file.url
                      ? "border-primary shadow-md"
                      : "border-border/40 hover:border-border"
                  }`}
                >
                  {file.type === "video" ? (
                    <div className="w-full h-full bg-muted flex flex-col items-center justify-center gap-1">
                      <Film className="w-8 h-8 text-muted-foreground/50" />
                      <span className="text-[10px] text-muted-foreground px-1 truncate max-w-full">
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
          <p className="text-xs text-muted-foreground">
            {selected
              ? `Ausgewählt: ${files.find((f) => f.url === selected)?.name ?? selected}`
              : "Klicke ein Medium an um es auszuwählen"}
          </p>
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

// ─── Hauptkomponente ───

export function HtmlPageEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [copied, setCopied] = useState(false);
  const [templateLabel, setTemplateLabel] = useState("Template");
  const [showMedia, setShowMedia] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fügt Text an der aktuellen Cursor-Position in die Textarea ein
  function insertAtCursor(text: string) {
    const ta = textareaRef.current;
    if (!ta) {
      onChange(value + text);
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const newValue = value.slice(0, start) + text + value.slice(end);
    onChange(newValue);
    // Cursor nach dem eingefügten Text setzen
    requestAnimationFrame(() => {
      ta.selectionStart = ta.selectionEnd = start + text.length;
      ta.focus();
    });
  }

  function insertStarterTemplate() {
    if (!value.trim() || confirm("Aktuellen Inhalt mit Starter-Template ersetzen?")) {
      onChange(STARTER_TEMPLATE);
      setTemplateLabel("Eingefügt!");
      setTimeout(() => setTemplateLabel("Template"), 2000);
    }
  }

  function copyAIPrompt() {
    const userStyle = extractUserStyle(value);
    navigator.clipboard.writeText(generateHtmlAIPrompt(userStyle));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleMediaInsert(html: string) {
    setShowMedia(false);
    // Wechsle zu Code-Ansicht damit man den eingefügten Tag sieht
    setMode("edit");
    insertAtCursor(html);
  }

  const srcDoc = buildSrcDoc(value || "<p style='color:#94a3b8'>Noch kein Inhalt.</p>");

  return (
    <>
      <div className="border border-border/60 rounded-xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border/60 bg-muted/30">
          {/* Modus-Toggle */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMode("edit")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                mode === "edit"
                  ? "bg-background text-foreground shadow-sm border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Pencil className="w-3.5 h-3.5" />
              Code
            </button>
            <button
              type="button"
              onClick={() => setMode("preview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                mode === "preview"
                  ? "bg-background text-foreground shadow-sm border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Vorschau
            </button>
          </div>

          {/* Aktions-Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => { setMode("edit"); setShowMedia(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              title="Bild oder Video aus der Medienbibliothek einfügen"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              Medien
            </button>
            <div className="w-px h-4 bg-border/60 mx-0.5" />
            <button
              type="button"
              onClick={insertStarterTemplate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              title="Leeres HTML-Grundgerüst einfügen"
            >
              <FileCode className="w-3.5 h-3.5" />
              {templateLabel}
            </button>
            <button
              type="button"
              onClick={copyAIPrompt}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              title="KI-Prompt kopieren – enthält Base-CSS und deinen Stil für konsistente Ausgaben"
            >
              {copied ? (
                <>
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600">Kopiert!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  KI-Prompt
                </>
              )}
            </button>
          </div>
        </div>

        {/* Inhalt: Code oder Vorschau */}
        {mode === "edit" ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full min-h-[520px] p-4 font-mono text-sm bg-[#1e1e2e] text-[#cdd6f4] resize-y focus:outline-none leading-relaxed"
            placeholder="HTML hier einfügen oder oben auf 'Template' klicken..."
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
          />
        ) : (
          <div className="bg-white min-h-[520px]">
            <iframe
              srcDoc={srcDoc}
              className="w-full border-0 min-h-[520px]"
              sandbox="allow-scripts"
              title="HTML-Vorschau"
            />
          </div>
        )}
      </div>

      {/* Media-Modal */}
      {showMedia && (
        <MediaModal
          onInsert={handleMediaInsert}
          onClose={() => setShowMedia(false)}
        />
      )}
    </>
  );
}
