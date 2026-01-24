FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build

WORKDIR /src

COPY package* .
COPY drizzle.config.ts .
COPY tsconfig.json .
COPY /drizzle .

RUN pnpm install

COPY . .

EXPOSE 3002

CMD ["pnpm", "start"]



