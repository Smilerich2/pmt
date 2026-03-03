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
// Farben und Stil stimmen exakt mit der PMT-Lernplattform überein.
// User-eigene <style>-Tags überschreiben diese Regeln.
export const BASE_CSS = `
:root {
  --primary:        #ea580c;
  --primary-hover:  #c2410c;
  --primary-light:  #fff7ed;
  --primary-border: #fed7aa;
  --bg:             #fafaf8;
  --surface:        #ffffff;
  --text:           #1e1b2e;
  --text-muted:     #6b7280;
  --border:         #e8e4df;
  --accent-bg:      #f5f0ea;
  --success:        #16a34a;
  --success-light:  #f0fdf4;
  --warning:        #d97706;
  --warning-light:  #fffbeb;
  --danger:         #dc2626;
  --danger-light:   #fef2f2;
  --info:           #2563eb;
  --info-light:     #eff6ff;
  --radius:         0.75rem;
  --radius-sm:      0.5rem;
  --shadow:         0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.04);
  --shadow-md:      0 4px 12px rgba(0,0,0,.10), 0 2px 4px rgba(0,0,0,.06);
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{
  font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  font-size:16px;line-height:1.6;color:var(--text);background:var(--bg);padding:1.5rem
}
@media(max-width:640px){body{padding:1rem;font-size:15px}}
h1,h2,h3,h4,h5,h6{line-height:1.3;font-weight:700;color:var(--text);margin-bottom:.5em;margin-top:1.5em}
h1:first-child,h2:first-child,h3:first-child,h4:first-child{margin-top:0}
h1{font-size:2rem}h2{font-size:1.5rem}h3{font-size:1.25rem}h4{font-size:1.1rem}
p{margin-bottom:1em}
ul,ol{margin-bottom:1em;padding-left:1.5em}li{margin-bottom:.25em}
table{width:100%;border-collapse:collapse;margin-bottom:1em;border-radius:var(--radius-sm);overflow:hidden}
th,td{border:1px solid var(--border);padding:.6em .85em;text-align:left}
th{background:var(--accent-bg);font-weight:600;color:var(--text)}
img{max-width:100%;height:auto;border-radius:var(--radius-sm)}
a{color:var(--primary);text-decoration:underline;text-underline-offset:2px}
a:hover{color:var(--primary-hover)}
code{font-family:monospace;background:var(--accent-bg);padding:.1em .4em;border-radius:.25rem;font-size:.875em}
pre{background:#1e1b2e;color:#e2e8f0;padding:1em;border-radius:var(--radius-sm);overflow-x:auto;margin-bottom:1em}
pre code{background:none;padding:0;color:inherit}
button{cursor:pointer;font-family:inherit;border-radius:var(--radius-sm);padding:.5em 1.25em;border:none;background:var(--primary);color:#fff;font-size:.875rem;font-weight:600;transition:background .15s;display:inline-flex;align-items:center;gap:.4em}
button:hover{background:var(--primary-hover)}
button.secondary{background:var(--surface);color:var(--text);border:1px solid var(--border)}
button.secondary:hover{background:var(--accent-bg)}
button.ghost{background:transparent;color:var(--primary);border:1px solid var(--primary-border)}
button.ghost:hover{background:var(--primary-light)}
input,select,textarea{font-family:inherit;font-size:1rem;border:1px solid var(--border);border-radius:var(--radius-sm);padding:.5em .75em;width:100%;box-sizing:border-box;background:var(--surface);color:var(--text);margin-bottom:.5em;transition:border-color .15s}
input:focus,select:focus,textarea:focus{outline:none;border-color:var(--primary)}
label{font-weight:500;font-size:.875rem;color:var(--text);margin-bottom:.25em;display:block}
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

// ─── KI-Prompt generieren (Design-System + Base-CSS + User-Style + Snippets) ───
function generateHtmlAIPrompt(userStyle: string): string {
  return `Du erstellst HTML-Lernseiten für die PMT Lernplattform – eine Ausbildungsplattform für Packmitteltechnologen.

# AUSGABEFORMAT

