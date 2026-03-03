"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css";
import { Callout, Accordion, Quiz, BildBlock, DemoBlock, HtmlDemoBlock, GlossarTooltip } from "./content-blocks";

export type GlossaryEntry = { term: string; definition: string };

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

type Block =
  | { type: "markdown"; content: string }
  | { type: "callout"; variant: string; content: string }
  | { type: "accordion"; title: string; content: string }
  | { type: "quiz"; question: string; options: { text: string; correct: boolean }[]; explanation?: string }
  | { type: "bild"; config: BildConfig }
  | { type: "demo"; name: string; height?: number; title?: string }
  | { type: "htmldemo"; html: string; css: string; js: string; height?: number; title?: string };

function parseContent(raw: string): Block[] {
  const blocks: Block[] = [];
  const lines = raw.split("\n");
  let i = 0;
  let markdownBuffer: string[] = [];

  function flushMarkdown() {
    const text = markdownBuffer.join("\n").trim();
    if (text) {
      blocks.push({ type: "markdown", content: text });
    }
    markdownBuffer = [];
  }

  while (i < lines.length) {
    const line = lines[i];

    // ─── Bild: :::bild[/uploads/foto.jpg] ───
    const bildMatch = line.match(/^:::bild\[(.+?)\]\s*$/);
    if (bildMatch) {
      flushMarkdown();
      const src = bildMatch[1];
      const config: BildConfig = { src };
      i++;
      while (i < lines.length && lines[i].trim() !== ":::") {
        const propMatch = lines[i].match(/^(\w+):\s*(.+)$/);
        if (propMatch) {
          const [, key, val] = propMatch;
          if (key === "caption") config.caption = val.trim();
          else if (key === "alt") config.alt = val.trim();
          else if (key === "size") config.size = val.trim() as BildConfig["size"];
          else if (key === "position") config.position = val.trim() as BildConfig["position"];
          else if (key === "ratio") config.ratio = val.trim() as BildConfig["ratio"];
          else if (key === "rounded") config.rounded = val.trim() === "true";
          else if (key === "shadow") config.shadow = val.trim() === "true";
          else if (key === "border") config.border = val.trim() === "true";
        }
        i++;
      }
      blocks.push({ type: "bild", config });
      i++; // skip closing :::
      continue;
    }

    // ─── Demo: :::demo[name] ───
    const demoMatch = line.match(/^:::demo\[(.+?)\]\s*$/);
    if (demoMatch) {
      flushMarkdown();
      const name = demoMatch[1];
      let height: number | undefined;
      let title: string | undefined;
      i++;
      while (i < lines.length && lines[i].trim() !== ":::") {
        const propMatch = lines[i].match(/^(\w+):\s*(.+)$/);
        if (propMatch) {
          const [, key, val] = propMatch;
          if (key === "height") height = parseInt(val.trim(), 10);
          else if (key === "title") title = val.trim();
        }
        i++;
      }
      blocks.push({ type: "demo", name, height, title });
      i++; // skip closing :::
      continue;
    }

    // ─── HTML Demo: :::htmldemo ───
    if (line.trim() === ":::htmldemo") {
      flushMarkdown();
      let height: number | undefined;
      let title: string | undefined;
      const htmlLines: string[] = [];
      const cssLines: string[] = [];
      const jsLines: string[] = [];
      let section: "props" | "html" | "css" | "js" = "props";
      i++;
      while (i < lines.length && lines[i].trim() !== ":::") {
        const l = lines[i];
        if (l.trim() === "---html") { section = "html"; i++; continue; }
        if (l.trim() === "---css")  { section = "css";  i++; continue; }
        if (l.trim() === "---js")   { section = "js";   i++; continue; }
        if (section === "props") {
          const propMatch = l.match(/^(\w+):\s*(.+)$/);
          if (propMatch) {
            const [, key, val] = propMatch;
            if (key === "height") height = parseInt(val.trim(), 10);
            else if (key === "title") title = val.trim();
          }
        } else if (section === "html") {
          htmlLines.push(l);
        } else if (section === "css") {
          cssLines.push(l);
        } else if (section === "js") {
          jsLines.push(l);
        }
        i++;
      }
      blocks.push({
        type: "htmldemo",
        html: htmlLines.join("\n"),
        css: cssLines.join("\n"),
        js: jsLines.join("\n"),
        height,
        title,
      });
      i++; // skip closing :::
      continue;
    }

    // ─── Callout: :::merke / :::tipp / :::warnung / :::info ───
    const calloutMatch = line.match(/^:::(merke|tipp|warnung|info)\s*$/);
    if (calloutMatch) {
      flushMarkdown();
      const variant = calloutMatch[1];
      const contentLines: string[] = [];
      i++;
      while (i < lines.length && lines[i].trim() !== ":::") {
        contentLines.push(lines[i]);
        i++;
      }
      blocks.push({
        type: "callout",
        variant,
        content: contentLines.join("\n").trim(),
      });
      i++; // skip closing :::
      continue;
    }

    // ─── Accordion: +++Titel\nInhalt\n+++ ───
    const accordionMatch = line.match(/^\+\+\+(.+)$/);
    if (accordionMatch) {
      flushMarkdown();
      const title = accordionMatch[1].trim();
      const contentLines: string[] = [];
      i++;
      while (i < lines.length && lines[i].trim() !== "+++") {
        contentLines.push(lines[i]);
        i++;
      }
      blocks.push({
        type: "accordion",
        title,
        content: contentLines.join("\n").trim(),
      });
      i++; // skip closing +++
      continue;
    }

    // ─── Quiz: ???Frage\n[ ] / [x] Optionen\n>>>Erklärung\n??? ───
    const quizMatch = line.match(/^\?\?\?(.+)$/);
    if (quizMatch) {
      flushMarkdown();
      const question = quizMatch[1].trim();
      const options: { text: string; correct: boolean }[] = [];
      let explanation: string | undefined;
      i++;
      while (i < lines.length && lines[i].trim() !== "???") {
        const optLine = lines[i].trim();
        const correctMatch = optLine.match(/^\[x\]\s*(.+)$/);
        const wrongMatch = optLine.match(/^\[\s*\]\s*(.+)$/);
        const explMatch = optLine.match(/^>>>(.+)$/);

        if (correctMatch) {
          options.push({ text: correctMatch[1], correct: true });
        } else if (wrongMatch) {
          options.push({ text: wrongMatch[1], correct: false });
        } else if (explMatch) {
          explanation = explMatch[1].trim();
        }
        i++;
      }
      blocks.push({ type: "quiz", question, options, explanation });
      i++; // skip closing ???
      continue;
    }

    markdownBuffer.push(line);
    i++;
  }

  flushMarkdown();
  return blocks;
}

