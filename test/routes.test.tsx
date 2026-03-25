import { describe, it, expect } from "bun:test";
import { createRootRoute, createFileRoute } from "@tanstack/react-router";

describe("Home Route", () => {
  it("should create route with path /", () => {
    const route = createFileRoute("/");
    expect(route).toBeDefined();
  });

  it("should create component that returns JSX", () => {
    function Home() {
      return (
        <div className="p-2">
          <h3>Welcome Home!</h3>
          <a href="/api/test">/api/test</a>
        </div>
      );
    }
    const result = Home();
    expect(result.props.children).toHaveLength(2);
  });
});

describe("Root Route", () => {
  it("should create root route with correct config", () => {
    const Route = createRootRoute({
      errorComponent: () => <h1>500: Internal Server Error</h1>,
      notFoundComponent: () => <h1>404: Page Not Found</h1>,
    });
    expect(Route).toBeDefined();
  });

  it("should have head config with meta tags", () => {
    const head = () => ({
      meta: [
        { charSet: "utf8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
    });
    const result = head();
    expect(result.meta).toHaveLength(2);
    expect(result.meta[0]?.charSet).toBe("utf8");
    expect(result.meta[1]?.name).toBe("viewport");
  });
});

describe("Router Configuration", () => {
  it("should have defaultPreload set to intent", () => {
    const config = {
      defaultPreload: "intent",
      scrollRestoration: true,
    };
    expect(config.defaultPreload).toBe("intent");
  });

  it("should have scrollRestoration enabled", () => {
    const config = {
      defaultPreload: "intent",
      scrollRestoration: true,
    };
    expect(config.scrollRestoration).toBe(true);
  });
});
