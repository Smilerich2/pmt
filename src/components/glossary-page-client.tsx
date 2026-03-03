"use client";

import { useState, useMemo } from "react";
import { Search, BookA } from "lucide-react";

interface Term {
  id: string;
  term: string;
  slug: string;
  definition: string;
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function GlossaryPageClient({ terms }: { terms: Term[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return terms;
    const q = search.toLowerCase();
    return terms.filter(
      (t) =>
        t.term.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q)
    );
  }, [terms, search]);

  const grouped = useMemo(() => {
    const map: Record<string, Term[]> = {};
    for (const t of filtered) {
      const letter = t.term[0]?.toUpperCase() || "#";
      if (!map[letter]) map[letter] = [];
      map[letter].push(t);
    }
    return map;
  }, [filtered]);

  const availableLetters = new Set(Object.keys(grouped));

  function scrollToLetter(letter: string) {
    const el = document.getElementById(`glossar-${letter}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div>
      {/* Search + Count */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Begriff oder Definition suchen…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {filtered.length} {filtered.length === 1 ? "Begriff" : "Begriffe"}
        </span>
      </div>

      {/* Alphabet Bar */}
      <div className="flex flex-wrap gap-1 mb-8">
        {ALPHABET.map((letter) => {
          const available = availableLetters.has(letter);
          return (
            <button
              key={letter}
              onClick={() => available && scrollToLetter(letter)}
              disabled={!available}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                available
                  ? "bg-primary/10 text-primary hover:bg-primary/20"
                  : "bg-muted/50 text-muted-foreground/40 cursor-default"
              }`}
            >
              {letter}
            </button>
          );
        })}
      </div>

      {/* Term List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <BookA className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">Keine Begriffe gefunden</p>
        </div>
      ) : (
        <div className="space-y-10">
          {ALPHABET.filter((l) => grouped[l]).map((letter) => (
            <div key={letter} id={`glossar-${letter}`} className="scroll-mt-24">
              <h3 className="text-2xl font-bold text-primary mb-4">{letter}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {grouped[letter].map((t) => (
                  <div
                    key={t.id}
                    className="bg-card border border-border/60 rounded-xl p-4"
                  >
                    <p className="font-semibold text-foreground mb-1">
                      {t.term}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t.definition}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
