/**
 * Session Settings Component
 * Displays and manages active user sessions.
 * Allows revoking specific sessions or all other sessions.
 */

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { listSessions, revokeSession, revokeOtherSessions, useSession } from "~/lib/auth/client";

/**
 * Session data structure from Better Auth.
 * Contains session metadata for display.
 */
interface SessionData {
  id: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
  userId: string;
}

/**
 * SessionSettings component for managing active sessions.
 * Displays list of sessions with revoke functionality.
 *
 * @example
 * <SessionSettings />
 */
export function SessionSettings() {
  const { data: currentSession } = useSession();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [isRevokingAll, setIsRevokingAll] = useState(false);

  /**
   * Fetch sessions on component mount.
   */
  useEffect(() => {
    fetchSessions();
  }, []);

  /**
   * Fetch all active sessions for the current user.
   */
  const fetchSessions = async () => {
    setIsLoading(true);

    try {
      const { data, error: fetchError } = await listSessions();

      if (fetchError) {
        toast.error(fetchError.message || "Failed to fetch sessions");
        setIsLoading(false);
        return;
      }

      setSessions(data || []);
      setIsLoading(false);
      // oxlint-disable-next-line no-unused-vars
    } catch (_err) {
      toast.error("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  /**
   * Revoke a specific session by token.
   * Updates the session list after revocation.
   */
  const handleRevokeSession = async (token: string) => {
    setRevokingId(token);

    try {
      const { error: revokeError } = await revokeSession(token);

      if (revokeError) {
        toast.error(revokeError.message || "Failed to revoke session");
        setRevokingId(null);
        return;
      }

      // Remove revoked session from list
      setSessions((prev) => prev.filter((s) => s.token !== token));
      setRevokingId(null);
      toast.success("Session revoked successfully");
      // oxlint-disable-next-line no-unused-vars
    } catch (_err) {
      toast.error("An unexpected error occurred");
      setRevokingId(null);
    }
  };

  /**
   * Revoke all sessions except the current one.
   * Forces re-authentication on all other devices.
   */
  const handleRevokeAllOther = async () => {
    setIsRevokingAll(true);

    try {
      const { error: revokeError } = await revokeOtherSessions();

      if (revokeError) {
        toast.error(revokeError.message || "Failed to revoke sessions");
        setIsRevokingAll(false);
        return;
      }

      // Refresh session list
      await fetchSessions();
      setIsRevokingAll(false);
      toast.success("All other sessions revoked successfully");
      // oxlint-disable-next-line no-unused-vars
    } catch (_err) {
      toast.error("An unexpected error occurred");
      setIsRevokingAll(false);
    }
  };

  /**
   * Parse user agent string to extract browser and OS info.
   * Simplified parser for display purposes.
   */
  const parseUserAgent = (userAgent?: string | null): string => {
    if (!userAgent) return "Unknown device";

    // Extract browser name
    const browserMatch = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)\/?\s*(\d+)?/i);
    const browser = browserMatch ? browserMatch[1] : "Unknown browser";

    // Extract OS
    const osMatch = userAgent.match(/(Windows|Mac OS|Linux|Android|iOS)[^;)]*/i);
    const os = osMatch ? osMatch[1] : "Unknown OS";

    return `${browser} on ${os}`;
  };

  /**
   * Check if a session is the current session.
   */
  const isCurrentSession = (session: SessionData): boolean => {
    return session.token === currentSession?.session?.token;
  };

  /**
   * Format date for display.
   */
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Sessions list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>Manage your active sessions across devices</CardDescription>
            </div>
            <Button variant="outline" onClick={fetchSessions} disabled={isLoading}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Loading state */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No active sessions found</p>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-4">
                    {/* Device icon */}
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary"
                      >
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                        <line x1="8" y1="21" x2="16" y2="21" />
                        <line x1="12" y1="17" x2="12" y2="21" />
                      </svg>
                    </div>

                    {/* Session info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">
                          {parseUserAgent(session.userAgent)}
                        </p>
                        {isCurrentSession(session) && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {session.ipAddress || "Unknown IP"} • Last active:{" "}
                        {formatDate(session.updatedAt)}
                      </p>
                    </div>
                  </div>

                  {/* Revoke button */}
                  {!isCurrentSession(session) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevokeSession(session.token)}
                      disabled={revokingId === session.token}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      {revokingId === session.token ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        "Revoke"
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revoke all other sessions */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Revoke Other Sessions</CardTitle>
          <CardDescription>
            Sign out from all other devices. Your current session will remain active.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={handleRevokeAllOther}
            disabled={isRevokingAll || sessions.length <= 1}
          >
            {isRevokingAll ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Revoking sessions...
              </>
            ) : (
              "Revoke All Other Sessions"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}