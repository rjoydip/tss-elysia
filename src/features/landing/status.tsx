/**
 * Health Monitoring Dashboard
 * Shows service health status for all API endpoints.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import { Header } from "~/components/layout/landing/header";
import { Footer } from "~/components/layout/landing/footer";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Server,
  HardDrive,
  AudioLines,
} from "lucide-react";
import { AnimatedPageBackground } from "~/components/animated-page-background";
import {
  canTriggerManualRefresh,
  checkStatusHealth,
  getManualRefreshCooldownRemainingMs,
  refreshStatusHealth,
  statusServices,
  useStatusState,
} from "~/lib/stores/status";
import { logger } from "~/lib/logger";

interface PoolStatusInfo {
  name: string;
  role: "primary" | "replica";
  healthy: boolean;
  latencyMs?: number | null;
}

interface OtherStatus {
  name: string;
  status: "operational" | "degraded" | "outage" | "unknown";
  lastUpdated: string | null;
  tooltip: string;
  latencyMs?: number | null;
  pools?: PoolStatusInfo[];
  databaseType?: string;
  backend?: string;
}

export function HealthDashboard() {
  const { serviceStatuses, otherServiceStatuses, isRefreshing, lastRefreshSuccessful } =
    useStatusState();
  const [refreshUiTick, setRefreshUiTick] = useState(0);

  useEffect(() => {
    checkStatusHealth().catch((error) => {
      logger.error("Initial status refresh failed:", error);
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshUiTick((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const allLoading = useMemo(
    () =>
      serviceStatuses.every((service) => service.status === "loading") ||
      otherServiceStatuses.every((service) => service.status === "unknown"),
    [serviceStatuses, otherServiceStatuses],
  );
  const allUp = useMemo(
    () => serviceStatuses.length > 0 && serviceStatuses.every((service) => service.status === "up"),
    [serviceStatuses],
  );
  const someDown = useMemo(
    () => serviceStatuses.some((service) => service.status === "down"),
    [serviceStatuses],
  );
  const cooldownRemainingMs = useMemo(() => {
    void refreshUiTick;
    return getManualRefreshCooldownRemainingMs();
  }, [refreshUiTick, isRefreshing]);
  const canRefreshNow = useMemo(() => {
    void refreshUiTick;
    return canTriggerManualRefresh();
  }, [refreshUiTick, isRefreshing]);
  const refreshButtonLabel = useMemo(() => {
    if (isRefreshing) return "Refreshing now";
    if (cooldownRemainingMs > 0) {
      return `Wait ${Math.ceil(cooldownRemainingMs / 1000)}s`;
    }
    return "Refresh now";
  }, [isRefreshing, cooldownRemainingMs]);

  const handleRefreshControlClick = useCallback(() => {
    const triggered = refreshStatusHealth();
    if (!triggered) {
      setRefreshUiTick((prev) => prev + 1);
    }
  }, []);

  const refreshIndicatorClass = useMemo(() => {
    if (isRefreshing) return "text-primary animate-spin";
    if (lastRefreshSuccessful === true) return "text-green-600 dark:text-green-500 animate-pulse";
    if (lastRefreshSuccessful === false) return "text-destructive animate-pulse";
    return "text-yellow-500 animate-pulse";
  }, [isRefreshing, lastRefreshSuccessful]);

  const overallStatusLabel = useMemo(() => {
    if (allLoading) return "Checking service health...";
    if (allUp)
      return (
        <div className="flex text-xs px-3 align-center py-1 text-green-600 dark:text-green-500 hover:text-green-500/90 animate-pulse">
          <span>Operational</span>&nbsp;&nbsp;
          <AudioLines className="h-5 w-5" />
        </div>
      );
    if (someDown) return "Some services are degraded and need attention";
    return "Service health is currently unknown";
  }, [allLoading, allUp, someDown]);

  return (
    <div className="relative isolate min-h-screen bg-background">
      <AnimatedPageBackground />
      <Header />
      <div className="max-w-4xl mx-auto pt-24 pb-10 px-6">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">Health Monitor</h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Monitor the health status of all API services
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefreshControlClick}
                disabled={!canRefreshNow}
                title={refreshButtonLabel}
                aria-label={refreshButtonLabel}
                className="relative border-none transition-transform duration-300 hover:scale-110 hover:bg-transparent focus-visible:ring-0"
              >
                <RefreshCw className={cn("w-4 h-4 transition-colors", refreshIndicatorClass)} />
              </Button>
              <span
                className={cn(
                  "text-xs text-muted-foreground transition-all duration-300 animate-pulse",
                  isRefreshing && "animate-pulse text-primary",
                )}
              >
                {refreshButtonLabel}
              </span>
            </div>
          </div>
        </header>

        <div className="space-y-6">
          {/* Overall Status Card */}
          <Card>
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                {allLoading ? (
                  <AlertCircle className="w-8 h-8 text-yellow-500 animate-pulse" />
                ) : allUp ? (
                  <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-500" />
                ) : someDown ? (
                  <XCircle className="w-8 h-8 text-destructive" />
                ) : (
                  <HelpCircle className="w-8 h-8 text-muted-foreground" />
                )}
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Overall API Status</h2>
                  <p className="text-sm text-muted-foreground">
                    Combined health of all api services
                  </p>
                </div>
              </div>
              {overallStatusLabel}
            </div>
          </Card>

          {/* Service Status Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            {serviceStatuses.map((service) => (
              <Card key={service.name} className="hover:border-primary/30 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {service.status === "loading" || isRefreshing ? (
                        <AlertCircle className="w-5 h-5 text-yellow-500 animate-pulse" />
                      ) : service.status === "up" ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-destructive" />
                      )}
                      <h3 className="font-semibold text-foreground">{service.name}</h3>
                    </div>
                    {service.status === "up" && service.responseTime !== null && (
                      <span className="text-sm font-mono text-primary">
                        {service.responseTime}ms
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {statusServices.find((s) => s.name === service.name)?.description}
                  </p>
                  {service.status === "down" && service.error && (
                    <p className="text-sm text-destructive">{service.error}</p>
                  )}
                  {service.lastChecked && service.status !== "loading" && (
                    <p className="text-xs text-muted-foreground">
                      Last checked:{" "}
                      <span className="text-primary font-bold">
                        {service.lastChecked.toLocaleTimeString()}
                      </span>
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* External Services Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  Other Services
                </h2>
                <p className="text-muted-foreground mt-1">
                  Reference status from external service providers
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {otherServiceStatuses.map((service: OtherStatus) => {
                const displayType = service.databaseType || service.backend;
                const showBadge =
                  displayType &&
                  !(service.name === "Database" && service.databaseType === "sqlite");

                return (
                  <Card key={service.name}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base font-medium">{service.name}</CardTitle>
                          {showBadge && (
                            <Badge
                              variant="outline"
                              className="text-xs font-normal text-muted-foreground"
                            >
                              {service.name === "Database" && (
                                <HardDrive className="w-3 h-3 mr-1" />
                              )}
                              {service.name === "Redis" && <Server className="w-3 h-3 mr-1" />}
                              {displayType}
                            </Badge>
                          )}
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" aria-label={`${service.name} status info`}>
                                {service.status === "operational" ? (
                                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500" />
                                ) : service.status === "degraded" ? (
                                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                                ) : service.status === "outage" ? (
                                  <XCircle className="w-5 h-5 text-destructive" />
                                ) : (
                                  <HelpCircle className="w-5 h-5 text-yellow-500" />
                                )}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="whitespace-pre-wrap">
                              {service.tooltip}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      {service.pools && service.pools.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {service.pools.map((pool) => (
                            <Badge
                              key={pool.name}
                              variant={pool.healthy ? "default" : "destructive"}
                              className={cn(
                                "text-xs font-normal",
                                pool.role === "replica" &&
                                  "bg-purple-500 text-purple-600 dark:text-purple-400",
                                !pool.healthy && "opacity-60",
                              )}
                            >
                              <Server className="w-3 h-3 mr-1" />
                              {pool.name}
                              {pool.latencyMs != null && (
                                <span className="ml-1 opacity-70">{pool.latencyMs}ms</span>
                              )}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground capitalize">
                        {service.status === "unknown" ? "upcoming" : service.status}
                        {service.latencyMs != null && (
                          <span className="ml-2 font-mono text-xs lowercase">
                            ({service.latencyMs}ms)
                          </span>
                        )}
                      </p>
                      {service.lastUpdated && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Last checked:{" "}
                          <span className="text-primary font-bold">
                            {new Date(service.lastUpdated).toLocaleTimeString()}
                          </span>
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}