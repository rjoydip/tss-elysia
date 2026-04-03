/**
 * Unit tests for src/components/footer.tsx
 * Tests: Footer rendering, links, dynamic year, options
 */

import { describe, expect, it } from "bun:test";
import { renderToString } from "react-dom/server";
import { Footer } from "../../src/components/footer";

describe("Footer", () => {
  it("should render without crashing", () => {
    const html = renderToString(<Footer />);
    expect(html).toContain("<footer");
  });

  it("should render Documentation link", () => {
    const html = renderToString(<Footer />);
    expect(html).toContain("Documentation");
    expect(html).toContain('href="/docs"');
  });

  it("should render Blog link", () => {
    const html = renderToString(<Footer />);
    expect(html).toContain("Blog");
    expect(html).toContain('href="/blog"');
  });

  it("should render Changelog link", () => {
    const html = renderToString(<Footer />);
    expect(html).toContain("Changelog");
    expect(html).toContain('href="/changelog"');
  });

  it("should render Status link", () => {
    const html = renderToString(<Footer />);
    expect(html).toContain("Status");
    expect(html).toContain('href="/status"');
  });

  it("should render GitHub link", () => {
    const html = renderToString(<Footer />);
    expect(html).toContain("GitHub");
    expect(html).toContain("github.com");
  });

  it("should render current year in copyright", () => {
    const html = renderToString(<Footer />);
    const currentYear = new Date().getFullYear().toString();
    expect(html).toContain(currentYear);
  });

  it("should render app name in copyright", () => {
    const html = renderToString(<Footer />);
    expect(html).toContain("TSSE");
  });

  it("should apply custom className", () => {
    const html = renderToString(<Footer className="custom-footer" />);
    expect(html).toContain("custom-footer");
  });

  it("should have status pulse indicator", () => {
    const html = renderToString(<Footer />);
    expect(html).toContain("animate-pulse");
  });

  it("should have all links as anchor elements", () => {
    const html = renderToString(<Footer />);
    const linkCount = (html.match(/<a /g) || []).length;
    expect(linkCount).toBeGreaterThanOrEqual(5);
  });

  it("should show terms when showTerms is true", () => {
    const html = renderToString(<Footer showTerms={true} />);
    expect(html).toContain("Terms of Service");
    expect(html).toContain("Privacy Policy");
  });

  it("should hide terms when showTerms is false", () => {
    const html = renderToString(<Footer showTerms={false} />);
    expect(html).not.toContain("Terms of Service");
  });

  it("should show logo when showLogo is true (default)", () => {
    const html = renderToString(<Footer showLogo={true} />);
    expect(html).toContain("TSSE");
  });

  it("should hide logo when showLogo is false", () => {
    const html = renderToString(<Footer showLogo={false} />);
    // Logo section should be empty - app name should not appear in logo area
    expect(html).not.toContain("TSSE</span>");
  });
});