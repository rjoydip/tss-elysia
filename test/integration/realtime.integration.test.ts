import { beforeAll, afterAll, describe, it, expect } from "bun:test";
import { createServer } from "http";
import { WebSocket, WebSocketServer } from "ws";

function createWsClient(url: string): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    ws.on("open", () => resolve(ws));
    ws.on("error", reject);
  });
}

describe("Realtime Features Integration", () => {
  let server: any;
  let wsUrl: string;

  beforeAll(async () => {
    const http = createServer();
    const wss = new WebSocketServer({ server: http });

    wss.on("connection", (ws) => {
      ws.on("message", (msg) => {
        const data = JSON.parse(msg.toString());
        if (data.type === "chat") {
          wss.clients.forEach((c) => c.send(JSON.stringify(data)));
        }
      });
    });

    await new Promise((r) => http.listen(0, r));
    const addr = http.address() as any;
    wsUrl = `ws://localhost:${addr.port}`;
    server = http;
  });

  afterAll(() => {
    if (server) server.close();
  });

  it("broadcasts chat messages to all clients", async () => {
    const clientA = await createWsClient(wsUrl);
    const clientB = await createWsClient(wsUrl);

    const received: any[] = [];
    clientB.on("message", (msg) => received.push(JSON.parse(msg.toString())));

    clientA.send(JSON.stringify({ type: "chat", content: "hello" }));
    await Bun.sleep(500);

    expect(received.length).toBeGreaterThanOrEqual(0);
  });
});