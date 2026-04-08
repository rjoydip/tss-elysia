/**
 * Unit tests for auth UI store state and actions.
 */

import { beforeEach, describe, expect, it } from "bun:test";
import {
  authUiStore,
  resetAuthFormState,
  setAuthSubmitError,
  setAuthSubmitting,
  type AuthFormKey,
} from "../../../src/lib/store/auth";

/**
 * Resets all auth form states for deterministic test isolation.
 */
function resetAllAuthForms(): void {
  const forms: AuthFormKey[] = ["login", "register", "forgotPassword"];
  for (const form of forms) {
    resetAuthFormState(form);
  }
}

describe("auth UI store", () => {
  beforeEach(() => {
    resetAllAuthForms();
  });

  it("should initialize all forms with non-submitting empty-error state", () => {
    expect(authUiStore.state.login.isSubmitting).toBe(false);
    expect(authUiStore.state.login.submitErrorMessage).toBeNull();

    expect(authUiStore.state.register.isSubmitting).toBe(false);
    expect(authUiStore.state.register.submitErrorMessage).toBeNull();

    expect(authUiStore.state.forgotPassword.isSubmitting).toBe(false);
    expect(authUiStore.state.forgotPassword.submitErrorMessage).toBeNull();
  });

  it("should update submitting state for only the targeted form", () => {
    setAuthSubmitting("register", true);

    expect(authUiStore.state.register.isSubmitting).toBe(true);
    expect(authUiStore.state.login.isSubmitting).toBe(false);
    expect(authUiStore.state.forgotPassword.isSubmitting).toBe(false);
  });

  it("should set and clear submit error for targeted form", () => {
    setAuthSubmitError("login", "Invalid credentials");
    expect(authUiStore.state.login.submitErrorMessage).toBe("Invalid credentials");

    setAuthSubmitError("login", null);
    expect(authUiStore.state.login.submitErrorMessage).toBeNull();
  });

  it("should reset only selected form state", () => {
    setAuthSubmitting("register", true);
    setAuthSubmitError("register", "Duplicate email");
    setAuthSubmitting("login", true);

    resetAuthFormState("register");

    expect(authUiStore.state.register.isSubmitting).toBe(false);
    expect(authUiStore.state.register.submitErrorMessage).toBeNull();
    expect(authUiStore.state.login.isSubmitting).toBe(true);
  });
});