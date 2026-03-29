# Testing

This project uses two testing approaches: unit tests with Bun and E2E tests with Playwright.

## Unit Tests (Bun)

### Running Tests

```bash
bun test              # Run all tests
bun test --watch      # Watch mode
bun test --coverage  # With coverage report
```

### Test Structure

Tests are located in `test/`:

```bash
test/
  db.test.ts          # Database CRUD tests
  auth.test.ts        # Auth unit tests (Better Auth)
  env.test.ts         # Environment variable tests
  setup.ts            # Test setup (JSDOM)
  fixtures/           # Shared test fixtures
    db.ts             # In-memory DB, seed helpers
  load-tests/         # k6 load tests
    smoke-test.js     # Smoke test
    api-test.js      # API load test
    stress-test.js   # Stress test
```

### Writing Tests

```typescript
import { describe, it, expect } from "bun:test";
import { createFileRoute } from "@tanstack/react-router";

describe("Home Route", () => {
  it("should create route with path /", () => {
    const route = createFileRoute("/");
    expect(route).toBeDefined();
  });
});
```

### Eden Treaty Tests

Use Eden Treaty for end-to-end type-safe API testing:

```typescript
import { describe, expect, it } from "bun:test";
import { treaty } from "@elysiajs/eden";
import { app } from "../src/routes/api/$.ts";

const api = treaty(app);

describe("API Endpoints", () => {
  it("should return welcome message", async () => {
    const { data, error, status } = await api.api.get();
    expect(error).toBeNull();
    expect(status).toBe(200);
    expect(data).toContain("Welcome to");
  });

  it("should return health status", async () => {
    const { data, error } = await api.api.health.get();
    expect(error).toBeNull();
    expect(data).toHaveProperty("status", "ok");
  });
});
```

### Available Matchers

Bun's test runner supports Jest-like matchers:

- `expect(value).toBe(expected)`
- `expect(value).toEqual(expected)`
- `expect(value).toBeDefined()`
- `expect(value).toBeTruthy()`
- `expect(value).toHaveLength(n)`
- And more...

## E2E Tests (Playwright)

### Running E2E Tests

```bash
bun run test:e2e        # Run all E2E tests
bun run test:e2e:ui     # Interactive UI mode
bun run test:e2e:headed # Visible browser
bun run test:e2e:report # View HTML report
```

### E2E Test Structure

E2E tests are in `.e2e/`:

```bash
.e2e/
  config.ts       # Shared E2E configuration (host, port, base URL)
  ui.test.ts      # UI tests (home page, navigation)
  api.$.test.ts   # API endpoint tests
  auth.test.ts    # Authentication E2E tests
```

E2E configuration is centralized in `.e2e/config.ts` and shared by both `playwright.config.ts` and test files:

```typescript
// .e2e/config.ts
const host = process.env.E2E_HOST || process.env.HOST || "localhost";
const port = process.env.E2E_PORT || process.env.PORT || "3000";

export const E2E_BASE_URL = process.env.E2E_BASE_URL || `http://${host}:${port}`;
export const E2E_HOST = host;
export const E2E_PORT = port;
```

### CI Test Skip Behavior

Some API endpoint tests are skipped in CI environments because the preview server may not be accessible from Playwright's browser. Tests that require actual HTTP requests to the server will automatically skip when `isCI` is detected. Tests that don't require server access (like 404 handling) still run.

### UI Tests (`.e2e/ui.test.ts`)

```typescript
import { test, expect } from "@playwright/test";

test("should display home page", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Welcome Home!" })).toBeVisible();
});
```

### API Tests (`.e2e/api.test.ts`)

```typescript
import { test, expect } from "@playwright/test";

test("should respond to /api/test", async ({ request }) => {
  const response = await request.get("/api/test");
  expect(response.status()).toBeGreaterThanOrEqual(200);
});
```

### Selectors

- `page.getByRole()` - By ARIA role
- `page.getByText()` - By text content
- `page.getByLabel()` - By form label
- `page.getByPlaceholder()` - By input placeholder
- `page.locator()` - Custom selectors

### Configuration

Edit `playwright.config.ts`:

```typescript
import { E2E_BASE_URL, E2E_HOST, E2E_PORT } from "./.e2e/config";

export default defineConfig({
  testDir: "./.e2e",
  baseURL: E2E_BASE_URL,
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `bun run preview --host=${E2E_HOST} --port=${E2E_PORT}`,
    url: E2E_BASE_URL,
    reuseExistingServer: !process.env.CI,
  },
});
```

Override via environment variables:

```bash
E2E_HOST=0.0.0.0 E2E_PORT=4173 bun run test:e2e
# Or use full URL
E2E_BASE_URL=http://custom:4173 bun run test:e2e
```

## CI Integration

E2E tests run automatically in GitHub Actions:

```yaml
- name: Install Playwright browsers
  run: bunx playwright install --with-deps chromium

- name: Run E2E tests
  run: bun run test:e2e
```

## Load Tests (k6)

### Running Load Tests

```bash
bun run test:load        # Run smoke test
bun run test:load:api    # Run API load test
bun run test:load:stress # Run stress test
```

### Load Test Structure

Load tests are in `test/load-tests/`:

```bash
test/load-tests/
  smoke-test.js   # Basic smoke test
  api-test.js    # API endpoint load test
  stress-test.js # Stress test
```

### Load Test Configuration

Configure using environment variables:

```bash
# Use custom host/port
HOST=localhost PORT=3000 bun run test:load

# Or use BASE_URL directly
BASE_URL=http://localhost:3000 bun run test:load
```

Supported variables:

- `HOST` - Server host (default: `localhost`)
- `PORT` - Server port (default: `3000`)
- `BASE_URL` - Full URL override

### Test Types

- **Smoke Test** - Basic validation with low load (1 VU, 10s)
- **API Test** - Tests `/api` endpoint
- **Stress Test** - High load testing

## Best Practices

1. **Unit tests** - Test isolated logic, components, utilities
2. **E2E tests** - Test critical user flows
3. **Load tests** - Validate performance under load
4. **Run locally** - Always run tests before committing
5. **Keep tests focused** - One assertion per test when possible
6. **Use meaningful names** - Describe what you're testing