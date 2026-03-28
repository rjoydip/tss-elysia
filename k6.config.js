export const options = {
  scenarios: {
    smoke: {
      executor: "constant-vus",
      vus: 1,
      duration: "10s",
    },
    load: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "30s", target: 10 },
        { duration: "1m", target: 50 },
        { duration: "30s", target: 0 },
      ],
    },
    stress: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "10s", target: 100 },
        { duration: "30s", target: 200 },
        { duration: "1m", target: 300 },
        { duration: "30s", target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
  },
};
