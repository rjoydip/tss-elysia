# API Reference

## Server Routes

This project uses TanStack Start with file-based routing. Routes are defined in `src/routes/`.

### Current Routes

| Method | Path        | Description       |
| ------ | ----------- | ----------------- |
| GET    | `/`         | Home page (SSR)   |
| GET    | `/api/test` | Test API endpoint |

### Route File Structure

```bash
src/routes/
  __root.tsx        # Root route (layout)
  index.tsx         # Home page (/)
  api/
    test.ts         # API endpoint (/api/test)
```

### Adding a New Route

Create a new file in `src/routes/`:

```typescript
// src/routes/about.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return <div>About Us</div>;
}
```

### Adding an API Route

Create a new file in `src/routes/api/`:

```typescript
// src/routes/api/users.ts
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/users")({
  loader: async () => {
    return {
      users: [
        { id: 1, name: "John" },
        { id: 2, name: "Jane" },
      ],
    };
  },
});
```

### Using Loaders in Components

```typescript
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/users")({
  component: UsersPage,
  loader: async () => {
    return { users: [{ id: 1, name: "John" }] };
  },
});

function UsersPage() {
  const { users } = Route.useLoaderData();
  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

## Client API

### Router

```typescript
import { getRouter } from "~/router";

const router = getRouter();
```

### Links

```typescript
import { Link } from "@tanstack/react-router";

<Link to="/">Home</Link>
```

## Error Handling

- `defaultErrorComponent` - 500 errors
- `defaultNotFoundComponent` - 404 errors

Configure in `src/router.tsx`:

```typescript
const router = createRouter({
  defaultErrorComponent: () => <div>Internal Server Error</div>,
  defaultNotFoundComponent: () => <div>Not Found</div>,
});
```
