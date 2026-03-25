import { Elysia, type ElysiaConfig } from "elysia";
import { appConfig, logger } from "~/_config";
import { cors, helmet, rateLimitMiddleware } from "~/middlewares";

export const createApp = (config?: ElysiaConfig<any>) =>
  new Elysia({
    ...appConfig,
    ...config,
  })
    .use(cors)
    .use(helmet)
    .use(rateLimitMiddleware)
    .trace(async ({ onBeforeHandle, onAfterHandle, onError, onHandle, set }) => {
      onBeforeHandle(({ begin, onStop }) => {
        onStop(({ end }) => {
          const duration =
            typeof begin === "number" && typeof end === "number"
              ? (end - begin).toFixed(4)
              : "0.00";
          logger.debug(`BeforeHandle took ${duration} ms`);
        });
      });
      onAfterHandle(({ begin, onStop }) => {
        onStop(({ end }) => {
          const duration =
            typeof begin === "number" && typeof end === "number"
              ? (end - begin).toFixed(4)
              : "0.00";
          logger.debug(`AfterHandle took ${duration} ms`);
        });
      });
      onError(({ begin, onStop }) => {
        onStop(({ end, error }) => {
          const elapsed =
            typeof begin === "number" && typeof end === "number"
              ? (end - begin).toFixed(4)
              : "0.00";
          set.headers["X-Elapsed"] = elapsed;
          if (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error(`Error: ${errorMessage}, ${elapsed} ms`);
          }
        });
      });
      onHandle(({ onStop }) => {
        onStop(({ elapsed }) => {
          const elapsedTime = typeof elapsed === "number" ? elapsed.toFixed(4) : "0.00";
          set.headers["X-Elapsed"] = elapsedTime;
          logger.debug(`Request took: ${elapsedTime} ms`);
        });
      });
    })
    .onError(({ code, error }) => {
      const isProduction = typeof process !== "undefined" && process.env.NODE_ENV === "production";
      const errorMessage = isProduction
        ? "An unexpected error occurred"
        : error instanceof Error
          ? error.message
          : String(error);

      const responseBody =
        code === "NOT_FOUND"
          ? JSON.stringify({ error: "Endpoint not found" })
          : JSON.stringify({ error: errorMessage });

      return new Response(responseBody, {
        status: code === "NOT_FOUND" ? 404 : 500,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      });
    });
