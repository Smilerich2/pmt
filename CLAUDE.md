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

## Environment Variables

Required in `.env`:
- `DATABASE_URL` — SQLite path, e.g. `file:./dev.db`
- `STUDENT_PASSWORD` — Password for student login (default: `lernen2024`)
- `ADMIN_PASSWORD` — Password for admin login (default: `admin2024`)

## Architecture

**PMT Lernplattform** is a learning platform for packaging technology trainees (Packmitteltechnologen). It uses Next.js 15 App Router with server components, Prisma + SQLite for data, and cookie-based auth.

### Data Model (`prisma/schema.prisma`)
- **Category** — hierarchical (self-referencing `parent`/`children`), ordered by `position`
- **Post** — belongs to a category, has `editorType` (`MARKDOWN`), `published` flag, and `position` for ordering

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
  post/[slug]/          # Public post view (renders content)
  admin/
    page.tsx            # Dashboard with stats
    categories/         # CRUD for categories
    posts/              # CRUD for posts
    media/              # Media library browser
  api/
    auth/               # POST (login), DELETE (logout)
    categories/         # GET, POST; [id]: PUT, DELETE
    posts/              # GET, POST; [id]: PUT, DELETE
    upload/             # POST: file upload → public/uploads/
    media/              # GET: list uploaded files
    reorder/            # POST: update positions
```

### Custom Markdown Content Syntax
Posts use a custom Markdown dialect parsed in `src/components/markdown-renderer.tsx`. Beyond standard GFM + KaTeX math, these special blocks are supported:

| Syntax | Component |
|--------|-----------|
| `:::merke` / `:::tipp` / `:::warnung` / `:::info` ... `:::` | Colored callout box |
| `+++Titel` ... `+++` | Collapsible accordion |
| `???Frage` then `[x] correct` / `[ ] wrong` then `>>>Explanation` then `???` | Interactive quiz |
| `:::bild[/uploads/file.jpg]` with optional props then `:::` | Styled image block |

### Editor (`src/components/slash-editor.tsx`)
A custom textarea-based editor with `/`-triggered command palette for inserting markdown blocks, live preview toggle, and a media browser modal for picking uploaded images.

### Key Files
- `src/lib/prisma.ts` — singleton Prisma client
- `src/lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)
- `src/components/content-blocks.tsx` — `Callout`, `Accordion`, `Quiz`, `BildBlock` React components
- `src/components/markdown-renderer.tsx` — parses custom syntax → renders blocks
- `src/components/slash-editor.tsx` — admin post editor
- `public/uploads/` — user-uploaded media files (served as static assets)
