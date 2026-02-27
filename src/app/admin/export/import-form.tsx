"use client";

import { useState, useRef } from "react";
import { Upload, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

type BackupMeta = {
  exportedAt: string;
  stats: { categories: number; posts: number; published: number; drafts: number };
};

type Status = "idle" | "preview" | "loading" | "success" | "error";

export function ImportForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [meta, setMeta] = useState<BackupMeta | null>(null);
  const [fileData, setFileData] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed.categories || !parsed.posts) {
          setStatus("error");
          setMessage("Ungültige Backup-Datei – fehlende Felder.");
          return;
        }
        setMeta({ exportedAt: parsed.exportedAt, stats: parsed.stats });
        setFileData(text);
        setStatus("preview");
      } catch {
        setStatus("error");
        setMessage("Datei konnte nicht gelesen werden.");
      }
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    if (!fileData) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: fileData,
      });
      const result = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(result.error ?? "Import fehlgeschlagen.");
        return;
      }
      setStatus("success");
      setMessage(
        `${result.imported.categories} Kategorien und ${result.imported.posts} Beiträge wurden wiederhergestellt.`
      );
    } catch {
      setStatus("error");
      setMessage("Netzwerkfehler beim Import.");
    }
  }

  function reset() {
    setStatus("idle");
    setMeta(null);
    setFileData(null);
    setMessage("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card">
      <div className="px-5 py-4 border-b border-border/40">
        <h2 className="font-semibold text-foreground">JSON importieren</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Stellt alle Kategorien und Beiträge aus einer Backup-Datei wieder her.
        </p>
      </div>
      <div className="p-5">
        {status === "idle" && (
          <>
            <p className="text-sm text-foreground/80 mb-4">
              Wähle eine <code className="bg-accent px-1 rounded text-xs">pmt-backup-*.json</code>-Datei aus.
              Alle bestehenden Inhalte werden dabei ersetzt.
            </p>
            <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-dashed border-border/60 text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              Backup-Datei auswählen
              <input
                ref={inputRef}
                type="file"
                accept=".json"
                onChange={handleFile}
                className="hidden"
              />
            </label>
          </>
        )}

        {status === "preview" && meta && (
          <div className="space-y-4">
            {/* Preview */}
            <div className="rounded-lg bg-accent/50 border border-border/40 p-4 text-sm space-y-1">
              <p className="font-medium text-foreground">Backup-Vorschau</p>
              <p className="text-muted-foreground">
                Erstellt am:{" "}
                {new Date(meta.exportedAt).toLocaleString("de-DE")}
              </p>
              <p className="text-muted-foreground">
                Enthält: <strong>{meta.stats?.categories ?? "?"}</strong> Kategorien,{" "}
                <strong>{meta.stats?.posts ?? "?"}</strong> Beiträge
              </p>
            </div>

            {/* Warning */}
            <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">
                <strong>Alle bestehenden Inhalte werden gelöscht</strong> und durch
                die Backup-Daten ersetzt. Dieser Vorgang kann nicht rückgängig gemacht werden.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleImport}
                className="px-5 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Jetzt wiederherstellen
              </button>
              <button
                onClick={reset}
                className="px-4 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}

        {status === "loading" && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground py-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Importiere Daten …
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <div className="flex gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-800">
                <strong>Import erfolgreich.</strong> {message}
              </p>
            </div>
            <button
              onClick={() => window.location.href = "/admin"}
              className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Zum Dashboard
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">
                <strong>Fehler:</strong> {message}
              </p>
            </div>
            <button
              onClick={reset}
              className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Erneut versuchen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
