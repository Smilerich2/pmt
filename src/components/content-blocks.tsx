"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
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

/** Renders markdown + KaTeX inside block contexts (callout, accordion). Supports raw HTML (video, iframe, audio). */
function BlockContent({ text }: { text: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeRaw, rehypeKatex]}
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

// ─── Glossar Tooltip ───

export function GlossarTooltip({
  term,
  definition,
}: {
  term: string;
  definition: string;
}) {
  const [show, setShow] = useState(false);
  const id = `glossar-${term.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={() => setShow((s) => !s)}
    >
      <span
        className="border-b-2 border-dotted border-primary/60 cursor-help text-foreground"
        aria-describedby={id}
      >
        {term}
      </span>
      {show && (
        <span
          id={id}
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 max-w-[90vw] px-3 py-2 rounded-lg bg-foreground text-background text-xs leading-relaxed shadow-lg pointer-events-none"
        >
          <span className="font-semibold block mb-0.5">{term}</span>
          {definition}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
        </span>
      )}
    </span>
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
  children: React.ReactNode;
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
        {children}
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
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="my-3 rounded-xl border border-border/60 bg-card overflow-hidden">
      <button
        type="button"
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
          open ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-4 text-sm text-foreground/85 leading-relaxed border-t border-border/40 pt-3">
          {children}
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
              type="button"
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
          type="button"
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
            type="button"
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

// ─── Icon Map (Lucide SVG paths) ───

const ICON_PATHS: Record<string, string> = {
  "book-open": "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z",
  "layers": "m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0l8.57-3.908a1 1 0 0 0 0-1.832z M22 17.65l-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65 M22 12.65l-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65",
  "package": "M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z M12 22V12 M3.3 7l7.703 4.734a2 2 0 0 0 1.994 0L20.7 7 M7.5 4.27l9 5.15",
  "target": "M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0-20 0 M12 12m-6 0a6 6 0 1 0 12 0a6 6 0 1 0-12 0 M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0",
  "zap": "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",
  "check-circle": "M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0-20 0 M9 12l2 2 4-4",
  "x-circle": "M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0-20 0 M15 9l-6 6 M9 9l6 6",
  "info": "M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0-20 0 M12 16v-4 M12 8h.01",
  "lightbulb": "M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5 M9 18h6 M10 22h4",
  "alert-triangle": "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z M12 9v4 M12 17h.01",
  "arrow-right": "M5 12h14 M12 5l7 7-7 7",
  "check": "M20 6L9 17l-5-5",
  "star": "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2",
  "clock": "M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0-20 0 M12 6v6l4 2",
  "graduation-cap": "M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z M22 10v6 M6 12.5V16a6 3 0 0 0 12 0v-3.5",
  "settings": "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0",
  "heart": "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",
  "search": "M11 11m-8 0a8 8 0 1 0 16 0a8 8 0 1 0-16 0 M21 21l-4.3-4.3",
  "plus": "M5 12h14 M12 5v14",
  "minus": "M5 12h14",
  "eye": "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0 M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0",
  "pen": "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
  "flask": "M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2 M8.5 2h7 M7 16.5h10",
  "wrench": "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z",
  "truck": "M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2 M15 18H9 M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14 M17 18m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0 M7 18m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0",
  "recycle": "M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5 M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12 M14 16l-3 3 3 3 M8.293 13.596L7.196 9.5 3.1 10.598 M9.344 5.811l1.093-1.892A1.83 1.83 0 0 1 12.02 3a1.784 1.784 0 0 1 1.558.89l3.96 6.835 M20.898 13.405l-3.964-6.868 M2.992 15.5l4.096 1.098",
};

export function InlineIcon({ name, size = 18 }: { name: string; size?: number }) {
  const pathData = ICON_PATHS[name];
  if (!pathData) return null;

  // Split multiple path segments (separated by " M" keeping the M)
  const segments = pathData.split(/(?= M)/g).map((s) => s.trim());

  return (
    <svg
      className="inline-block align-middle"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {segments.map((seg, i) => {
        // Check for circle shorthand: "M cx cy m -r 0 a r r 0 1 0 2r 0 a..."
        const circleMatch = seg.match(/^M(\d+\.?\d*) (\d+\.?\d*)m-(\d+\.?\d*) 0a(\d+\.?\d*)/);
        if (circleMatch) {
          return <circle key={i} cx={circleMatch[1]} cy={circleMatch[2]} r={circleMatch[3]} />;
        }
        return <path key={i} d={seg} />;
      })}
    </svg>
  );
}

export const AVAILABLE_ICONS = Object.keys(ICON_PATHS);

// ─── Tabs Block ───

export function TabsBlock({
  tabs,
  renderContent,
}: {
  tabs: { title: string; icon?: string; content: string }[];
  renderContent: (content: string) => React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="my-6">
      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b-2 border-border/60 overflow-x-auto">
        {tabs.map((tab, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveTab(i)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-[2px] transition-colors ${
              i === activeTab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            {tab.icon && <InlineIcon name={tab.icon} size={16} />}
            {tab.title}
          </button>
        ))}
      </div>
      {/* Tab content */}
      <div className="pt-4">
        {renderContent(tabs[activeTab]?.content || "")}
      </div>
    </div>
  );
}

// ─── Karten (Cards) Block ───

const badgeColors: Record<string, string> = {
  orange: "bg-orange-50 text-orange-600 border-orange-200",
  gray: "bg-gray-100 text-gray-600 border-gray-200",
  blue: "bg-blue-50 text-blue-600 border-blue-200",
  green: "bg-emerald-50 text-emerald-600 border-emerald-200",
  red: "bg-red-50 text-red-600 border-red-200",
  purple: "bg-purple-50 text-purple-600 border-purple-200",
  beige: "bg-amber-50 text-amber-700 border-amber-200",
};

export function KartenBlock({
  cards,
  columns,
  renderContent,
}: {
  cards: { title: string; badge?: string; badgeColor?: string; content: string }[];
  columns?: number;
  renderContent: (content: string) => React.ReactNode;
}) {
  const cols = columns || (cards.length >= 3 ? 3 : 2);
  const gridClass = cols === 3
    ? "grid grid-cols-1 md:grid-cols-3 gap-4 my-6"
    : "grid grid-cols-1 md:grid-cols-2 gap-4 my-6";

  return (
    <div className={gridClass}>
      {cards.map((card, i) => {
        const colorClass = badgeColors[card.badgeColor || "gray"] || badgeColors.gray;
        return (
          <div key={i} className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
            {card.badge && (
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border mb-3 ${colorClass}`}>
                {card.badge}
              </span>
            )}
            <h3 className={`font-bold text-lg mb-2 ${card.badgeColor === "orange" ? "text-primary" : "text-foreground"}`}>
              {card.title}
            </h3>
            <div className="text-sm text-foreground/80 leading-relaxed">
              {renderContent(card.content)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Spalten (Columns) ───

export function SpaltenBlock({ columns, renderColumn }: { columns: string[]; renderColumn?: (content: string) => React.ReactNode }) {
  const gridClass =
    columns.length === 3
      ? "grid grid-cols-1 md:grid-cols-3 gap-6 my-6"
      : "grid grid-cols-1 md:grid-cols-2 gap-6 my-6";

  return (
    <div className={gridClass}>
      {columns.map((col, i) => (
        <div key={i} className="min-w-0">
          {renderColumn ? renderColumn(col) : <BlockContent text={col} />}
        </div>
      ))}
    </div>
  );
}
