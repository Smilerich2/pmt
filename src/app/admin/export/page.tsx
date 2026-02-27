import { prisma } from "@/lib/prisma";
import { Download, Database, FileText, Eye, EyeOff, ImageIcon, Info } from "lucide-react";

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

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground mb-2">Daten exportieren</h1>
      <p className="text-muted-foreground mb-8">
        Lade alle Inhalte als JSON-Datei herunter – als Backup oder zur Migration.
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

      {/* Export-Karte */}
      <div className="rounded-xl border border-border/60 bg-card mb-6">
        <div className="px-5 py-4 border-b border-border/40">
          <h2 className="font-semibold text-foreground">JSON-Export</h2>
        </div>
        <div className="p-5">
          <p className="text-sm text-foreground/80 mb-4">
            Die Datei enthält alle <strong>Kategorien</strong> und <strong>Beiträge</strong> mit
            vollem Inhalt, Metadaten und Reihenfolge.
          </p>

          <ul className="text-sm text-foreground/70 space-y-1 mb-5">
            <li className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span> Alle Kategorien mit Hierarchie
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span> Alle Beiträge mit vollständigem Inhalt
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span> Reihenfolge, Status (veröffentlicht/Entwurf)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-amber-500">~</span> Hochgeladene Bilder müssen separat gesichert werden
            </li>
          </ul>

          <a
            href="/api/export"
            download
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Download className="w-4 h-4" />
            pmt-backup-{date.replaceAll(".", "-")}.json herunterladen
          </a>
        </div>
      </div>

      {/* Uploads-Hinweis */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex gap-3">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-900">
          <strong>Uploads separat sichern:</strong> Hochgeladene Bilder liegen auf dem Server unter{" "}
          <code className="bg-amber-100 px-1 rounded text-xs">/var/www/pmt-uploads/</code>.
          Zum Sichern per SSH:
          <pre className="mt-2 bg-amber-100 rounded p-2 text-xs overflow-x-auto">
            {`scp -r root@46.224.44.62:/var/www/pmt-uploads/ ./pmt-uploads-backup/`}
          </pre>
        </div>
      </div>
    </div>
  );
}
