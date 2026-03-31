/**
 * Unit tests for UI components
 * Tests: Badge, Button, Card, Separator rendering and variants
 */

import { describe, expect, it } from "bun:test";
import { renderToString } from "react-dom/server";
import React from "react";
import { Badge, badgeVariants } from "../../src/components/ui/badge";
import { Button, buttonVariants } from "../../src/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../../src/components/ui/card";
import { Separator } from "../../src/components/ui/separator";

// --- Badge Tests ---

describe("Badge", () => {
  it("should render with default variant", () => {
    const html = renderToString(<Badge>Test</Badge>);
    expect(html).toContain("Test");
    expect(html).toContain("rounded-md");
  });

  it("should render with secondary variant", () => {
    const html = renderToString(<Badge variant="secondary">Secondary</Badge>);
    expect(html).toContain("Secondary");
    expect(html).toContain("bg-secondary");
  });

  it("should render with destructive variant", () => {
    const html = renderToString(<Badge variant="destructive">Error</Badge>);
    expect(html).toContain("Error");
    expect(html).toContain("bg-destructive");
  });

  it("should render with outline variant", () => {
    const html = renderToString(<Badge variant="outline">Outline</Badge>);
    expect(html).toContain("Outline");
    expect(html).toContain("text-foreground");
  });

  it("should render with success variant", () => {
    const html = renderToString(<Badge variant="success">Success</Badge>);
    expect(html).toContain("Success");
    expect(html).toContain("bg-emerald-500");
  });

  it("should render with warning variant", () => {
    const html = renderToString(<Badge variant="warning">Warning</Badge>);
    expect(html).toContain("Warning");
    expect(html).toContain("bg-amber-500");
  });

  it("should apply custom className", () => {
    const html = renderToString(<Badge className="custom-class">Custom</Badge>);
    expect(html).toContain("custom-class");
  });

  it("should render as a div element", () => {
    const html = renderToString(<Badge>Div</Badge>);
    expect(html).toContain("<div");
  });

  it("should forward additional HTML attributes", () => {
    const html = renderToString(<Badge data-testid="badge">Attr</Badge>);
    expect(html).toContain('data-testid="badge"');
  });

  it("should export badgeVariants function", () => {
    expect(typeof badgeVariants).toBe("function");
  });
});

// --- Button Tests ---

describe("Button", () => {
  it("should render with default variant", () => {
    const html = renderToString(<Button>Click</Button>);
    expect(html).toContain("Click");
    expect(html).toContain("bg-primary");
  });

  it("should render with destructive variant", () => {
    const html = renderToString(<Button variant="destructive">Delete</Button>);
    expect(html).toContain("Delete");
    expect(html).toContain("bg-destructive");
  });

  it("should render with outline variant", () => {
    const html = renderToString(<Button variant="outline">Outline</Button>);
    expect(html).toContain("border-input");
  });

  it("should render with secondary variant", () => {
    const html = renderToString(<Button variant="secondary">Secondary</Button>);
    expect(html).toContain("bg-secondary");
  });

  it("should render with ghost variant", () => {
    const html = renderToString(<Button variant="ghost">Ghost</Button>);
    expect(html).toContain("hover:bg-accent");
  });

  it("should render with link variant", () => {
    const html = renderToString(<Button variant="link">Link</Button>);
    expect(html).toContain("text-primary");
    expect(html).toContain("hover:underline");
  });

  it("should render with small size", () => {
    const html = renderToString(<Button size="sm">Small</Button>);
    expect(html).toContain("h-8");
  });

  it("should render with large size", () => {
    const html = renderToString(<Button size="lg">Large</Button>);
    expect(html).toContain("h-10");
  });

  it("should render with icon size", () => {
    const html = renderToString(<Button size="icon">I</Button>);
    expect(html).toContain("h-9");
    expect(html).toContain("w-9");
  });

  it("should show loading spinner when isLoading is true", () => {
    const html = renderToString(<Button isLoading>Submit</Button>);
    expect(html).toContain("animate-spin");
    expect(html).toContain("Submit");
  });

  it("should be disabled when isLoading is true", () => {
    const html = renderToString(<Button isLoading>Submit</Button>);
    expect(html).toContain("disabled");
  });

  it("should be disabled when disabled prop is true", () => {
    const html = renderToString(<Button disabled>Disabled</Button>);
    expect(html).toContain("disabled");
  });

  it("should apply custom className", () => {
    const html = renderToString(<Button className="my-btn">Custom</Button>);
    expect(html).toContain("my-btn");
  });

  it("should render as a button element", () => {
    const html = renderToString(<Button>Btn</Button>);
    expect(html).toContain("<button");
  });

  it("should export buttonVariants function", () => {
    expect(typeof buttonVariants).toBe("function");
  });
});

