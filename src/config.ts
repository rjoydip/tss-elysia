import { type ElysiaConfig } from "elysia";

export const API_PREFIX = import.meta.env.API_PREFIX ?? `/api`;
export const AUTH_PREFIX = "/auth/*";
export const API_NAME = import.meta.env.VITE_APP_NAME ?? "TSS ELYSIA";
export const HOST = import.meta.env.HOST || "localhost";
export const PORT = parseInt(import.meta.env.PORT || "3000", 10);
export const isBrowser = typeof window !== "undefined" && window.document !== undefined;
export const isServer = typeof window === "undefined";
export const isBun = typeof Bun !== "undefined";
export const isNode = typeof process !== "undefined" && !!process.versions?.node;
export const isProduction = isBun
  ? Bun.env.NODE_ENV === "production"
  : isNode
    ? process.env.NODE_ENV === "production"
    : false;
export const AUTH_ALLOWED_METHODS = ["GET", "POST", "PUT", "DELETE"];
export function log(message: string, level: "info" | "warn" | "error" = "info") {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  if (level === "error") {
    console.error(prefix, message);
  } else if (level === "warn") {
    console.warn(prefix, message);
  } else {
    console.log(prefix, message);
  }
}

export const logger = {
  info: (msg: string) => log(msg, "info"),
  warn: (msg: string) => log(msg, "warn"),
  error: (msg: string) => log(msg, "error"),
  debug: (msg: string) => {
    if (!isBrowser && process.env.NODE_ENV !== "production") {
      log(msg, "info");
    }
  },
};

export const appConfig: ElysiaConfig<any> = {
  normalize: true,
  prefix: "",
  nativeStaticResponse: true,
  websocket: {
    idleTimeout: 30,
  },
};

export const rateLimitConfig = {
  duration: 60_000,
  max: 100,
};

export const corsConfig = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["X-Request-Id", "X-Response-Time"],
  credentials: true,
  maxAge: 86400,
};

export const helmetConfig = {
  contentSecurityPolicy: true,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false,
  originAgentCluster: false,
  referrerPolicy: "strict-origin-when-cross-origin",
  strictTransportSecurity: false,
  xContentTypeOptions: true,
  xDnsPrefetchControl: false,
  xDownloadOptions: false,
  xFrameOptions: false,
  xPermittedCrossDomainPolicies: false,
  xPoweredBy: false,
  xXssProtection: false,
};
