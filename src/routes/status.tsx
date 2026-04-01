/**
 * Health Monitoring Dashboard
 * Shows service health status for all API endpoints
 * Following Supabase-style UI design
 */

import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { cn } from "~/lib/utils";
import { Header } from "~/components/header";
import { Footer } from "~/components/footer";

export const Route = createFileRoute("/status")({
  component: HealthDashboard,
});

interface HealthStatus {
  name: string;
  status: "loading" | "up" | "down";
  responseTime: number | null;
  lastChecked: Date | null;
  error?: string;
}

const services = [
  {
    name: "Core API",
    url: "/api/health",
    description: "Main API health check",
  },
  {
    name: "Auth API",
    url: "/api/auth/health",
    description: "Authentication service health",
  },
];

interface OtherStatus {
  name: string;
  status: "operational" | "degraded" | "outage" | "unknown";
  lastUpdated: string | null;
}

const otherServices: OtherStatus[] = [
  { name: "Database", status: "unknown", lastUpdated: null },
  { name: "Storage", status: "unknown", lastUpdated: null },
  { name: "Realtime", status: "unknown", lastUpdated: null },
];

function HealthDashboard() {
  const [serviceStatuses, setServiceStatuses] = useState<HealthStatus[]>(
    services.map((s) => ({
      name: s.name,
      status: "loading",
      responseTime: null,
      lastChecked: null,
    })),
  );
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);

  const checkHealth = async () => {
    const results = await Promise.all(
      services.map(async (service) => {
        const startTime = Date.now();
        try {
          const response = await fetch(service.url, {
            method: "GET",
            headers: { Origin: window.location.origin },
          });
          const responseTime = Date.now() - startTime;
          return {
            name: service.name,
            status: response.ok ? ("up" as const) : ("down" as const),
            responseTime,
            lastChecked: new Date(),
            error: response.ok ? undefined : `HTTP ${response.status}`,
          };
        } catch {
          return {
            name: service.name,
            status: "down" as const,
            responseTime: null,
            lastChecked: new Date(),
            error: "Connection failed",
          };
        }
      }),
    );
    setServiceStatuses(results);
  };

  useEffect(() => {
    checkHealth();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      checkHealth();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const allUp = serviceStatuses.every((s) => s.status === "up");
  const someDown = serviceStatuses.some((s) => s.status === "down");

  return (
    <div className="min-h-screen bg-background">
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
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="auto-refresh" className="text-sm text-muted-foreground">
                  Auto-refresh:
                </Label>
                <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
              </div>
              {autoRefresh && (
                <Select
                  value={String(refreshInterval)}
                  onValueChange={(val) => setRefreshInterval(Number(val))}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10s</SelectItem>
                    <SelectItem value="30">30s</SelectItem>
                    <SelectItem value="60">60s</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </header>

        <div className="space-y-6">
          {/* Overall Status Card */}
          <Card>
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "w-4 h-4 rounded-full",
                    serviceStatuses.every((s) => s.status === "loading") &&
                      "bg-yellow-500 animate-pulse",
                    allUp && autoRefresh ? "bg-success" : "bg-primary",
                    someDown && "bg-red-500",
                  )}
                />
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Overall Status</h2>
                  <p className="text-sm text-muted-foreground">Combined health of all services</p>
                </div>
              </div>
              <Badge
                variant={allUp ? "default" : someDown ? "destructive" : "secondary"}
                className={cn(
                  "text-sm px-3 py-1",
                  allUp && "bg-primary text-primary-foreground hover:bg-primary/90",
                )}
              >
                {serviceStatuses.every((s) => s.status === "loading")
                  ? "Checking..."
                  : allUp
                    ? "All Systems Operational"
                    : someDown
                      ? "Degraded"
                      : "Unknown"}
              </Badge>
            </div>
          </Card>

          {/* Service Status Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            {serviceStatuses.map((service) => (
              <Card key={service.name} className="hover:border-primary/30 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          service.status === "loading" && "bg-yellow-500 animate-pulse",
                          service.status === "up" && autoRefresh ? "bg-success" : "bg-primary",
                          service.status === "down" && "bg-red-500",
                        )}
                      />
                      <h3 className="font-semibold text-foreground">{service.name}</h3>
                    </div>
                    {service.status === "up" && service.responseTime && (
                      <span className="text-sm font-mono text-primary">
                        {service.responseTime}ms
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {services.find((s) => s.name === service.name)?.description}
                  </p>
                  {service.status === "down" && service.error && (
                    <p className="text-sm text-red-500">{service.error}</p>
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

          <Separator className="my-8" />

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

            <Card>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
                {otherServices.map((service) => (
                  <div key={service.name} className="bg-background p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">{service.name}</span>
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full",
                          service.status === "operational" && "bg-primary",
                          service.status === "degraded" && "bg-yellow-500",
                          service.status === "outage" && "bg-red-500",
                          service.status === "unknown" && "bg-muted-foreground",
                        )}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground capitalize">{service.status}</p>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}