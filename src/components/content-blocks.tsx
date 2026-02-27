"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import {
  Lightbulb,
  AlertTriangle,
  Info,
  ChevronDown,
  CheckCircle2,
  XCircle,
  BookOpen,
} from "lucide-react";

/** Renders markdown + KaTeX inside block contexts (callout, accordion). */
function BlockContent({ text }: { text: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        a: ({ href, children }) => <a href={href} className="underline underline-offset-2">{children}</a>,
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

/** Renders markdown + KaTeX inline (strips paragraph wrapper). */
function InlineContent({ text }: { text: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        p: ({ children }) => <>{children}</>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

// ─── Callout Boxes ───

const calloutConfig = {
  merke: {
    icon: BookOpen,
    label: "Merke",
    className: "border-amber-400 bg-amber-50 text-amber-950",
    iconClass: "text-amber-600",
  },
  tipp: {
    icon: Lightbulb,
    label: "Tipp",
    className: "border-emerald-400 bg-emerald-50 text-emerald-950",
    iconClass: "text-emerald-600",
  },
  warnung: {
    icon: AlertTriangle,
    label: "Warnung",
    className: "border-red-400 bg-red-50 text-red-950",
    iconClass: "text-red-600",
  },
  info: {
    icon: Info,
    label: "Info",
    className: "border-blue-400 bg-blue-50 text-blue-950",
    iconClass: "text-blue-600",
  },
};

export function Callout({
  type,
  children,
}: {
  type: keyof typeof calloutConfig;
  children: string;
}) {
  const config = calloutConfig[type] || calloutConfig.info;
  const Icon = config.icon;

  return (
    <div
      className={`my-4 rounded-xl border-l-4 p-4 ${config.className}`}
    >
      <div className="flex items-center gap-2 font-semibold mb-1 text-sm">
        <Icon className={`w-4 h-4 ${config.iconClass}`} />
        {config.label}
      </div>
      <div className="text-sm leading-relaxed">
        <BlockContent text={children} />
      </div>
    </div>
  );
}

// ─── Accordion ───

export function Accordion({
  title,
  children,
}: {
  title: string;
  children: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="my-3 rounded-xl border border-border/60 bg-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left font-medium text-foreground hover:bg-accent/50 transition-colors"
      >
        <span>{title}</span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          open ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-4 text-sm text-foreground/85 leading-relaxed border-t border-border/40 pt-3">
          <BlockContent text={children} />
        </div>
      </div>
    </div>
  );
}

// ─── Bild Block ───

type BildConfig = {
  src: string;
  alt?: string;
  caption?: string;
  size?: "small" | "medium" | "large" | "full";
  position?: "left" | "center" | "right";
  ratio?: "original" | "16:9" | "4:3" | "3:2" | "1:1";
  rounded?: boolean;
  shadow?: boolean;
  border?: boolean;
};

const sizeMap = {
  small: "max-w-[33%]",
  medium: "max-w-[50%]",
  large: "max-w-[75%]",
  full: "max-w-full",
};

const positionMap = {
  left: "mr-auto",
  center: "mx-auto",
  right: "ml-auto",
};

const ratioMap: Record<string, string> = {
  "16:9": "aspect-video",
  "4:3": "aspect-[4/3]",
  "3:2": "aspect-[3/2]",
  "1:1": "aspect-square",
};

export function BildBlock({ config }: { config: BildConfig }) {
  const size = sizeMap[config.size || "full"];
  const position = positionMap[config.position || "center"];
  const ratio = config.ratio && config.ratio !== "original" ? ratioMap[config.ratio] : "";

  const imgClasses = [
    "w-full",
    ratio ? "object-cover" : "",
    ratio || "",
    config.rounded !== false ? "rounded-xl" : "",
    config.shadow ? "shadow-md" : "",
    config.border ? "border border-border/60" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <figure className={`my-6 ${size} ${position}`}>
      <img
        src={config.src}
        alt={config.alt || ""}
        className={imgClasses}
      />
      {config.caption && (
        <figcaption className="mt-2 text-center text-sm text-muted-foreground italic">
          {config.caption}
        </figcaption>
      )}
    </figure>
  );
}

// ─── HTML Demo Block ───

function buildHtmlDemoSrcdoc(html: string, css: string, js: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; padding: 16px; font-family: system-ui, -apple-system, sans-serif; font-size: 14px; line-height: 1.5; }
    button { cursor: pointer; }
    ${css}
  </style>
</head>
<body>
  ${html}
  ${js ? `<script>\n${js}\n</script>` : ""}
</body>
</html>`;
}

export function HtmlDemoBlock({
  html,
  css,
  js,
  height,
  title,
}: {
  html: string;
  css: string;
  js: string;
  height?: number;
  title?: string;
}) {
  const srcdoc = buildHtmlDemoSrcdoc(html, css, js);
  return (
    <figure className="my-6">
      {title && (
        <div className="flex items-center gap-2 mb-2 px-1">
          <div className="w-2 h-2 rounded-full bg-sky-400" />
          <figcaption className="text-sm font-medium text-foreground/80">{title}</figcaption>
        </div>
      )}
      <div className="overflow-hidden border border-border/60 rounded-xl shadow-sm bg-white">
        <iframe
          srcDoc={srcdoc}
          height={height ?? 400}
          width="100%"
          sandbox="allow-scripts"
          title={title ?? "HTML Demo"}
          className="block"
        />
      </div>
    </figure>
  );
}

// ─── Demo Block ───

export function DemoBlock({
  name,
  height,
  title,
}: {
  name: string;
  height?: number;
  title?: string;
}) {
  return (
    <figure className="my-6">
      {title && (
        <div className="flex items-center gap-2 mb-2 px-1">
          <div className="w-2 h-2 rounded-full bg-primary/60" />
          <figcaption className="text-sm font-medium text-foreground/80">{title}</figcaption>
        </div>
      )}
      <div className="overflow-hidden border border-border/60 rounded-xl shadow-sm">
        <iframe
          src={`/demo/${name}`}
          height={height ?? 500}
          width="100%"
          loading="lazy"
          title={title ?? name}
          className="block"
        />
      </div>
    </figure>
  );
}

// ─── Quiz ───

type QuizOption = {
  text: string;
  correct: boolean;
};

export function Quiz({
  question,
  options,
  explanation,
}: {
  question: string;
  options: QuizOption[];
  explanation?: string;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  function handleSelect(index: number) {
    if (revealed) return;
    setSelected(index);
  }

  function handleCheck() {
    if (selected === null) return;
    setRevealed(true);
  }

  function handleReset() {
    setSelected(null);
    setRevealed(false);
  }

  return (
    <div className="my-4 rounded-xl border border-border/60 bg-card p-5">
      <div className="font-semibold text-foreground mb-3">
        <InlineContent text={question} />
      </div>

      <div className="space-y-2 mb-4">
        {options.map((option, i) => {
          let style =
            "border border-border/60 bg-background hover:border-primary/40";

          if (selected === i && !revealed) {
            style = "border-2 border-primary bg-primary/5";
          }
          if (revealed && option.correct) {
            style = "border-2 border-emerald-500 bg-emerald-50";
          }
          if (revealed && selected === i && !option.correct) {
            style = "border-2 border-red-500 bg-red-50";
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-left transition-all ${style} ${
                revealed ? "cursor-default" : "cursor-pointer"
              }`}
            >
              <span className="w-6 h-6 rounded-full border border-current/20 flex items-center justify-center text-xs font-medium shrink-0">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1"><InlineContent text={option.text} /></span>
              {revealed && option.correct && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              {revealed && selected === i && !option.correct && (
                <XCircle className="w-4 h-4 text-red-500 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {!revealed ? (
        <button
          onClick={handleCheck}
          disabled={selected === null}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 hover:bg-primary/90 transition-colors"
        >
          Antwort prüfen
        </button>
      ) : (
        <div>
          {explanation && (
            <div className="mt-3 p-3 rounded-lg bg-accent/50 text-sm text-foreground/85 leading-relaxed">
              <strong>Erklärung:</strong> <InlineContent text={explanation} />
            </div>
          )}
          <button
            onClick={handleReset}
            className="mt-3 px-4 py-2 rounded-lg bg-accent text-foreground text-sm font-medium hover:bg-accent/80 transition-colors"
          >
            Nochmal versuchen
          </button>
        </div>
      )}
    </div>
  );
}
