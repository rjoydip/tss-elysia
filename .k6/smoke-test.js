import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 1,
  duration: "10s",
  thresholds: {
    http_req_failed: ["rate<0.01"],
  },
};

const HOST = __ENV.HOST || "localhost";
const PORT = __ENV.PORT || "3000";
const BASE_URL = __ENV.BASE_URL || `http://${HOST}:${PORT}`;

export default function () {
  const response = http.get(`${BASE_URL}/api`);

  check(response, {
    "status is 200": (r) => r.status === 200,
    "content-type is text": (r) => r.headers["Content-Type"]?.includes("text/plain"),
    "response has message": (r) => {
      return r.body && r.body.includes("Welcome to");
    },
  });

  sleep(1);
}