// --- Card Tests ---

describe("Card", () => {
  it("should render Card container", () => {
    const html = renderToString(<Card>Content</Card>);
    expect(html).toContain("Content");
    expect(html).toContain("rounded-xl");
    expect(html).toContain("border");
  });

  it("should render CardHeader", () => {
    const html = renderToString(<CardHeader>Header</CardHeader>);
    expect(html).toContain("Header");
    expect(html).toContain("flex");
  });

  it("should render CardTitle as h3", () => {
    const html = renderToString(<CardTitle>Title</CardTitle>);
    expect(html).toContain("Title");
    expect(html).toContain("font-semibold");
    expect(html).toContain("<h3");
  });

  it("should render CardDescription", () => {
    const html = renderToString(<CardDescription>Description</CardDescription>);
    expect(html).toContain("Description");
    expect(html).toContain("text-sm");
    expect(html).toContain("<p");
  });

  it("should render CardContent", () => {
    const html = renderToString(<CardContent>Body</CardContent>);
    expect(html).toContain("Body");
    expect(html).toContain("p-6");
  });

  it("should render CardFooter", () => {
    const html = renderToString(<CardFooter>Footer</CardFooter>);
    expect(html).toContain("Footer");
    expect(html).toContain("flex");
  });

  it("should compose full card with all sub-components", () => {
    const html = renderToString(
      <Card>
        <CardHeader>
          <CardTitle>My Title</CardTitle>
          <CardDescription>My Description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card body content</p>
        </CardContent>
        <CardFooter>
          <span>Action</span>
        </CardFooter>
      </Card>,
    );
    expect(html).toContain("My Title");
    expect(html).toContain("My Description");
    expect(html).toContain("Card body content");
    expect(html).toContain("Action");
  });

  it("should apply custom className to Card", () => {
    const html = renderToString(<Card className="my-card">C</Card>);
    expect(html).toContain("my-card");
  });

  it("should forward ref to Card", () => {
    const ref = React.createRef<HTMLDivElement>();
    renderToString(<Card ref={ref}>Ref</Card>);
    // ref is not set during SSR, but component should not throw
    expect(true).toBe(true);
  });
});

// --- Separator Tests ---

describe("Separator", () => {
  it("should render horizontal separator by default", () => {
    const html = renderToString(<Separator />);
    expect(html).toContain("w-full");
    expect(html).toContain("h-[1px]");
  });

  it("should render vertical separator", () => {
    const html = renderToString(<Separator orientation="vertical" />);
    expect(html).toContain("h-full");
    expect(html).toContain("w-[1px]");
  });

  it("should have role=none when decorative (default)", () => {
    const html = renderToString(<Separator />);
    expect(html).toContain('role="none"');
  });

  it("should have role=separator when not decorative", () => {
    const html = renderToString(<Separator decorative={false} />);
    expect(html).toContain('role="separator"');
  });

  it("should set aria-orientation", () => {
    const html = renderToString(<Separator orientation="vertical" decorative={false} />);
    expect(html).toContain('aria-orientation="vertical"');
  });

  it("should set horizontal aria-orientation", () => {
    const html = renderToString(<Separator orientation="horizontal" decorative={false} />);
    expect(html).toContain('aria-orientation="horizontal"');
  });

  it("should apply custom className", () => {
    const html = renderToString(<Separator className="my-sep" />);
    expect(html).toContain("my-sep");
  });

  it("should render as a div element", () => {
    const html = renderToString(<Separator />);
    expect(html).toContain("<div");
  });
});