/**
 * Auth UI store.
 * Centralizes auth form submission/error state via TanStack Store.
 */

import { createStore, useStore } from "@tanstack/react-store";

/**
 * Supported auth form identifiers for centralized UI state.
 */
export type AuthFormKey = "login" | "register" | "forgotPassword";

/**
 * Per-form UI state model.
 */
interface AuthFormUiState {
  isSubmitting: boolean;
  submitErrorMessage: string | null;
}

/**
 * Full auth UI store shape.
 */
interface AuthUiStoreState {
  login: AuthFormUiState;
  register: AuthFormUiState;
  forgotPassword: AuthFormUiState;
}

/**
 * Builds the default state for a single auth form.
 */
function createDefaultFormState(): AuthFormUiState {
  return {
    isSubmitting: false,
    submitErrorMessage: null,
  };
}

/**
 * Shared auth UI store consumed by auth form components.
 */
export const authUiStore = createStore<AuthUiStoreState>({
  login: createDefaultFormState(),
  register: createDefaultFormState(),
  forgotPassword: createDefaultFormState(),
});

/**
 * Reactive hook for a single auth form state slice.
 *
 * @param form - Target form key
 * @returns Current state for the selected auth form
 */
export function useAuthFormState(form: AuthFormKey): AuthFormUiState {
  return useStore(authUiStore, (state) => state[form]);
}

/**
 * Sets submitting state for an auth form.
 *
 * @param form - Target form key
 * @param isSubmitting - Whether submit is currently in flight
 */
export function setAuthSubmitting(form: AuthFormKey, isSubmitting: boolean): void {
  authUiStore.setState((prev) => ({
    ...prev,
    [form]: {
      ...prev[form],
      isSubmitting,
    },
  }));
}

/**
 * Sets submit error message for an auth form.
 *
 * @param form - Target form key
 * @param message - Error message to display or null to clear
 */
export function setAuthSubmitError(form: AuthFormKey, message: string | null): void {
  authUiStore.setState((prev) => ({
    ...prev,
    [form]: {
      ...prev[form],
      submitErrorMessage: message,
    },
  }));
}

/**
 * Resets a single auth form state to defaults.
 *
 * @param form - Target form key
 */
export function resetAuthFormState(form: AuthFormKey): void {
  authUiStore.setState((prev) => ({
    ...prev,
    [form]: createDefaultFormState(),
  }));
}