Gib AUSSCHLIESSLICH vollständiges, valides HTML zurück. Kein Markdown, keine Erklärungen, kein Code-Fence-Wrapper (keine \`\`\`html). Der Code wird 1:1 in den Editor eingefügt.
Nutze immer die vollständige Dokumentstruktur: <!DOCTYPE html> ... </html>

# VISUELLES LEITBILD

Die Platform hat einen **warmen, klaren, professionellen** Stil:
- Hintergrund: Off-White (#fafaf8) – kein reines Weiß, kein Grau
- Akzentfarbe: **Orange (#ea580c)** – für Buttons, Highlights, interaktive Elemente
- Typografie: System-UI, sauber, gut lesbar
- Ecken: abgerundet (border-radius 0.5–0.75rem)
- Schatten: dezent (keine harten Drop-Shadows)
- Keine bunten Verläufe, keine grellen Farben – ruhig und fokussiert

# CSS-VARIABLEN (bereits geladen – direkt verwenden)

\`\`\`
--primary        #ea580c  → Buttons, Links, aktive Elemente, Überschrift-Akzente
--primary-hover  #c2410c  → Hover-Zustand für Orange-Elemente
--primary-light  #fff7ed  → Heller Orange-Hintergrund für Highlights
--primary-border #fed7aa  → Rahmen für orange Boxen
--bg             #fafaf8  → Seitenhintergrund
--surface        #ffffff  → Karten, Panels, Inputs
--text           #1e1b2e  → Haupttext
--text-muted     #6b7280  → Sekundärtext, Labels, Beschreibungen
--border         #e8e4df  → Rahmenfarbe
--accent-bg      #f5f0ea  → Warmer Hintergrund für Tabellen-Header, neutrale Boxen
--success        #16a34a  → Richtig / Bestätigung
--success-light  #f0fdf4  → Hintergrund für Erfolgs-Boxen
--warning        #d97706  → Achtung / Hinweis
--warning-light  #fffbeb  → Hintergrund für Warnungs-Boxen
--danger         #dc2626  → Fehler / Falsch
--danger-light   #fef2f2  → Hintergrund für Fehler-Boxen
--info           #2563eb  → Information
--info-light     #eff6ff  → Hintergrund für Info-Boxen
--radius         0.75rem  → Standard border-radius
--radius-sm      0.5rem   → Kleinere Elemente
--shadow         subtle box-shadow für Cards
--shadow-md      mittlerer box-shadow für Modals/Popups
\`\`\`

# FERTIGE KOMPONENTEN-SNIPPETS

Nutze diese Vorlagen direkt – sie passen exakt zum Platform-Design:

## Karte
\`\`\`html
<div class="card">
  <h3>Titel</h3>
  <p>Inhalt...</p>
</div>
\`\`\`
\`\`\`css
.card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.25rem; box-shadow: var(--shadow); }
\`\`\`

## Farbige Info-Boxen (Merke / Tipp / Warnung / Info)
\`\`\`html
<div class="box box-orange">📌 Merke: Wichtiger Hinweis hier.</div>
<div class="box box-green">✅ Richtig: Erklärung hier.</div>
<div class="box box-yellow">⚠️ Achtung: Warnung hier.</div>
<div class="box box-blue">ℹ️ Info: Zusatzwissen hier.</div>
\`\`\`
\`\`\`css
.box { padding: .875rem 1.125rem; border-radius: var(--radius-sm); border-left: 4px solid; margin-bottom: 1rem; font-size: .9375rem; }
.box-orange { background: var(--primary-light); border-color: var(--primary); color: #7c2d12; }
.box-green  { background: var(--success-light); border-color: var(--success); color: #14532d; }
.box-yellow { background: var(--warning-light); border-color: var(--warning); color: #78350f; }
.box-blue   { background: var(--info-light);    border-color: var(--info);    color: #1e3a8a; }
\`\`\`

## Badge / Tag
\`\`\`html
<span class="badge">Text</span>
<span class="badge badge-orange">Neu</span>
\`\`\`
\`\`\`css
.badge { display:inline-block; padding:.2em .65em; border-radius:999px; font-size:.75rem; font-weight:600; background:var(--accent-bg); color:var(--text-muted); }
.badge-orange { background:var(--primary-light); color:var(--primary); }
\`\`\`

## Aufklappbare Sektion (Accordion)
\`\`\`html
<details class="accordion">
  <summary>Frage oder Titel</summary>
  <div class="accordion-body">Inhalt hier...</div>
</details>
\`\`\`
\`\`\`css
.accordion { border:1px solid var(--border); border-radius:var(--radius-sm); margin-bottom:.5rem; overflow:hidden; }
.accordion summary { padding:.875rem 1rem; cursor:pointer; font-weight:600; background:var(--surface); list-style:none; display:flex; justify-content:space-between; align-items:center; }
.accordion summary::-webkit-details-marker { display:none; }
.accordion summary::after { content:"＋"; color:var(--primary); font-size:1.1rem; }
.accordion[open] summary::after { content:"－"; }
.accordion-body { padding:1rem; background:var(--bg); border-top:1px solid var(--border); }
\`\`\`

## Tabs
\`\`\`html
<div class="tabs">
  <button class="tab active" onclick="showTab(this,'t1')">Tab 1</button>
  <button class="tab" onclick="showTab(this,'t2')">Tab 2</button>
</div>
<div id="t1" class="tab-panel">Inhalt Tab 1</div>
<div id="t2" class="tab-panel" hidden>Inhalt Tab 2</div>
\`\`\`
\`\`\`css
.tabs { display:flex; gap:.25rem; border-bottom:2px solid var(--border); margin-bottom:1rem; }
.tab { background:none; color:var(--text-muted); border:none; border-bottom:2px solid transparent; border-radius:0; padding:.5rem 1rem; font-size:.9rem; margin-bottom:-2px; }
.tab.active { color:var(--primary); border-bottom-color:var(--primary); font-weight:600; }
.tab:hover { background:var(--accent-bg); color:var(--text); }
\`\`\`
\`\`\`js
function showTab(btn, id) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.hidden = true);
  btn.classList.add('active');
  document.getElementById(id).hidden = false;
}
\`\`\`

## Fortschrittsbalken
\`\`\`html
<div class="progress"><div class="progress-bar" style="width:70%"></div></div>
\`\`\`
\`\`\`css
.progress { background:var(--accent-bg); border-radius:999px; height:.75rem; overflow:hidden; }
.progress-bar { height:100%; background:var(--primary); border-radius:999px; transition:width .4s ease; }
\`\`\`

## Quiz-Frage (Multiple Choice)
\`\`\`html
<div class="quiz">
  <p class="quiz-q">Frage hier?</p>
  <button class="quiz-opt" onclick="answer(this,false)">Falsche Antwort</button>
  <button class="quiz-opt" onclick="answer(this,true)">Richtige Antwort</button>
  <div class="quiz-feedback" hidden></div>
</div>
\`\`\`
\`\`\`css
.quiz { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:1.25rem; }
.quiz-q { font-weight:600; margin-bottom:1rem; }
.quiz-opt { display:block; width:100%; text-align:left; margin-bottom:.5rem; background:var(--bg); color:var(--text); border:1px solid var(--border); border-radius:var(--radius-sm); padding:.6rem 1rem; font-size:.9375rem; }
.quiz-opt:hover { border-color:var(--primary); background:var(--primary-light); }
.quiz-opt.correct { background:var(--success-light); border-color:var(--success); color:#14532d; }
.quiz-opt.wrong { background:var(--danger-light); border-color:var(--danger); color:#7f1d1d; }
.quiz-feedback { margin-top:.75rem; padding:.75rem 1rem; border-radius:var(--radius-sm); font-size:.9rem; }
\`\`\`
\`\`\`js
function answer(btn, correct) {
  const quiz = btn.closest('.quiz');
  quiz.querySelectorAll('.quiz-opt').forEach(b => b.disabled = true);
  btn.classList.add(correct ? 'correct' : 'wrong');
  const fb = quiz.querySelector('.quiz-feedback');
  fb.hidden = false;
  fb.style.cssText = correct
    ? 'background:var(--success-light);color:#14532d;border-left:4px solid var(--success)'
    : 'background:var(--danger-light);color:#7f1d1d;border-left:4px solid var(--danger)';
  fb.textContent = correct ? '✅ Richtig!' : '❌ Leider falsch. Versuche es nochmal.';
}
\`\`\`
${
  userStyle
    ? `
# AKTUELLER STIL DIESES BEITRAGS

Passe neue Inhalte an diesen bestehenden Stil an und ergänze ihn konsistent:

\`\`\`css
${userStyle}
\`\`\`
`
    : ""
}
# ICONS – KEINE EMOJIS

