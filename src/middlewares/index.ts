import { Elysia, file } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { opentelemetry } from "@elysiajs/opentelemetry";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { API_NAME } from "~/config";
import { cors, corsWithCredentials } from "./cors";
import { helmet } from "./helmet";
import { rateLimitMiddleware } from "./rate-limit";

export type ComposedMiddlewareOptions = {
  openapi_name: string;
};

export const composedMiddleware = (
  { openapi_name }: ComposedMiddlewareOptions = {
    openapi_name: API_NAME,
  },
) =>
  new Elysia({ name: "composed-middleware" })
    .use(cors)
    .use(corsWithCredentials)
    .use(helmet)
    .use(
      openapi({
        documentation: {
          info: {
            title: `${openapi_name} API Documentation`,
            version: "v1",
          },
        },
      }),
    )
    .use(rateLimitMiddleware)
    .get("/favicon.ico", file("../../public/favicon.svg"))
    .use(
      opentelemetry({
        spanProcessors: [
          new BatchSpanProcessor(
            new OTLPTraceExporter({
              /* url: "https://api.axiom.co/v1/traces",
              headers: {
                Authorization: `Bearer ${process.env.AXIOM_TOKEN}`,
              }, */
            }),
          ),
        ],
      }),
    );
