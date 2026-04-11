/**
 * API Route Helpers for E2E Tests
 *
 * Provides utilities for making API calls using Playwright's page.request API
 * within a browser context (avoids context closing issues).
 */

import type { Page } from "@playwright/test";
import { E2E_BASE_URL } from "../_config";

const BASE_URL = E2E_BASE_URL;

/**
 * Type for API response returned by fetch helpers
 */
export interface ApiResult {
  status: number;
  body?: unknown;
  headers: Record<string, string>;
  text?: string;
}

/**
 * Generates a unique email address for test isolation.
 * @param prefix - Prefix for the email (default: "test")
 * @returns Unique email string
 */
export function uniqueEmail(prefix = "test"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

/**
 * Initializes the test by navigating to base URL.
 * This ensures the browser context is fully loaded.
 * @param page - Playwright page object
 */
export async function initPage(page: Page): Promise<void> {
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
}

/**
 * Makes a GET request using page.request API
 * @param page - Playwright page object
 * @param url - API endpoint path or full URL
 * @returns ApiResult with status, body, and headers
 */
export async function apiGet(page: Page, url: string): Promise<ApiResult> {
  const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;

  // Ensure page is initialized
  if (!page.isClosed()) {
    try {
      await page.evaluate(async (u) => {
        if (window.location.href === "about:blank" || !window.location.href.startsWith("http")) {
          await fetch(u, { method: "HEAD" });
        }
      }, fullUrl);
    } catch {
      // Ignore init errors
    }
  }

  const response = await page.request.get(fullUrl);

  let body = null;
  let text = "";
  try {
    body = await response.json();
  } catch {
    text = await response.text();
  }

  const headers: Record<string, string> = response.headers();

  return {
    status: response.status(),
    body,
    headers,
    text,
  };
}

/**
 * Makes a POST request using page.request API
 * @param page - Playwright page object
 * @param url - API endpoint path or full URL
 * @param data - Request body data
 * @param options - Optional fetch options (headers, etc.)
 * @returns ApiResult with status, body, and headers
 */
export async function apiPost(
  page: Page,
  url: string,
  data: Record<string, unknown>,
  options?: {
    headers?: Record<string, string>;
  },
): Promise<ApiResult> {
  const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;

  // Ensure page is initialized
  if (!page.isClosed()) {
    try {
      await page.evaluate(async (u) => {
        if (window.location.href === "about:blank" || !window.location.href.startsWith("http")) {
          await fetch(u, { method: "HEAD" });
        }
      }, fullUrl);
    } catch {
      // Ignore init errors
    }
  }

  const response = await page.request.post(fullUrl, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    data,
  });

  let body = null;
  let text = "";
  try {
    body = await response.json();
  } catch {
    text = await response.text();
  }

  const headers: Record<string, string> = response.headers();

  return {
    status: response.status(),
    body,
    headers,
    text,
  };
}

/**
 * Generic API fetch using page.request API
 * @param page - Playwright page object
 * @param url - API endpoint path or full URL
 * @param options - Fetch options (method, headers, postData, etc.)
 * @returns ApiResult with status, body, and headers
 */
export async function apiFetch(
  page: Page,
  url: string,
  options?: {
    method?: string;
    headers?: Record<string, string>;
    postData?: string | Record<string, unknown>;
  },
): Promise<ApiResult> {
  const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;

  // Ensure page is initialized
  if (!page.isClosed()) {
    try {
      await page.evaluate(async (u) => {
        if (window.location.href === "about:blank" || !window.location.href.startsWith("http")) {
          await fetch(u, { method: "HEAD" });
        }
      }, fullUrl);
    } catch {
      // Ignore init errors
    }
  }

  const method = options?.method || "GET";
  const headers = {
    ...(method === "POST" ? { "Content-Type": "application/json" } : {}),
    ...options?.headers,
  };

  const postData = options?.postData;

  const fetchOptions: Record<string, unknown> = { headers };
  if (method !== "GET") {
    fetchOptions.method = method;
  }
  if (postData) {
    fetchOptions.data = typeof postData === "string" ? postData : JSON.stringify(postData);
  }

  const response = await page.request.fetch(fullUrl, fetchOptions);

  let body = null;
  let text = "";
  try {
    body = await response.json();
  } catch {
    text = await response.text();
  }

  const respHeaders: Record<string, string> = response.headers();

  return {
    status: response.status(),
    body,
    headers: respHeaders,
    text,
  };
}

/**
 * Performs signup using page.request API
 * @param page - Playwright page object
 * @param email - User email
 * @param password - User password (default: "TestPassword123!")
 * @param name - User name (default: "Test User")
 * @returns ApiResult from signup
 */
export async function signUp(
  page: Page,
  email: string,
  password = "TestPassword123!",
  name = "Test User",
): Promise<ApiResult> {
  return apiPost(
    page,
    "/api/auth/sign-up/email",
    { email, password, name },
    { headers: { Origin: E2E_BASE_URL } },
  );
}

/**
 * Performs signin using page.request API
 * @param page - Playwright page object
 * @param email - User email
 * @param password - User password (default: "TestPassword123!")
 * @returns ApiResult from signin
 */
export async function signIn(
  page: Page,
  email: string,
  password = "TestPassword123!",
): Promise<ApiResult> {
  return apiPost(
    page,
    "/api/auth/sign-in/email",
    { email, password },
    { headers: { Origin: E2E_BASE_URL } },
  );
}

/**
 * Gets session using page.request API
 * @param page - Playwright page object
 * @returns ApiResult from get-session
 */
export async function getSession(page: Page): Promise<ApiResult> {
  return apiFetch(page, "/api/auth/get-session", {
    headers: { Origin: E2E_BASE_URL },
  });
}

/**
 * Signs out using page.request API
 * @param page - Playwright page object
 * @returns ApiResult from sign-out
 */
export async function signOut(page: Page): Promise<ApiResult> {
  return apiPost(page, "/api/auth/sign-out", {}, { headers: { Origin: E2E_BASE_URL } });
}

/**
 * Lists sessions using page.request API
 * @param page - Playwright page object
 * @returns ApiResult from list-sessions
 */
export async function listSessions(page: Page): Promise<ApiResult> {
  return apiFetch(page, "/api/auth/list-sessions", {
    headers: { Origin: E2E_BASE_URL },
  });
}