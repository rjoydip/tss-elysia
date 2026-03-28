FROM oven/bun:1.3.11-debian

WORKDIR /app

COPY package.json ./
COPY bun.lockb ./

RUN bun install --frozen-lockfile

COPY . .

RUN bun run build

ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

CMD ["bun", "run", "start"]