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
  api.$.test.ts        # API logic tests
  setup.ts             # Test setup
  load-tests/          # k6 load tests
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
import { app } from "../src/routes/api.$.ts";

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
  ui.test.ts    # UI tests (home page, navigation)
  api.$.test.ts # API endpoint tests
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
export default defineConfig({
  testDir: "./.e2e",
  baseURL: "http://localhost:3000",
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "bun run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
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
HOST=localhost PORT=3001 bun run test:load

# Or use BASE_URL directly
BASE_URL=http://localhost:3001 bun run test:load
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
