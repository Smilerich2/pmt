"use client";

import { useState, useEffect } from "react";
import { buildSrcDoc } from "@/components/html-page-editor";

export function HtmlPostViewer({ content }: { content: string }) {
  const [height, setHeight] = useState(500);
  // Erst nach dem Mounten rendern – buildSrcDoc braucht window.location.origin,
  // das auf dem Server nicht verfügbar ist (würde Hydration-Mismatch erzeugen).
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data?.iframeHeight && typeof e.data.iframeHeight === "number") {
        setHeight(Math.max(200, e.data.iframeHeight + 32));
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Platzhalter während SSR und erstem Render
  if (!mounted) {
    return (
      <div
        className="w-full rounded-xl border border-border/40 bg-muted/20 animate-pulse"
        style={{ height: 500, display: "block" }}
      />
    );
  }

  return (
    <iframe
      srcDoc={buildSrcDoc(content)}
      className="w-full rounded-xl border border-border/40"
      style={{ height, display: "block" }}
      sandbox="allow-scripts"
      title="Interaktive Seite"
    />
  );
}
