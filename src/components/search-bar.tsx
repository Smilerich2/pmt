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

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (query.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/posts/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setResults(data);
        setOpen(true);
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
    <div ref={ref} className="relative w-full max-w-xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Beiträge suchen..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-10 py-3 rounded-xl border border-border/60 bg-background/80 backdrop-blur-sm text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults([]); setOpen(false); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute top-full mt-2 w-full bg-card border border-border/60 rounded-xl shadow-xl z-50 overflow-hidden">
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
                      onClick={() => { setOpen(false); setQuery(""); }}
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
    </div>
  );
}
