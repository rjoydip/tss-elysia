/**
 * Unit tests for auth-store.
 * Tests authentication state management using Zustand.
 */

import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import { useAuthStore } from "../../../src/lib/stores/auth-store";

describe("Auth Store", () => {
  beforeEach(() => {
    useAuthStore.getState().auth.reset();
  });

  afterEach(() => {
    useAuthStore.getState().auth.reset();
  });

  describe("Initial State", () => {
    it("should have null user initially", () => {
      expect(useAuthStore.getState().auth.user).toBeNull();
    });

    it("should have empty accessToken initially", () => {
      expect(useAuthStore.getState().auth.accessToken).toBe("");
    });
  });

  describe("setUser", () => {
    it("should set user correctly", () => {
      const testUser = {
        accountNo: "12345",
        email: "test@example.com",
        role: ["user"],
        exp: Date.now() + 3600000,
      };

      useAuthStore.getState().auth.setUser(testUser);
      expect(useAuthStore.getState().auth.user).toEqual(testUser);
    });

    it("should allow setting user to null", () => {
      useAuthStore.getState().auth.setUser(null);
      expect(useAuthStore.getState().auth.user).toBeNull();
    });
  });

  describe("setAccessToken", () => {
    it("should set access token correctly", () => {
      useAuthStore.getState().auth.setAccessToken("token123");
      expect(useAuthStore.getState().auth.accessToken).toBe("token123");
    });
  });

  describe("resetAccessToken", () => {
    it("should reset access token to empty string", () => {
      useAuthStore.getState().auth.setAccessToken("token123");
      useAuthStore.getState().auth.resetAccessToken();
      expect(useAuthStore.getState().auth.accessToken).toBe("");
    });
  });

  describe("reset", () => {
    it("should reset both user and accessToken", () => {
      const testUser = {
        accountNo: "12345",
        email: "test@example.com",
        role: ["user"],
        exp: Date.now() + 3600000,
      };

      useAuthStore.getState().auth.setUser(testUser);
      useAuthStore.getState().auth.setAccessToken("token123");

      useAuthStore.getState().auth.reset();

      expect(useAuthStore.getState().auth.user).toBeNull();
      expect(useAuthStore.getState().auth.accessToken).toBe("");
    });
  });

  describe("AuthUser interface", () => {
    it("should handle user with multiple roles", () => {
      const adminUser = {
        accountNo: "12345",
        email: "admin@example.com",
        role: ["user", "admin", "moderator"],
        exp: Date.now() + 3600000,
      };

      useAuthStore.getState().auth.setUser(adminUser);
      expect(useAuthStore.getState().auth.user?.role).toHaveLength(3);
      expect(useAuthStore.getState().auth.user?.role).toContain("admin");
    });

    it("should handle expired user session", () => {
      const expiredUser = {
        accountNo: "12345",
        email: "test@example.com",
        role: ["user"],
        exp: Date.now() - 3600000, // expired
      };

      useAuthStore.getState().auth.setUser(expiredUser);
      expect(useAuthStore.getState().auth.user?.exp).toBeLessThan(Date.now());
    });
  });
});

describe("Auth Store Selectors", () => {
  beforeEach(() => {
    useAuthStore.getState().auth.reset();
  });

  afterEach(() => {
    useAuthStore.getState().auth.reset();
  });

  it("should select user from state", () => {
    const testUser = {
      accountNo: "12345",
      email: "test@example.com",
      role: ["user"],
      exp: Date.now() + 3600000,
    };
    useAuthStore.getState().auth.setUser(testUser);

    const user = useAuthStore.getState().auth.user;
    expect(user?.email).toBe("test@example.com");
  });

  it("should select accessToken from state", () => {
    useAuthStore.getState().auth.setAccessToken("secret-token");

    const token = useAuthStore.getState().auth.accessToken;
    expect(token).toBe("secret-token");
  });
});