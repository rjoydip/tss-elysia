import { JSDOM } from "jsdom";

const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
  url: "http://localhost",
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
// globalThis.documentElement = dom.window.documentElement;
globalThis.getComputedStyle = dom.window.getComputedStyle;
// globalThis.getBoundingClientRect = dom.window.getBoundingClientRect;
globalThis.matchMedia = dom.window.matchMedia;
globalThis.dispatchEvent = (event: Event) => dom.window.dispatchEvent(event);
globalThis.requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(cb, 16);
globalThis.cancelAnimationFrame = (id: number) => clearTimeout(id);
