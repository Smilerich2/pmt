"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageSquare, Trash2, ToggleLeft, ToggleRight, Loader2, BookOpen, Check } from "lucide-react";

interface FeedbackItem {
  id: string;
  type: string;
  name: string;
  email: string;
  message: string;
  page: string | null;
  createdAt: string;
}

const typeBadge: Record<string, string> = {
  feedback: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  fehler: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  wunsch: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  glossar: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

const typeLabel: Record<string, string> = {
  feedback: "Feedback",
  fehler: "Fehler",
  wunsch: "Wunsch",
  glossar: "Glossar",
};

export default function AdminFeedbackPage() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [glossarFormId, setGlossarFormId] = useState<string | null>(null);
  const [glossarTerm, setGlossarTerm] = useState("");
  const [glossarDef, setGlossarDef] = useState("");
  const [glossarSaving, setGlossarSaving] = useState(false);
  const [glossarAdopted, setGlossarAdopted] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    try {
      const [feedbackRes, settingsRes] = await Promise.all([
        fetch("/api/feedback"),
        fetch("/api/settings"),
      ]);
      if (feedbackRes.ok) setItems(await feedbackRes.json());
      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        setEnabled(settings.feedback_enabled !== "false");
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggleEnabled() {
    setToggling(true);
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "feedback_enabled", value: enabled ? "false" : "true" }),
      });
      setEnabled(!enabled);
    } catch {
      // ignore
    } finally {
      setToggling(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/feedback/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
      }
    } catch {
      // ignore
    }
    setDeleteId(null);
  }

  function openGlossarForm(item: FeedbackItem) {
    setGlossarFormId(item.id);
    // Try to split message into term: definition
    const parts = item.message.split(/[:\-–]\s*/);
    if (parts.length >= 2) {
      setGlossarTerm(parts[0].trim());
      setGlossarDef(parts.slice(1).join(" – ").trim());
    } else {
      setGlossarTerm("");
      setGlossarDef(item.message);
    }
  }

  async function handleGlossarAdopt() {
    if (!glossarTerm.trim() || !glossarDef.trim() || !glossarFormId) return;
    setGlossarSaving(true);
    try {
      const res = await fetch("/api/glossary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ term: glossarTerm.trim(), definition: glossarDef.trim() }),
      });
      if (res.ok) {
        setGlossarAdopted((prev) => new Set(prev).add(glossarFormId));
        setGlossarFormId(null);
      }
    } catch {
      // ignore
    } finally {
      setGlossarSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Feedback</h1>
        <button
          onClick={toggleEnabled}
          disabled={toggling}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            enabled
              ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          {enabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
          {toggling ? "..." : enabled ? "Feedback aktiv" : "Feedback deaktiviert"}
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">Noch kein Feedback</p>
          <p className="text-sm mt-1">Feedback von Nutzern erscheint hier.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="bg-card border border-border/60 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Header row: badge, name, email, date */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${typeBadge[item.type] || "bg-muted text-muted-foreground"}`}>
                      {typeLabel[item.type] || item.type}
                    </span>
                    <span className="text-sm font-medium text-foreground">{item.name}</span>
                    <span className="text-xs text-muted-foreground">{item.email}</span>
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {new Date(item.createdAt).toLocaleDateString("de-DE")}{" "}
                      {new Date(item.createdAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {item.page && (
                      <span className="text-xs text-muted-foreground font-mono hidden md:inline">{item.page}</span>
                    )}
                    {glossarAdopted.has(item.id) && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <Check className="w-3 h-3" /> Übernommen
                      </span>
                    )}
                  </div>

                  {/* Full message text */}
                  <p className="text-sm text-foreground whitespace-pre-wrap break-words">{item.message}</p>

                  {/* Glossar adopt inline form */}
                  {glossarFormId === item.id && (
                    <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-lg space-y-2">
                      <input
                        type="text"
                        value={glossarTerm}
                        onChange={(e) => setGlossarTerm(e.target.value)}
                        placeholder="Begriff"
                        className="w-full rounded-lg border border-border/60 bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                      />
                      <textarea
                        value={glossarDef}
                        onChange={(e) => setGlossarDef(e.target.value)}
                        placeholder="Definition"
                        rows={3}
                        className="w-full rounded-lg border border-border/60 bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleGlossarAdopt}
                          disabled={glossarSaving || !glossarTerm.trim() || !glossarDef.trim()}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          {glossarSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                          Übernehmen
                        </button>
                        <button
                          onClick={() => setGlossarFormId(null)}
                          className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-medium hover:bg-muted/80 transition-colors"
                        >
                          Abbrechen
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  {item.type === "glossar" && !glossarAdopted.has(item.id) && glossarFormId !== item.id && (
                    <button
                      onClick={() => openGlossarForm(item)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 transition-colors"
                      title="Als Glossareintrag übernehmen"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Übernehmen
                    </button>
                  )}
                  {deleteId === item.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 font-medium"
                      >
                        Ja
                      </button>
                      <button
                        onClick={() => setDeleteId(null)}
                        className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground hover:bg-muted/80 font-medium"
                      >
                        Nein
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteId(item.id)}
                      className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                      title="Löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
