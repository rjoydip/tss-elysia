import { t, getSchemaValidator, type TSchema } from "elysia";
import { isBun, isNode, isProduction, PORT } from "./config";

export interface EnvOptions {
  server?: Record<string, TSchema>;
  client?: Record<string, TSchema>;
  shared?: Record<string, TSchema>;
  emptyStringAsUndefined?: boolean;
  skipValidation?: boolean;
  extends?: Record<string, any>[];
  isServer?: boolean;
  onValidationError?: (errors: any) => never;
  onInvalidAccess?: (prop: string) => never;
  runtimeEnv?: () => Record<string, string | number | undefined>;
}

async function _createEnv(opts: EnvOptions) {
  const _runtimeEnv = typeof opts.runtimeEnv === "function" ? opts.runtimeEnv() : opts.runtimeEnv;
  const runtimeEnv = _runtimeEnv ?? (isBun ? Bun.env : isNode ? process.env : {});

  const emptyStringAsUndefined = opts.emptyStringAsUndefined ?? false;
  if (emptyStringAsUndefined) {
    for (const [key, value] of Object.entries(runtimeEnv)) {
      if (value === "") {
        delete runtimeEnv[key];
      }
    }
  }

  const skip = !!opts.skipValidation;
  if (skip) {
    if (opts.extends) {
      for (const preset of opts.extends) {
        preset.skipValidation = true;
      }
    }

    return runtimeEnv as any;
  }

  const _client = typeof opts.client === "object" ? opts.client : {};
  const _server = typeof opts.server === "object" ? opts.server : {};
  const _shared = typeof opts.shared === "object" ? opts.shared : {};
  const isServer = opts.isServer ?? typeof window === "undefined";

  const finalSchemaShape = isServer
    ? {
        ..._server,
        ..._shared,
        ..._client,
      }
    : {
        ..._client,
        ..._shared,
      };

  const schema = getSchemaValidator(t.Object(finalSchemaShape), runtimeEnv);

  if (!schema.Check) {
    const onValidationError =
      opts.onValidationError ??
      ((errors: any) => {
        console.error("Invalid environment variables:", errors);
        throw new Error("Invalid environment variables");
      });
    onValidationError(schema.Errors);
  }

  const onInvalidAccess =
    opts.onInvalidAccess ??
    ((prop: string) => {
      throw new Error(
        `Attempted to access a server-side environment variable "${prop}" on the client`,
      );
    });

  const isServerAccess = (prop: string) => {
    return !(prop in _client) && !(prop in _shared);
  };
  const isValidServerAccess = (prop: string) => {
    return isServer || !isServerAccess(prop);
  };
  const ignoreServerProp = (prop: string) => prop === "__esModule" || prop === "$$typeof";
  const ignoreClientProp = (prop: string) => prop === "then";

  const extendedObj = (opts.extends ?? []).reduce((acc: any, curr: any) => {
    return Object.assign(acc, curr);
  }, {});
  const fullObj = Object.assign(extendedObj, runtimeEnv);

  const env = new Proxy(fullObj, {
    get(target, prop) {
      if (typeof prop !== "string") return undefined;
      if (ignoreServerProp(prop)) return undefined;
      if (ignoreClientProp(prop)) return undefined;
      if (!isValidServerAccess(prop)) return onInvalidAccess(prop);
      return Reflect.get(target, prop);
    },
  });

  return env as Record<string, string | number | undefined>;
}

const _getEnv = (key: string, defaultValue: string = ""): string => {
  const value = isBun ? Bun.env[key] : isNode ? process.env?.[key] : undefined;
  return value ?? defaultValue;
};

const _BASE_URL = `http://localhost:${PORT}`;

function _getAuthSecret(): string {
  const secret = _getEnv("AUTH_SECRET", "");
  if (!secret) {
    if (isProduction) {
      throw new Error("AUTH_SECRET is required in production");
    }
    console.warn(
      "AUTH_SECRET not set, using random value (sessions will be invalidated on restart)",
    );
    return crypto.randomUUID();
  }
  return secret;
}

export const env = await _createEnv({
  client: {
    VITE_API_URL: t.String(),
  },
  server: {
    API_URL: t.String(),
    AUTH_SECRET: t.String(),
    DATABASE_URL: t.String(),
    PORT: t.Number(),
  },
  runtimeEnv: () => ({
    VITE_API_URL: _getEnv("VITE_API_URL", ""),
    API_URL: _getEnv("API_URL", `${_BASE_URL}/api`),
    AUTH_SECRET: _getAuthSecret(),
    DATABASE_URL: _getEnv("DATABASE_URL", ""),
    PORT: parseInt(_getEnv("PORT", String(PORT)), 10),
  }),
});

export type Env = ReturnType<typeof _createEnv>;
