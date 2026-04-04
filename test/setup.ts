import { JSDOM } from "jsdom";
import { HOST, isBrowser, PORT } from "../src/config";

// Mock localStorage for tests
const localStorageMock: Storage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    length: 0,
    key: (index: number) => {
      const keys = Object.keys(store);
      return index >= 0 && index < keys.length ? keys[index] : null;
    },
  };
})();

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

const url =
  import.meta.env.VITE_API_URL || (isBrowser ? window.location.origin : `http://${HOST}:${PORT}`);

const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
  url,
});

globalThis.document = dom.window.document;
globalThis.window = dom.window as any;
globalThis.navigator = dom.window.navigator;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.Element = dom.window.Element;
globalThis.Node = dom.window.Node;
globalThis.Text = dom.window.Text;
globalThis.Comment = dom.window.Comment;
globalThis.DocumentFragment = dom.window.DocumentFragment;
globalThis.CustomEvent = dom.window.CustomEvent;
globalThis.Event = dom.window.Event;
globalThis.MouseEvent = dom.window.MouseEvent;
globalThis.KeyboardEvent = dom.window.KeyboardEvent;
globalThis.InputEvent = dom.window.InputEvent;
globalThis.HTMLCanvasElement = dom.window.HTMLCanvasElement;
globalThis.getComputedStyle = dom.window.getComputedStyle;
globalThis.matchMedia = dom.window.matchMedia;
globalThis.dispatchEvent = (event: Event) => dom.window.dispatchEvent(event);
globalThis.requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(cb, 16);
globalThis.cancelAnimationFrame = (id: number) => clearTimeout(id);