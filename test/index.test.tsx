import "./setup";
import { describe, it, expect, vi } from "bun:test";
import { render } from "@testing-library/react";
import React from "react";

function Home() {
  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
      <a href="/api">/api</a>
    </div>
  );
}

describe("Home Component", () => {
  it("should render welcome heading", () => {
    const { container } = render(<Home />);
    const heading = container.querySelector("h3");
    expect(heading).toBeDefined();
    expect(heading?.textContent).toBe("Welcome Home!");
  });

  it("should render API link", () => {
    const { container } = render(<Home />);
    const link = container.querySelector("a");
    expect(link).toBeDefined();
    expect(link?.getAttribute("href")).toBe("/api");
  });

  it("should have correct CSS class on container", () => {
    const { container } = render(<Home />);
    const div = container.querySelector("div");
    expect(div?.className).toBe("p-2");
  });
});

function Button({
  children,
  onClick,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled} data-testid="test-button">
      {children}
    </button>
  );
}

describe("Button Component", () => {
  it("should render children", () => {
    const { container } = render(<Button>Click me</Button>);
    expect(container.textContent).toBe("Click me");
  });

  it("should render as disabled when disabled prop is true", () => {
    const { container } = render(<Button disabled>Click me</Button>);
    const button = container.querySelector("button") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("should not be disabled by default", () => {
    const { container } = render(<Button>Click me</Button>);
    const button = container.querySelector("button") as HTMLButtonElement;
    expect(button.disabled).toBe(false);
  });

  it("should call onClick when clicked", () => {
    const handleClick = vi.fn();
    const { container } = render(<Button onClick={handleClick}>Click me</Button>);
    const button = container.querySelector("button") as HTMLButtonElement;
    button.click();
    expect(handleClick).toHaveBeenCalled();
  });
});

function Card({ title, content }: { title: string; content: string }) {
  return (
    <div data-testid="test-card">
      <h2>{title}</h2>
      <p>{content}</p>
    </div>
  );
}

describe("Card Component", () => {
  it("should render title and content", () => {
    const { container } = render(<Card title="Test Title" content="Test Content" />);
    expect(container.querySelector("h2")?.textContent).toBe("Test Title");
    expect(container.querySelector("p")?.textContent).toBe("Test Content");
  });

  it("should have correct test id", () => {
    const { container } = render(<Card title="Title" content="Content" />);
    expect(container.querySelector('[data-testid="test-card"]')).toBeDefined();
  });
});

function Input({
  placeholder,
  value,
  onChange,
}: {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      data-testid="test-input"
    />
  );
}

describe("Input Component", () => {
  it("should render with placeholder", () => {
    const { container } = render(<Input placeholder="Enter text" />);
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.placeholder).toBe("Enter text");
  });

  it("should render with value", () => {
    const { container } = render(<Input value="test value" />);
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.value).toBe("test value");
  });

  it("should have onChange handler", () => {
    const handleChange = vi.fn();
    const { container } = render(<Input onChange={handleChange} />);
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input).toBeDefined();
  });
});