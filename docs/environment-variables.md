# Environment Variables

## Server Configuration

| Variable | Default     | Description |
| -------- | ----------- | ----------- |
| `HOST`   | `localhost` | Server host |
| `PORT`   | `3000`      | Server port |

## Setup

Copy `.env.example` to `.env` and adjust values:

```bash
cp .env.example .env
```

## Usage

### Development

```bash
# Run on custom port
PORT=3001 bun run dev
# Or
bun run --env-file=.env dev

# Run on custom host
HOST=0.0.0.0 bun run dev
# Or
bun run --env-file=.env dev

# Both
HOST=0.0.0.0 PORT=3001 bun run dev
# Or
bun run --env-file=.env dev
```

### Production

```bash
# Build and run with custom port
bun run build && PORT=3001 bun run start
```

### Testing

Load tests and E2E tests also support these variables:

```bash
# Run load test on custom port
PORT=3001 bun run test:load
# Or
bun run --env-file=.env test:load

# Run E2E tests on custom host/port
HOST=localhost PORT=3001 bun run test:e2e
# Or
bun run --env-file=.env test:e2e
```

Or use `BASE_URL` for full URL override:

```bash
BASE_URL=http://localhost:3000 bun run test:load
# Or
bun run --env-file=.env test:load
```
