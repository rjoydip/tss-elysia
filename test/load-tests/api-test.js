import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 10 },
    { duration: "1m", target: 50 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"],
    http_req_failed: ["rate<0.01"],
  },
};

const HOST = __ENV.HOST || "localhost";
const PORT = __ENV.PORT || "3000";
const BASE_URL = __ENV.BASE_URL || `http://${HOST}:${PORT}`;

export default function () {
  const response = http.get(`${BASE_URL}/api/test`);

  check(response, {
    "status is 200": (r) => r.status === 200,
    "content-type is json": (r) => r.headers["Content-Type"]?.includes("application/json"),
    "has message": (r) => JSON.parse(r.body).message !== undefined,
  });

  sleep(1);
}
