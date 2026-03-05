# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Production build
npm run lint         # Run ESLint
npm run db:seed      # Seed database with sample data (wipes existing data first)
npm run db:studio    # Open Prisma Studio (visual DB browser)
npx prisma migrate dev --name <name>  # Create and apply a new migration
npx prisma generate  # Regenerate Prisma client after schema changes
```

## Deployment

Production server: `root@46.224.44.62` (Ubuntu 24.04, Caddy, Docker)
Domain: `pmt.frispersonalpage.de`

Manual deploy (until GitHub Actions SSH is fixed):
```bash
ssh root@46.224.44.62 'cd /var/www/pmt && git pull origin main && docker compose up --build -d && docker image prune -f'
```

GitHub Actions auto-deploy is configured (`.github/workflows/deploy.yml`) but requires `SSH_PRIVATE_KEY`, `SERVER_HOST`, `SERVER_USER` secrets to be set correctly in the repo settings.

## Environment Variables

Required in `.env`:
- `DATABASE_URL` — SQLite path, e.g. `file:./dev.db`
- `STUDENT_PASSWORD` — Password for student login (default: `lernen2024`)
- `ADMIN_PASSWORD` — Password for admin login (default: `admin2024`)

## Architecture

**PMT Lernplattform** is a learning platform for packaging technology trainees (Packmitteltechnologen). It uses Next.js 16 App Router with server components, Prisma + SQLite for data, and cookie-based auth.

### Data Model (`prisma/schema.prisma`)
- **Category** — hierarchical (self-referencing `parent`/`children`), ordered by `position`
- **Post** — belongs to a category, has `editorType` (`MARKDOWN` or `HTML`), `published` flag, `position` for ordering, and `type` (`text` / `video` / `webpage`)
- **GlossaryTerm** — `term`, `slug` (unique), `definition`
- **PageView** — daily page view counts, unique on `[path, date]`
- **Feedback** — user feedback with `type` (`feedback` | `fehler` | `wunsch` | `glossar`), `name`, `email`, `message`, `page`
- **Setting** — key-value store (e.g. `feedback_enabled`)

### Auth (`middleware.ts` + `src/app/api/auth/route.ts`)
Cookie `auth-role` is set on login with value `"admin"` or `"student"`. Middleware enforces:
- All routes require the cookie (redirects to `/login`)
- `/admin/*` routes require `role === "admin"`
- `/api/*` and `/login` are always open

### Route Structure
```
src/app/
  page.tsx              # Home: shows top-level categories
  login/                # Login page
  kategorie/[slug]/     # Public category view (lists subcategories + posts)
  post/[slug]/          # Public post view (renders content: Markdown or HTML iframe)
  demo/[name]/          # iframe target for named demo components
  admin/
    page.tsx            # Dashboard with stats
    categories/         # CRUD for categories
    posts/              # CRUD for posts (new/edit support both Markdown and HTML type)
    media/              # Media library browser
    feedback/           # Feedback management (toggle, delete, glossary adopt)
    glossary/           # Glossary CRUD
    export/             # Backup & Import (ZIP + JSON download, JSON restore)
  api/
    auth/               # POST (login), DELETE (logout)
    categories/         # GET, POST; [id]: PUT, DELETE
    posts/              # GET, POST; [id]: PUT, DELETE
    upload/             # POST: file upload → public/uploads/ (max 500MB via busboy, auto WebP conversion for images)
    media/              # GET: list uploaded files (checks usage in posts + categories)
    media/optimize/     # POST: bulk convert existing images to WebP, updates all DB references
    reorder/            # POST: update positions
    export/             # GET: JSON export of all categories + posts
    export/full/        # GET: ZIP export (backup.json + uploads/ directory)
    import/             # POST: restore from JSON backup (clears DB first)
    feedback/           # GET (admin), POST (with honeypot, rate limit 3/hr, min 10 chars)
    glossary/           # GET, POST (admin); [id]: PUT, DELETE
    settings/           # GET, PUT key-value settings
```

### Post Types

Posts have two independent fields:
- `type` — display badge: `text` | `video` | `webpage`
- `editorType` — rendering engine: `MARKDOWN` | `HTML`

When `type === "webpage"`, `editorType` is automatically set to `"HTML"`. The post view (`post/[slug]/page.tsx`) renders accordingly:
- `editorType === "HTML"` → `<HtmlPostViewer>` (auto-resizing sandboxed iframe)
- `editorType === "MARKDOWN"` → `<MarkdownRenderer>`

### HTML/Webpage Posts (`editorType = "HTML"`)
Full HTML/CSS/JS pages stored as raw HTML in `post.content`. Rendered via:
- `src/components/html-post-viewer.tsx` — client component, auto-resizes iframe via `ResizeObserver` + `postMessage`, delays render until mounted (avoids hydration mismatch)
- `src/components/html-page-editor.tsx` — admin editor with code textarea, live preview, starter template button, media picker (upload + library), and KI-Prompt button

`buildSrcDoc(html)` in `html-page-editor.tsx`:
- Injects `<base href="origin/">` so `/uploads/` paths resolve correctly in the sandboxed iframe
- Injects base CSS (reset, typography, responsive defaults) before user `<style>` tags
- Appends auto-resize script before `</body>`
- Handles both full HTML documents and bare HTML fragments

### Custom Markdown Content Syntax
Posts use a custom Markdown dialect parsed in `src/components/markdown-renderer.tsx`. Beyond standard GFM + KaTeX math, these special blocks are supported:

| Syntax | Component |
|--------|-----------|
| `:::merke` / `:::tipp` / `:::warnung` / `:::info` ... `:::` | Colored callout box |
| `+++Titel` ... `+++` | Collapsible accordion |
| `???Frage` then `[x] correct` / `[ ] wrong` then `>>>Explanation` then `???` | Interactive quiz |
| `:::bild[/uploads/file.jpg]` with optional props then `:::` | Styled image block |
| `:::demo[name]` with optional `height:` / `title:` then `:::` | Named React demo in iframe |
| `:::htmldemo` with `---html` / `---css` / `---js` sections then `:::` | Custom HTML/CSS/JS sandbox iframe |

Raw HTML (e.g. `<video>`, `<audio>`, `<iframe>`) is supported inside callout and accordion blocks via `rehype-raw` in `BlockContent`.

KaTeX math also renders correctly **inside** callout, accordion, and quiz blocks (via `BlockContent`/`InlineContent` helpers in `content-blocks.tsx`).

### Named Demo Registry (`src/demos/`)
- `src/demos/index.ts` — maps demo IDs to lazy-loaded components (`{ "logic-simulator": { component, label, defaultHeight } }`)
- `src/demos/*.tsx` — individual demo components (`export default function ...`)
- `src/app/demo/[name]/page.tsx` — renders the registered component fullscreen (used as iframe target)
- To add a new demo: create the `.tsx` file, register in `index.ts`, add to `AVAILABLE_DEMOS` in `slash-editor.tsx`

### Editor (`src/components/slash-editor.tsx`)
A custom textarea-based editor with `/`-triggered command palette for inserting markdown blocks, live preview toggle, and a media browser modal for picking uploaded files. Slash commands include image (with `:::bild` config), video (upload or YouTube URL), audio (upload or URL → `<audio>` tag), table, formula, callout, accordion, quiz, demo blocks, and more.

### Navigation Components
- `src/components/site-header.tsx` — sticky top header with logo, admin link (admin only), logout. Used on all public pages (home, category, post).
- `src/components/scroll-to-top.tsx` — floating `↑` button (client component), appears after 300px scroll
- `src/components/back-to-top-button.tsx` — inline "↑ Nach oben" button for use in server components

Post pages show an admin-only "Beitrag bearbeiten" button at the bottom of the content (in addition to the pencil icon in the hero).

### Accent Titles
Post titles support `*text*` syntax to highlight words in orange (primary color) in the post hero via the `AccentTitle` component in `post/[slug]/page.tsx`. On all other surfaces (tiles, admin, search), `stripAccent()` from `src/lib/utils.ts` removes the markers for clean display.

### Feedback System (`src/components/feedback-button.tsx`)
Floating feedback button on all public pages. Types: `feedback`, `fehler`, `wunsch`, `glossar`. Features:
- Name + email required fields
- Honeypot field (`website`) — bots fill it, submission silently discarded
- Server-side rate limiting: max 3 submissions/hour per IP (in-memory)
- Message minimum length: 10 characters
- Admin can toggle feedback on/off via settings
- Glossar-type feedback can be adopted as glossary entries from the admin page

### File Uploads (`src/app/api/upload/route.ts`)
Uses `busboy` for streaming multipart uploads (up to 500MB). Supports images, videos, audio (MP3, M4A, WAV, OGG, AAC, FLAC), and PDFs. `next.config.ts` sets `experimental.proxyClientMaxBodySize: "500mb"` to prevent Next.js middleware from truncating large request bodies (default 10MB).

**Automatic WebP conversion:** On upload, images (JPEG, PNG, TIFF, BMP) are automatically converted to WebP using `sharp` (max 1920px width, quality 80%). SVGs and GIFs are kept as-is. The admin media page has a "WebP optimieren" button to bulk-convert existing images and update all DB references (posts + categories).

### Media Usage Tracking (`src/app/api/media/route.ts`)
The media API checks file usage across both post fields (`content`, `coverImage`) and category images (`image`). Files used nowhere are marked as unused. The admin media page shows usage badges and offers a bulk cleanup button for unused files.

### Important: Preventing Build-Time Caching
All server components that query Prisma **must** include `export const dynamic = "force-dynamic"`. Without this, Next.js caches the page at Docker build time using the empty build DB, and the production app shows 0 results.

### Key Files
- `src/lib/prisma.ts` — singleton Prisma client
- `src/lib/utils.ts` — `cn()` helper (clsx + tailwind-merge), `stripAccent()` for title display
- `src/components/content-blocks.tsx` — `Callout`, `Accordion`, `Quiz`, `BildBlock`, `DemoBlock`, `HtmlDemoBlock` + math-rendering helpers (`BlockContent` uses `rehype-raw` for HTML support)
- `src/components/markdown-renderer.tsx` — parses custom syntax → renders blocks
- `src/components/slash-editor.tsx` — admin post editor (Markdown)
- `src/components/html-page-editor.tsx` — admin post editor (HTML/CSS/JS), exports `buildSrcDoc()`
- `src/components/html-post-viewer.tsx` — public viewer for HTML posts (client component)
- `src/components/site-header.tsx` — global navigation header
- `src/components/scroll-to-top.tsx` — floating scroll-to-top button
- `src/components/feedback-button.tsx` — floating feedback form (client component)
- `src/components/search-bar.tsx` — global search with post results
- `public/uploads/` — user-uploaded media files (served as static assets)
