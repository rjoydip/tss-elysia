const host = process.env.E2E_HOST || process.env.HOST || "localhost";
const port = process.env.E2E_PORT || process.env.PORT || "3000";

export const E2E_BASE_URL = process.env.E2E_BASE_URL || `http://${host}:${port}`;
export const E2E_HOST = host;
export const E2E_PORT = port;
export const E2E_AUTH_URL = process.env.BETTER_AUTH_URL || `${E2E_BASE_URL}/api/auth`;
