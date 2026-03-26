import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "10s", target: 100 },
    { duration: "30s", target: 200 },
    { duration: "1m", target: 300 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<1000"],
    http_req_failed: ["rate<0.05"],
  },
};

const HOST = __ENV.HOST || "localhost";
const PORT = __ENV.PORT || "3000";
const BASE_URL = __ENV.BASE_URL || `http://${HOST}:${PORT}`;

export default function () {
  const response = http.get(`${BASE_URL}/api`);

  check(response, {
    "status is 200": (r) => r.status === 200,
    "response time < 1s": (r) => r.timings.duration < 1000,
  });

  sleep(0.5);
}
