"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageSquare, Trash2, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";

interface FeedbackItem {
  id: string;
  type: string;
  message: string;
  page: string | null;
  createdAt: string;
}

const typeBadge: Record<string, string> = {
  feedback: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  fehler: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  wunsch: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

const typeLabel: Record<string, string> = {
  feedback: "Feedback",
  fehler: "Fehler",
  wunsch: "Wunsch",
};

export default function AdminFeedbackPage() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

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
        <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">Typ</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Nachricht</th>
                <th className="px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Seite</th>
                <th className="px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Datum</th>
                <th className="px-4 py-3 font-medium text-muted-foreground w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${typeBadge[item.type] || "bg-muted text-muted-foreground"}`}>
                      {typeLabel[item.type] || item.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground max-w-md">
                    <p className="line-clamp-3">{item.message}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs hidden sm:table-cell">
                    {item.page || "–"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap hidden md:table-cell">
                    {new Date(item.createdAt).toLocaleDateString("de-DE")}{" "}
                    {new Date(item.createdAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-4 py-3">
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
                        className="text-muted-foreground hover:text-red-500 transition-colors"
                        title="Löschen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
