FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl

# Dependencies (eigener Layer → wird gecacht solange package.json gleich bleibt)
COPY package.json package-lock.json ./
RUN npm ci

# Quellcode + Build
COPY . .
RUN npx prisma generate

# Dummy-DB für den Build (damit Prisma-Aufrufe beim Prerendering funktionieren)
ENV DATABASE_URL=file:/tmp/build.db
RUN npx prisma migrate deploy
RUN npm run build

# ─── Production Image ───
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Standalone-Output + statische Assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Prisma: Schema + nativer Client
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# Uploads-Verzeichnis anlegen (wird als Volume gemountet)
RUN mkdir -p /app/public/uploads

EXPOSE 3000

# Migrationen ausführen, dann App starten
CMD ["sh", "-c", "node node_modules/.bin/prisma migrate deploy && node server.js"]