function preprocessGlossar(text: string, glossary: GlossaryEntry[]): string {
  if (!glossary.length) return text;
  return text.replace(/::glossar\[(.+?)\]/g, (_match, term: string) => {
    const entry = glossary.find(
      (g) => g.term.toLowerCase() === term.toLowerCase()
    );
    if (!entry) return term;
    const safeDef = entry.definition
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    const safeTerm = entry.term
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return `<glossar term="${safeTerm}" definition="${safeDef}">${safeTerm}</glossar>`;
  });
}

export function MarkdownRenderer({ content, glossary = [] }: { content: string; glossary?: GlossaryEntry[] }) {
  const blocks = parseContent(content);

  return (
    <div>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "callout":
            return (
              <Callout
                key={i}
                type={block.variant as "merke" | "tipp" | "warnung" | "info"}
              >
                {block.content}
              </Callout>
            );
          case "accordion":
            return (
              <Accordion key={i} title={block.title}>
                {block.content}
              </Accordion>
            );
          case "quiz":
            return (
              <Quiz
                key={i}
                question={block.question}
                options={block.options}
                explanation={block.explanation}
              />
            );
          case "bild":
            return <BildBlock key={i} config={block.config} />;
          case "demo":
            return <DemoBlock key={i} name={block.name} height={block.height} title={block.title} />;
          case "htmldemo":
            return <HtmlDemoBlock key={i} html={block.html} css={block.css} js={block.js} height={block.height} title={block.title} />;
          case "markdown":
            return <MarkdownBlock key={i} content={block.content} glossary={glossary} />;
        }
      })}
    </div>
  );
}

function MarkdownBlock({ content, glossary = [] }: { content: string; glossary?: GlossaryEntry[] }) {
  const processed = preprocessGlossar(content, glossary);
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeRaw, rehypeKatex]}
      components={{
        h1: ({ children }) => (
          <h1 className="text-3xl font-bold mt-8 mb-4 text-foreground">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-2xl font-bold mt-8 mb-3 text-foreground border-b border-border/60 pb-2">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-xl font-semibold mt-6 mb-2 text-foreground">
            {children}
          </h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-lg font-semibold mt-5 mb-2 text-foreground">
            {children}
          </h4>
        ),
        p: ({ children }) => (
          <p className="mb-4 leading-relaxed text-foreground/90 text-[1.05rem]">
            {children}
          </p>
        ),
        ul: ({ children }) => (
          <ul className="mb-4 ml-6 list-disc space-y-1.5 text-foreground/90 text-[1.05rem]">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-4 ml-6 list-decimal space-y-1.5 text-foreground/90 text-[1.05rem]">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="leading-relaxed">{children}</li>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-foreground">{children}</strong>
        ),
        blockquote: ({ children }) => (
          <blockquote className="my-4 border-l-4 border-primary bg-accent/50 px-4 py-3 rounded-r-lg text-foreground/80 italic">
            {children}
          </blockquote>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
          >
            {children}
          </a>
        ),
        code: ({ children, className }) => {
          const isBlock = className?.includes("language-");
          if (isBlock) {
            return (
              <code className="block bg-foreground/5 rounded-lg p-4 text-sm overflow-x-auto font-mono">
                {children}
              </code>
            );
          }
          return (
            <code className="bg-accent px-1.5 py-0.5 rounded text-sm font-mono text-primary">
              {children}
            </code>
          );
        },
        pre: ({ children }) => <pre className="mb-4">{children}</pre>,
        table: ({ children }) => (
          <div className="my-6 overflow-x-auto rounded-xl border border-border/60 shadow-sm">
            <table className="w-full text-sm">{children}</table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-accent/70">{children}</thead>
        ),
        th: ({ children }) => (
          <th className="px-4 py-3 text-left font-semibold text-foreground border-b border-border/60">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-4 py-2.5 border-b border-border/40 text-foreground/85">
            {children}
          </td>
        ),
        tr: ({ children }) => (
          <tr className="even:bg-accent/30 transition-colors hover:bg-accent/50">
            {children}
          </tr>
        ),
        hr: () => <hr className="my-8 border-border/60" />,
        img: ({ src, alt }) => (
          <img
            src={src}
            alt={alt || ""}
            className="rounded-xl my-4 shadow-sm max-w-full"
          />
        ),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...({ glossar: ({ term, definition, children }: any) => (
          <GlossarTooltip term={term || children} definition={definition || ""} />
        ) } as any),
      }}
    >
      {processed}
    </ReactMarkdown>
  );
}