Verwende **niemals Emojis** (❌ kein ✅ 📌 ⚠️ ℹ️ usw.).
Nutze stattdessen **inline SVG-Icons aus der Lucide-Bibliothek** – kein externes Framework nötig.

## Icon-Hilfsstil (einmal im <style>-Tag definieren)
\`\`\`css
.icon { display:inline-block; vertical-align:middle; flex-shrink:0; }
\`\`\`

## Verwendung
\`\`\`html
<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18"
  viewBox="0 0 24 24" fill="none" stroke="currentColor"
  stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <!-- Pfad hier -->
</svg>
\`\`\`

## Lucide Icon-Bibliothek (direkt verwenden)

| Icon | Pfad(e) |
|---|---|
| check-circle | \`<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>\` |
| x-circle | \`<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>\` |
| alert-triangle | \`<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>\` |
| info | \`<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>\` |
| lightbulb | \`<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>\` |
| book-open | \`<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>\` |
| chevron-down | \`<path d="m6 9 6 6 6-6"/>\` |
| chevron-right | \`<path d="m9 18 6-6-6-6"/>\` |
| chevron-up | \`<path d="m18 15-6-6-6 6"/>\` |
| arrow-right | \`<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>\` |
| check | \`<path d="M20 6 9 17l-5-5"/>\` |
| x | \`<path d="M18 6 6 18"/><path d="m6 6 12 12"/>\` |
| plus | \`<path d="M5 12h14"/><path d="M12 5v14"/>\` |
| minus | \`<path d="M5 12h14"/>\` |
| star | \`<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>\` |
| clock | \`<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>\` |
| target | \`<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>\` |
| zap | \`<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>\` |
| graduation-cap | \`<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>\` |
| layers | \`<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0l8.57-3.908a1 1 0 0 0 0-1.832z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>\` |
| package | \`<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7"/><path d="m7.5 4.27 9 5.15"/>\` |

## Beispiel Info-Box mit SVG statt Emoji
\`\`\`html
<div class="box box-blue">
  <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18"
    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
  </svg>
  Information hier.
</div>
\`\`\`
\`\`\`css
.box { display:flex; align-items:flex-start; gap:.625rem; padding:.875rem 1.125rem;
  border-radius:var(--radius-sm); border-left:4px solid; margin-bottom:1rem; }
.box .icon { margin-top:.15rem; }
\`\`\`

# MEDIEN EINBINDEN

\`\`\`html
<img src="/uploads/dateiname.jpg" alt="Beschreibung">
<video src="/uploads/dateiname.mp4" controls style="max-width:100%;border-radius:var(--radius-sm)"></video>
\`\`\`
Konkrete Dateinamen vom Nutzer erfragen oder Platzhalter lassen.

# TECHNISCHE VORGABEN

- Base-CSS ist bereits geladen → NUR überschreiben was wirklich nötig ist
- Responsiv: funktioniert auf Handy (320 px), Tablet (768 px), Desktop (1280 px)
- Kein externes Framework (kein Bootstrap, kein Tailwind CDN) – nur vanilla CSS/JS
- Animationen und Interaktivität erwünscht – aber sparsam und zweckgebunden
- Alle CSS-Klassen in einem einzigen <style>-Tag im <head>
- JavaScript in einem einzigen <script>-Tag am Ende von <body>
- Keine Emojis – immer inline SVG aus der obigen Icon-Bibliothek

# INHALTS-VORGABEN

- Zielgruppe: Berufsschüler, 16–20 Jahre, Ausbildung Packmitteltechnologe
- Sprache: klar, aktiv, direkte Ansprache ("Du"), kurze Sätze
- Fachbegriffe beim ersten Auftreten in Klammern erklären
- Praxisbeispiele aus dem Berufsalltag einbauen
- Interaktive Elemente (Quiz, Tabs, Akkordeon) bevorzugen gegenüber reinem Text`;
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
