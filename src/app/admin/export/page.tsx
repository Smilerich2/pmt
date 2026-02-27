import { prisma } from "@/lib/prisma";
import { Download, Database, FileText, Eye, EyeOff, PackageOpen } from "lucide-react";
import { ImportForm } from "./import-form";

export const dynamic = "force-dynamic";

export default async function ExportPage() {
  const [categoryCount, postCount, publishedCount, draftCount] = await Promise.all([
    prisma.category.count(),
    prisma.post.count(),
    prisma.post.count({ where: { published: true } }),
    prisma.post.count({ where: { published: false } }),
  ]);

  const date = new Date().toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const dateSlug = new Date().toISOString().slice(0, 10);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground mb-2">Backup & Import</h1>
      <p className="text-muted-foreground mb-8">
        Sichere alle Inhalte oder stelle sie aus einem Backup wieder her.
      </p>

      {/* Aktuelle Inhalte */}
      <div className="rounded-xl border border-border/60 bg-card mb-6">
        <div className="px-5 py-4 border-b border-border/40">
          <h2 className="font-semibold text-foreground">Aktuelle Inhalte</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Stand: {date}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border/40">
          {[
            { label: "Kategorien", value: categoryCount, icon: Database },
            { label: "Beiträge gesamt", value: postCount, icon: FileText },
            { label: "Veröffentlicht", value: publishedCount, icon: Eye },
            { label: "Entwürfe", value: draftCount, icon: EyeOff },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="px-5 py-4 text-center">
              <Icon className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Voll-Backup */}
      <div className="rounded-xl border-2 border-primary/30 bg-card mb-4">
        <div className="px-5 py-4 border-b border-border/40 flex items-center gap-2">
          <PackageOpen className="w-4 h-4 text-primary" />
          <h2 className="font-semibold text-foreground">Vollständiges Backup <span className="text-xs font-normal text-primary ml-1">Empfohlen</span></h2>
        </div>
        <div className="p-5">
          <p className="text-sm text-foreground/80 mb-4">
            Alles in einer ZIP-Datei: Datenbank <strong>und</strong> alle hochgeladenen Dateien.
          </p>
          <ul className="text-sm text-foreground/70 space-y-1 mb-5">
            <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Alle Kategorien &amp; Beiträge</li>
            <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Alle Bilder, Videos &amp; Uploads</li>
            <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Struktur &amp; Reihenfolge</li>
          </ul>
          <a
            href="/api/export/full"
            download
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Download className="w-4 h-4" />
            pmt-vollbackup-{dateSlug}.zip herunterladen
          </a>
        </div>
      </div>

      {/* Nur JSON */}
      <div className="rounded-xl border border-border/60 bg-card mb-6">
        <div className="px-5 py-4 border-b border-border/40">
          <h2 className="font-semibold text-foreground">Nur Inhalte (JSON)</h2>
        </div>
        <div className="p-5">
          <p className="text-sm text-foreground/80 mb-4">
            Nur Kategorien und Beiträge — ohne Uploads. Schneller, kleiner.
          </p>
          <ul className="text-sm text-foreground/70 space-y-1 mb-5">
            <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Alle Kategorien &amp; Beiträge</li>
            <li className="flex items-center gap-2"><span className="text-amber-500">~</span> Bilder/Videos nicht enthalten</li>
          </ul>
          <a
            href="/api/export"
            download
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border/60 bg-background text-foreground text-sm font-medium hover:bg-accent transition-colors"
          >
            <Download className="w-4 h-4" />
            pmt-backup-{dateSlug}.json herunterladen
          </a>
        </div>
      </div>

      {/* Import */}
      <ImportForm />
    </div>
  );
}
