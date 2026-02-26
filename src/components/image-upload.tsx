"use client";

import { useState, useRef, useEffect } from "react";
import {
  Upload,
  X,
  Loader2,
  FolderOpen,
  Palette,
  Image as ImageIcon,
  Check,
  Film,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type MediaFile = {
  name: string;
  url: string;
  size: number;
  type: "image" | "video";
  createdAt: string;
};

const gradients = [
  { id: "g1", label: "Sonnenuntergang", css: "linear-gradient(135deg, #f97316, #ec4899)" },
  { id: "g2", label: "Ozean", css: "linear-gradient(135deg, #06b6d4, #3b82f6)" },
  { id: "g3", label: "Wald", css: "linear-gradient(135deg, #22c55e, #14b8a6)" },
  { id: "g4", label: "Lavendel", css: "linear-gradient(135deg, #8b5cf6, #ec4899)" },
  { id: "g5", label: "Mitternacht", css: "linear-gradient(135deg, #1e293b, #475569)" },
  { id: "g6", label: "Bernstein", css: "linear-gradient(135deg, #f59e0b, #ea580c)" },
  { id: "g7", label: "Kirsche", css: "linear-gradient(135deg, #ef4444, #9333ea)" },
  { id: "g8", label: "Minze", css: "linear-gradient(135deg, #10b981, #06b6d4)" },
  { id: "g9", label: "Sandstein", css: "linear-gradient(135deg, #d4a574, #a78bfa)" },
  { id: "g10", label: "Kohle", css: "linear-gradient(135deg, #374151, #111827)" },
];

type Tab = "upload" | "media" | "gradient";

export function ImageUpload({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState<Tab>("upload");
  const fileRef = useRef<HTMLInputElement>(null);

  // Media library state
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaLoaded, setMediaLoaded] = useState(false);

  function loadMedia() {
    if (mediaLoaded) return;
    setMediaLoading(true);
    fetch("/api/media")
      .then((r) => r.json())
      .then((data: MediaFile[]) => {
        setMediaFiles(data.filter((f) => f.type === "image"));
        setMediaLoaded(true);
        setMediaLoading(false);
      });
  }

  useEffect(() => {
    if (tab === "media" && !mediaLoaded) loadMedia();
  }, [tab, mediaLoaded]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success === 1) {
        onChange(data.file.url);
      }
    } catch {
      alert("Upload fehlgeschlagen");
    } finally {
      setUploading(false);
    }
  }

  const isGradient = value.startsWith("linear-gradient");

  if (value) {
    return (
      <div className="relative rounded-lg overflow-hidden border border-border/60">
        {isGradient ? (
          <div className="w-full h-40" style={{ background: value }} />
        ) : (
          <img src={value} alt="Vorschau" className="w-full h-40 object-cover" />
        )}
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="absolute top-2 right-2"
          onClick={() => onChange("")}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  const tabs: { id: Tab; icon: typeof Upload; label: string }[] = [
    { id: "upload", icon: Upload, label: "Hochladen" },
    { id: "media", icon: FolderOpen, label: "Mediathek" },
    { id: "gradient", icon: Palette, label: "Verlauf" },
  ];

  return (
    <div className="space-y-2">
      {/* Tab bar */}
      <div className="flex gap-0.5 bg-accent/50 rounded-lg p-0.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
              tab === t.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Upload tab */}
      {tab === "upload" && (
        <>
          <div
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 h-28 rounded-lg border-2 border-dashed border-border/60 hover:border-primary/50 cursor-pointer transition-colors"
          >
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <Upload className="w-6 h-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Bild hochladen</span>
              </>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
          <Input
            placeholder="Oder Bild-URL eingeben..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </>
      )}

      {/* Media library tab */}
      {tab === "media" && (
        <div className="rounded-lg border border-border/60 overflow-hidden">
          {mediaLoading ? (
            <div className="flex items-center justify-center h-28">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : mediaFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-28 text-muted-foreground">
              <ImageIcon className="w-8 h-8 mb-1 opacity-30" />
              <p className="text-xs">Keine Bilder vorhanden</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-1 p-1 max-h-48 overflow-y-auto">
              {mediaFiles.map((file) => (
                <button
                  key={file.url}
                  type="button"
                  onClick={() => onChange(file.url)}
                  className="aspect-square rounded-md overflow-hidden border border-border/40 hover:border-primary transition-colors"
                >
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Gradient tab */}
      {tab === "gradient" && (
        <div className="grid grid-cols-5 gap-1.5">
          {gradients.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => onChange(g.css)}
              title={g.label}
              className="aspect-[4/3] rounded-lg overflow-hidden border-2 border-border/40 hover:border-primary transition-colors hover:scale-105"
              style={{ background: g.css }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
