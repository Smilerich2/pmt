"use client";

import { useState, useRef, useCallback } from "react";
import { Move, Check } from "lucide-react";

/**
 * Drag-to-reposition image focal point picker (like Notion cover images).
 * `position` is "x y" where x and y are 0-100 percentages.
 * Default is "50 50" (center).
 */
export function ImagePositionPicker({
  src,
  position,
  onChange,
  height = 160,
}: {
  src: string;
  position: string;
  onChange: (pos: string) => void;
  height?: number;
}) {
  const [dragging, setDragging] = useState(false);
  const [editing, setEditing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startRef = useRef({ y: 0, startPosY: 50 });

  const [x, y] = (position || "50 50").split(" ").map(Number);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!editing) return;
      e.preventDefault();
      setDragging(true);
      startRef.current = { y: e.clientY, startPosY: y };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [editing, y]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging || !containerRef.current) return;
      const containerHeight = containerRef.current.clientHeight;
      const deltaY = e.clientY - startRef.current.y;
      // Moving pointer down → image moves down → focal point (y%) decreases
      const sensitivity = 150 / containerHeight;
      const newY = Math.max(0, Math.min(100, startRef.current.startPosY - deltaY * sensitivity));
      onChange(`${x} ${Math.round(newY)}`);
    },
    [dragging, x, onChange]
  );

  const handlePointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  return (
    <div className="relative rounded-lg overflow-hidden border border-border/60 group">
      <div
        ref={containerRef}
        className={`w-full overflow-hidden ${editing ? "cursor-grab" : ""} ${dragging ? "cursor-grabbing" : ""}`}
        style={{ height }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <img
          src={src}
          alt=""
          className="w-full h-full object-cover select-none pointer-events-none"
          style={{ objectPosition: `${x}% ${y}%` }}
          draggable={false}
        />
      </div>

      {/* Reposition overlay when editing */}
      {editing && (
        <div className="absolute inset-0 bg-black/20 pointer-events-none flex items-center justify-center">
          <p className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full pointer-events-none">
            Bild ziehen zum Verschieben
          </p>
        </div>
      )}

      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setEditing(!editing)}
        className={`absolute top-2 left-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
          editing
            ? "bg-primary text-primary-foreground"
            : "bg-black/50 text-white opacity-0 group-hover:opacity-100"
        }`}
      >
        {editing ? (
          <><Check className="w-3.5 h-3.5" />Fertig</>
        ) : (
          <><Move className="w-3.5 h-3.5" />Ausschnitt</>
        )}
      </button>
    </div>
  );
}
