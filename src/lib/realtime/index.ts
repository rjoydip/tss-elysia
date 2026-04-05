/**
 * Real-time module entry point.
 * Exports all real-time services and utilities for easy access.
 */

// Connection management
export {
  connectionStore,
  type ConnectionMetadata,
  type WebSocketConnection,
} from "./connection-store";

// Authentication
export { authenticateConnection, validateOrigin, withAuth, type AuthResult } from "./auth";

// Message schemas
export {
  messageSchema,
  baseMessageSchema,
  parseMessage,
  createErrorMessage,
  createPongMessage,
  type ValidMessage,
  type MessageType,
  type PingMessage,
  type PongMessage,
  type SubscribeMessage,
  type UnsubscribeMessage,
  type NotificationMessage,
  type PresenceMessage,
  type TypingMessage,
  type DashboardMessage,
  type ErrorMessage,
} from "./schemas";

// Content sanitization
export { sanitizeContent, stripHtml, validateContent, sanitizeMessage } from "./sanitizer";

// Authorization
export {
  authorize,
  hasPermission,
  getPermissions,
  getUserRole,
  createGuard,
  checkAuthorization,
  meetsRoleRequirement,
  type UserRole,
  type Permission,
} from "./authorization";

// Rate limiting
export {
  checkRateLimit,
  getRateLimitStatus,
  resetRateLimit,
  rateLimiter,
  defaultRateLimitConfig,
  type RateLimitConfig,
} from "./rate-limit";

// CSRF
export {
  validateCsrfToken,
  generateCsrfToken,
  csrfTokenStore,
  defaultCsrfConfig,
  type CsrfConfig,
} from "./csrf";

// Services
export {
  notificationService,
  type Notification,
  type NotificationType,
} from "./notification-service";
export { presenceService, type Presence, type PresenceStatus } from "./presence-service";
export {
  dashboardService,
  type DashboardUpdate,
  type DashboardResource,
  type DashboardAction,
} from "./dashboard-service";
export { chatService, type Reaction } from "./chat-service";

// Re-export types
export type { Context } from "elysia";