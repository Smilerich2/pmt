"use client";

export function BackToTopButton() {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent/80 text-sm font-medium text-foreground transition-colors"
    >
      ↑ Nach oben
    </button>
  );
}
