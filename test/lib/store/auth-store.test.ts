import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import { authStore, authActions } from "../../../src/lib/stores/auth-store";

describe("Auth Store", () => {
  beforeEach(() => {
    authActions.reset();
  });

  afterEach(() => {
    authActions.reset();
  });

  describe("Initial State", () => {
    it("should have null user initially", () => {
      expect(authStore.get().user).toBeNull();
    });

    it("should have empty accessToken initially", () => {
      expect(authStore.get().accessToken).toBe("");
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

      authActions.setUser(testUser);
      expect(authStore.get().user).toEqual(testUser);
    });

    it("should allow setting user to null", () => {
      authActions.setUser(null);
      expect(authStore.get().user).toBeNull();
    });
  });

  describe("setAccessToken", () => {
    it("should set access token correctly", () => {
      authActions.setAccessToken("token123");
      expect(authStore.get().accessToken).toBe("token123");
    });
  });

  describe("resetAccessToken", () => {
    it("should reset access token to empty string", () => {
      authActions.setAccessToken("token123");
      authActions.resetAccessToken();
      expect(authStore.get().accessToken).toBe("");
    });
  });

  describe("reset", () => {
    it("should reset both user and accessToken", () => {
      authActions.reset();
      expect(authStore.get().user).toBeNull();
      expect(authStore.get().accessToken).toBe("");
    });
  });

  describe("AuthUser interface", () => {
    it("should handle user with multiple roles", () => {
      const adminUser = {
        accountNo: "12345",
        email: "test@example.com",
        role: ["user", "admin", "moderator"],
        exp: Date.now() + 3600000,
      };

      authActions.setUser(adminUser);
      expect(authStore.get().user?.role).toHaveLength(3);
      expect(authStore.get().user?.role).toContain("admin");
    });

    it("should handle expired user session", () => {
      const expiredUser = {
        accountNo: "12345",
        email: "test@example.com",
        role: ["user"],
        exp: Date.now() - 3600000, // expired
      };

      authActions.setUser(expiredUser);
      expect(authStore.get().user?.exp).toBeLessThan(Date.now());
    });
  });
});

describe("Auth Store Selectors", () => {
  it("should select user from state", () => {
    const testUser = {
      accountNo: "12345",
      email: "test@example.com",
      role: ["user"],
      exp: Date.now() + 3600000,
    };
    authActions.setUser(testUser);

    const user = authStore.get().user;
    expect(user?.email).toBe("test@example.com");
  });

  it("should select accessToken from state", () => {
    authActions.setAccessToken("secret-token");

    const token = authStore.get().accessToken;
    expect(token).toBe("secret-token");
  });
});