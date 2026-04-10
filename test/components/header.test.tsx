import { describe, expect, it, mock } from "bun:test";
import { renderToString } from "react-dom/server";
import { Header } from "../../src/components/header";

// Mock auth client
let mockSession: any = null;
let mockIsPending = false;
mock.module("../../src/lib/auth/client", () => ({
  useSession: () => ({ data: mockSession, isPending: mockIsPending }),
}));

// Mock scroll direction hook
mock.module("../../src/hooks/use-scroll-direction", () => ({
  useScrollDirection: () => true, // default to visible
}));

// Mock ThemeToggle component
mock.module("../../src/components/theme/toggle", () => ({
  ThemeToggle: () => <button>Toggle theme</button>,
}));

// Mock TanStack Router's Link component
mock.module("@tanstack/react-router", () => ({
  Link: ({ to, children, className, ...props }: any) => (
    <a href={to} className={className} {...props}>
      {children}
    </a>
  ),
}));

describe("Header", () => {
  it("should render without crashing", () => {
    const html = renderToString(<Header />);
    expect(html).toContain("<header");
  });

  describe("Loading State", () => {
    it("should hide navigation links when session is pending", () => {
      mockIsPending = true;
      mockSession = null;
      const html = renderToString(<Header />);
      expect(html).not.toContain("Documentation");
      expect(html).not.toContain("Blog");
    });

    it("should hide GitHub link when session is pending", () => {
      mockIsPending = true;
      const html = renderToString(<Header />);
      expect(html).not.toContain('aria-label="GitHub"');
    });

    it("should hide Theme Toggle when session is pending", () => {
      mockIsPending = true;
      const html = renderToString(<Header />);
      expect(html).not.toContain("Toggle theme");
    });
  });

  describe("Guest State", () => {
    it("should render navigation links when not logged in", () => {
      mockIsPending = false;
      mockSession = null;
      const html = renderToString(<Header />);
      expect(html).toContain("Documentation");
      expect(html).toContain("Blog");
    });

    it("should render GitHub link when not logged in", () => {
      mockSession = null;
      const html = renderToString(<Header />);
      expect(html).toContain('aria-label="GitHub"');
    });

    it("should render Login button when not logged in", () => {
      mockSession = null;
      const html = renderToString(<Header />);
      expect(html).toContain('href="/account/login"');
    });
  });

  describe("Authenticated State", () => {
    it("should hide navigation links when logged in", () => {
      mockSession = { user: { id: "1", name: "Test User" } };
      const html = renderToString(<Header />);
      expect(html).not.toContain("Documentation");
      expect(html).not.toContain("Blog");
      expect(html).not.toContain("Changelog");
    });

    it("should hide GitHub link when logged in", () => {
      mockSession = { user: { id: "1", name: "Test User" } };
      const html = renderToString(<Header />);
      expect(html).not.toContain('aria-label="GitHub"');
    });

    it("should hide Theme Toggle when logged in", () => {
      mockSession = { user: { id: "1", name: "Test User" } };
      const html = renderToString(<Header />);
      // ThemeToggle renders as a button with theme icons
      expect(html).not.toContain("Toggle theme");
    });

    it("should render user profile when logged in", () => {
      mockSession = { user: { id: "1", name: "Test User" } };
      const html = renderToString(<Header />);
      expect(html).toContain("Test User");
      // Sign In should be hidden
      expect(html).not.toContain('href="/account/login"');
    });
  });
});