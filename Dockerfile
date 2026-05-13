# ---- deps ----
FROM node:22-alpine AS deps
WORKDIR /app

# For Prisma (und optional native deps)
RUN apk add --no-cache libc6-compat openssl

COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

# Install dependencies based on the lockfile
RUN npm install -g npm@11 && \
  if [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm i --frozen-lockfile; \
  elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  else echo "No lockfile found" && exit 1; fi

# ---- builder ----
FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG INNGEST_APP_ID
ENV INNGEST_APP_ID=$INNGEST_APP_ID

ARG POLAR_SERVER
ENV POLAR_SERVER=$POLAR_SERVER

ARG POLAR_SUCCESS_URL
ENV POLAR_SUCCESS_URL=$POLAR_SUCCESS_URL

RUN npm run prisma:generate
RUN npm run build

# ---- runner ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache libc6-compat openssl

# Only the things we need to run the app in standalone mode
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Take Prisma Schema + Migrations (for migrate deploy in Runtime-Container)
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

COPY --from=builder /app/node_modules ./node_modules

# Copy startup script and make it executable
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3000
ENV PORT=3000

ENTRYPOINT ["./docker-entrypoint.sh"]
