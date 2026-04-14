import { createStore, useStore } from "@tanstack/react-store";
import { getCookie, setCookie, removeCookie } from "~/lib/cookies";

const ACCESS_TOKEN = "thisisjustarandomstring";

interface AuthUser {
  accountNo?: string;
  email?: string;
  role?: string[];
  exp?: number;
  name?: string;
  image?: string;
  createdAt?: string | Date;
  [key: string]: any;
}

interface SessionData {
  user: AuthUser | null;
  expiresAt: string | number | Date | null;
  id: string;
  token: string;
  ipAddress?: string;
  userAgent?: string;
  lastActivity?: string | number | Date;
  createdAt?: string | number | Date;
  updatedAt?: string | number | Date;
}

interface AuthState {
  user: AuthUser | null;
  session: SessionData | null;
  accessToken: string;
}

const cookieState = getCookie(ACCESS_TOKEN);
const initToken = cookieState ? JSON.parse(atob(cookieState)) : "";

let initUser: AuthUser | null = null;
if (cookieState) {
  try {
    const parsed = JSON.parse(cookieState);
    if (parsed && typeof parsed === "object" && "user" in parsed) {
      initUser = parsed.user || null;
    }
  } catch {
    initUser = null;
  }
}

export const authStore = createStore<AuthState>({
  user: initUser,
  session: null,
  accessToken: initToken,
});

export const authActions = {
  setUser: (user: AuthUser | null) => {
    authStore.setState((state) => ({ ...state, user }));
  },
  setSession: (session: SessionData | null) => {
    authStore.setState((state) => ({
      ...state,
      session,
      user: session?.user || null,
      accessToken: session?.token || "",
    }));
  },
  setAccessToken: (accessToken: string) => {
    const encrypted = btoa(JSON.stringify(accessToken));
    setCookie(ACCESS_TOKEN, encrypted);
    authStore.setState((state) => ({ ...state, accessToken }));
  },
  resetAccessToken: () => {
    removeCookie(ACCESS_TOKEN);
    authStore.setState((state) => ({ ...state, accessToken: "" }));
  },
  reset: () => {
    removeCookie(ACCESS_TOKEN);
    authStore.setState((state) => ({
      ...state,
      user: null,
      session: null,
      accessToken: "",
    }));
  },
};

export function useAuthStore<T = AuthState>(selector?: (state: AuthState) => T): T {
  return useStore(authStore, selector ?? ((state: AuthState) => state as unknown as T));
}