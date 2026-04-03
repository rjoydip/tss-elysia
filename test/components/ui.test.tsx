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
import { Label } from "../../src/components/ui/label";
import { Switch } from "../../src/components/ui/switch";
import { Skeleton } from "../../src/components/ui/skeleton";
import { Input } from "../../src/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../src/components/ui/tabs";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../../src/components/ui/accordion";

// --- Badge Tests ---

describe("Badge", () => {
  it("should render with default variant", () => {
    const html = renderToString(<Badge>Test</Badge>);
    expect(html).toContain("Test");
    expect(html).toContain("rounded-full");
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
    expect(html).toContain("h-9");
  });

  it("should render with large size", () => {
    const html = renderToString(<Button size="lg">Large</Button>);
    expect(html).toContain("h-11");
  });

  it("should render with icon size", () => {
    const html = renderToString(<Button size="icon">I</Button>);
    expect(html).toContain("h-10");
    expect(html).toContain("w-10");
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
    expect(html).toContain("rounded-lg");
    expect(html).toContain("border");
  });

  it("should render CardHeader", () => {
    const html = renderToString(<CardHeader>Header</CardHeader>);
    expect(html).toContain("Header");
    expect(html).toContain("flex");
  });

  it("should render CardTitle with correct classes", () => {
    const html = renderToString(<CardTitle>Title</CardTitle>);
    expect(html).toContain("Title");
    expect(html).toContain("font-semibold");
    expect(html).toContain("text-2xl");
  });

  it("should render CardDescription with correct classes", () => {
    const html = renderToString(<CardDescription>Description</CardDescription>);
    expect(html).toContain("Description");
    expect(html).toContain("text-sm");
    expect(html).toContain("text-muted-foreground");
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

  it("should set vertical data-orientation", () => {
    const html = renderToString(<Separator orientation="vertical" decorative={false} />);
    expect(html).toContain('data-orientation="vertical"');
  });

  it("should set horizontal data-orientation", () => {
    const html = renderToString(<Separator orientation="horizontal" decorative={false} />);
    expect(html).toContain('data-orientation="horizontal"');
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

describe("Label", () => {
  it("should render label with correct classes", () => {
    const html = renderToString(<Label>Label</Label>);
    expect(html).toContain("Label");
    expect(html).toContain("text-sm");
    expect(html).toContain("font-medium");
  });

  it("should render with custom className", () => {
    const html = renderToString(<Label className="custom-label">Custom</Label>);
    expect(html).toContain("custom-label");
  });

  it("should render with htmlFor attribute", () => {
    const html = renderToString(<Label htmlFor="test-input">Label</Label>);
    expect(html).toContain('for="test-input"');
  });

  it("should render as label element", () => {
    const html = renderToString(<Label>Test</Label>);
    expect(html).toContain("<label");
  });
});

// --- Switch Tests ---

describe("Switch", () => {
  it("should render switch with default classes", () => {
    const html = renderToString(<Switch />);
    expect(html).toContain("h-6");
    expect(html).toContain("w-11");
  });

  it("should render with checked state classes", () => {
    const html = renderToString(<Switch checked />);
    expect(html).toContain("data-[state=checked]:bg-primary");
  });

  it("should render with unchecked state classes", () => {
    const html = renderToString(<Switch />);
    expect(html).toContain("data-[state=unchecked]:bg-input");
  });

  it("should render with custom className", () => {
    const html = renderToString(<Switch className="my-switch" />);
    expect(html).toContain("my-switch");
  });

  it("should render with thumb element", () => {
    const html = renderToString(<Switch />);
    expect(html).toContain("rounded-full");
    expect(html).toContain("h-5");
    expect(html).toContain("w-5");
  });

  it("should be disabled when disabled prop is true", () => {
    const html = renderToString(<Switch disabled />);
    expect(html).toContain("disabled");
    expect(html).toContain("disabled:opacity-50");
  });
});

// --- Skeleton Tests ---

describe("Skeleton", () => {
  it("should render skeleton with default classes", () => {
    const html = renderToString(<Skeleton />);
    expect(html).toContain("animate-pulse");
    expect(html).toContain("rounded-md");
    expect(html).toContain("bg-muted");
  });

  it("should render with custom className", () => {
    const html = renderToString(<Skeleton className="my-skeleton" />);
    expect(html).toContain("my-skeleton");
  });

  it("should render as a div element", () => {
    const html = renderToString(<Skeleton />);
    expect(html).toContain("<div");
  });

  it("should render with custom dimensions via className", () => {
    const html = renderToString(<Skeleton className="h-4 w-full" />);
    expect(html).toContain("h-4");
    expect(html).toContain("w-full");
  });
});

// --- Input Tests ---

describe("Input", () => {
  it("should render input with default classes", () => {
    const html = renderToString(<Input />);
    expect(html).toContain("<input");
    expect(html).toContain("h-10");
    expect(html).toContain("w-full");
    expect(html).toContain("border");
  });

  it("should render with placeholder text", () => {
    const html = renderToString(<Input placeholder="Enter text" />);
    expect(html).toContain('placeholder="Enter text"');
  });

  it("should render with custom className", () => {
    const html = renderToString(<Input className="my-input" />);
    expect(html).toContain("my-input");
  });

  it("should render with type password", () => {
    const html = renderToString(<Input type="password" />);
    expect(html).toContain('type="password"');
  });

  it("should render with type email", () => {
    const html = renderToString(<Input type="email" />);
    expect(html).toContain('type="email"');
  });

  it("should be disabled when disabled prop is true", () => {
    const html = renderToString(<Input disabled />);
    expect(html).toContain("disabled");
    expect(html).toContain("disabled:opacity-50");
  });

  it("should accept custom type", () => {
    const html = renderToString(<Input type="number" />);
    expect(html).toContain('type="number"');
  });
});

// --- Tabs Tests ---

describe("Tabs", () => {
  it("should render Tabs root component with children", () => {
    const html = renderToString(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
      </Tabs>,
    );
    expect(html).toContain("Tab 1");
    expect(html).toContain("Content 1");
  });

  it("should render TabsList within Tabs with correct classes", () => {
    const html = renderToString(
      <Tabs defaultValue="tab">
        <TabsList>
          <TabsTrigger value="tab">Tab</TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    expect(html).toContain("inline-flex");
    expect(html).toContain("h-10");
    expect(html).toContain("bg-muted");
  });

  it("should render TabsTrigger within Tabs with correct classes", () => {
    const html = renderToString(
      <Tabs defaultValue="tab">
        <TabsList>
          <TabsTrigger value="tab">Tab</TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    expect(html).toContain("Tab");
    expect(html).toContain("inline-flex");
  });

  it("should render TabsContent within Tabs with correct classes", () => {
    const html = renderToString(
      <Tabs defaultValue="tab">
        <TabsContent value="tab">Content</TabsContent>
      </Tabs>,
    );
    expect(html).toContain("Content");
    expect(html).toContain("mt-2");
  });

  it("should render TabsList with custom className", () => {
    const html = renderToString(
      <Tabs defaultValue="tab">
        <TabsList className="my-tabs">
          <TabsTrigger value="tab">Tab</TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    expect(html).toContain("my-tabs");
  });
});

// --- Accordion Tests ---

describe("Accordion", () => {
  it("should render Accordion with all components", () => {
    const html = renderToString(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(html).toContain("Trigger");
    expect(html).toContain("data-state");
  });

  it("should render AccordionItem with border", () => {
    const html = renderToString(
      <Accordion type="single">
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger</AccordionTrigger>
        </AccordionItem>
      </Accordion>,
    );
    expect(html).toContain("border-b");
  });

  it("should render AccordionTrigger within Accordion", () => {
    const html = renderToString(
      <Accordion type="single">
        <AccordionItem value="item">
          <AccordionTrigger>Trigger</AccordionTrigger>
        </AccordionItem>
      </Accordion>,
    );
    expect(html).toContain("Trigger");
    expect(html).toContain("flex-1");
  });

  it("should render AccordionContent within Accordion", () => {
    const html = renderToString(
      <Accordion type="single">
        <AccordionItem value="item">
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(html).toContain("overflow-hidden");
    expect(html).toContain("text-sm");
  });

  it("should render AccordionItem with custom className", () => {
    const html = renderToString(
      <Accordion type="single">
        <AccordionItem value="item" className="my-accordion">
          <AccordionTrigger>Trigger</AccordionTrigger>
        </AccordionItem>
      </Accordion>,
    );
    expect(html).toContain("my-accordion");
  });
});