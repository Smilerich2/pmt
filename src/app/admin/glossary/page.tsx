"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, BookA, Loader2, X } from "lucide-react";

type GlossaryTerm = {
  id: string;
  term: string;
  slug: string;
  definition: string;
  createdAt: string;
  updatedAt: string;
};

export default function GlossaryPage() {
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTerm, setEditingTerm] = useState<GlossaryTerm | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({ term: "", definition: "" });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function loadTerms() {
    const res = await fetch("/api/glossary");
    const data = await res.json();
    setTerms(data);
    setLoading(false);
  }

  useEffect(() => {
    loadTerms();
  }, []);

  function openCreate() {
    setEditingTerm(null);
    setForm({ term: "", definition: "" });
    setShowDialog(true);
  }

  function openEdit(t: GlossaryTerm) {
    setEditingTerm(t);
    setForm({ term: t.term, definition: t.definition });
    setShowDialog(true);
  }

  async function handleSave() {
    if (!form.term.trim() || !form.definition.trim()) return;
    setSaving(true);

    if (editingTerm) {
      await fetch(`/api/glossary/${editingTerm.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/glossary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }

    setSaving(false);
    setShowDialog(false);
    loadTerms();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/glossary/${id}`, { method: "DELETE" });
    setDeleteId(null);
    loadTerms();
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Glossar</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {terms.length} {terms.length === 1 ? "Begriff" : "Begriffe"} verwalten
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Neuer Begriff
        </button>
      </div>

      {/* Table */}
      {terms.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <BookA className="w-12 h-12 mb-3 opacity-40" />
          <p className="text-sm">Noch keine Glossar-Begriffe angelegt.</p>
          <button
            onClick={openCreate}
            className="mt-3 text-sm text-primary hover:underline"
          >
            Ersten Begriff anlegen
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-border/60 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-accent/50 border-b border-border/40">
                <th className="text-left px-4 py-3 font-medium text-foreground">Begriff</th>
                <th className="text-left px-4 py-3 font-medium text-foreground">Definition</th>
                <th className="text-right px-4 py-3 font-medium text-foreground w-24">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {terms.map((t) => (
                <tr key={t.id} className="border-b border-border/30 hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                    {t.term}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <span className="line-clamp-2">{t.definition}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(t)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        title="Bearbeiten"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(t.id)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Löschen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowDialog(false)}>
          <div
            className="bg-card border border-border/60 rounded-xl shadow-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">
                {editingTerm ? "Begriff bearbeiten" : "Neuer Glossar-Begriff"}
              </h3>
              <button onClick={() => setShowDialog(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground">Begriff</label>
                <input
                  value={form.term}
                  onChange={(e) => setForm({ ...form, term: e.target.value })}
                  placeholder="z. B. Wellpappe"
                  className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Definition</label>
                <textarea
                  value={form.definition}
                  onChange={(e) => setForm({ ...form, definition: e.target.value })}
                  placeholder="Beschreibung des Begriffs..."
                  rows={4}
                  className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setShowDialog(false)}
                className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.term.trim() || !form.definition.trim()}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : editingTerm ? (
                  "Speichern"
                ) : (
                  "Anlegen"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDeleteId(null)}>
          <div
            className="bg-card border border-border/60 rounded-xl shadow-xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-foreground mb-2">Begriff löschen?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Der Begriff wird unwiderruflich gelöscht. Bestehende <code className="bg-accent px-1 rounded text-xs">::glossar[...]</code> Verweise im Content zeigen dann keinen Tooltip mehr.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
