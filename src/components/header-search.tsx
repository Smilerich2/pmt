"use client";

import { useState, useEffect, useRef } from "react";
import { Search, FileText, Video, Globe, X } from "lucide-react";
import Link from "next/link";
import { stripAccent } from "@/lib/utils";

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  type: string;
  description: string | null;
  category: { title: string; slug: string };
}

const typeIcons: Record<string, typeof FileText> = {
  text: FileText,
  video: Video,
  webpage: Globe,
};

export function HeaderSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/posts/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        title="Suche (⌘K)"
      >
        <Search className="w-4 h-4" />
        <span className="hidden md:inline text-sm">Suche</span>
        <kbd className="hidden md:inline-flex items-center gap-0.5 text-[10px] text-muted-foreground/60 bg-accent px-1.5 py-0.5 rounded font-mono">
          ⌘K
        </kbd>
      </button>

      {isOpen && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === overlayRef.current) setIsOpen(false);
          }}
        >
          <div className="w-full max-w-lg mx-4 bg-card border border-border/60 rounded-xl shadow-2xl overflow-hidden">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Beiträge suchen..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-4 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none border-b border-border/40"
              />
              {query && (
                <button
                  onClick={() => { setQuery(""); setResults([]); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {query.trim().length >= 2 && (
              <div className="max-h-80 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-sm text-muted-foreground text-center">Suche...</div>
                ) : results.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground text-center">Keine Ergebnisse</div>
                ) : (
                  <ul className="divide-y divide-border/40">
                    {results.map((r) => {
                      const Icon = typeIcons[r.type] || FileText;
                      return (
                        <li key={r.id}>
                          <Link
                            href={`/post/${r.slug}`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-start gap-3 px-4 py-3 hover:bg-accent/50 transition-colors"
                          >
                            <Icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{stripAccent(r.title)}</p>
                              <p className="text-xs text-muted-foreground truncate">{r.category.title}</p>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}

            {query.trim().length < 2 && (
              <div className="p-4 text-xs text-muted-foreground text-center">
                Mindestens 2 Zeichen eingeben
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
