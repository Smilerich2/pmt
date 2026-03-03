"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { BookA, Search, X } from "lucide-react";
import Link from "next/link";

interface Term {
  id: string;
  term: string;
  definition: string;
}

export function GlossaryQuickAccess() {
  const [open, setOpen] = useState(false);
  const [terms, setTerms] = useState<Term[] | null>(null);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    if (terms !== null) return;
    try {
      const res = await fetch("/api/glossary");
      if (res.ok) setTerms(await res.json());
    } catch {
      /* ignore */
    }
  }, [terms]);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) {
      load();
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearch("");
      setExpandedId(null);
    }
  }

  // Click outside
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const filtered = (terms || []).filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.term.toLowerCase().includes(q) ||
      t.definition.toLowerCase().includes(q)
    );
  });

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggle}
        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
        title="Glossar-Schnellzugriff"
      >
        <BookA className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 bg-card border border-border shadow-xl rounded-xl flex flex-col z-50">
          {/* Search */}
          <div className="p-3 border-b border-border/60">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Begriff suchen…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {terms === null ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Laden…
              </p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Keine Begriffe gefunden
              </p>
            ) : (
              filtered.slice(0, 50).map((t) => {
                const isExpanded = expandedId === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setExpandedId(isExpanded ? null : t.id)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted/60 transition-colors"
                  >
                    <p className="text-sm font-semibold text-foreground">
                      {t.term}
                    </p>
                    <p className={`text-xs text-muted-foreground ${isExpanded ? "" : "line-clamp-2"}`}>
                      {t.definition}
                    </p>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-border/60">
            <Link
              href="/glossar"
              onClick={() => setOpen(false)}
              className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Alle Begriffe anzeigen →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
