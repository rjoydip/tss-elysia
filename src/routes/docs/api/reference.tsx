/**
 * API Reference
 * Following Supabase API docs UI design: https://supabase.com/docs/guides/api/sql-to-rest
 */

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { cn } from "~/lib/utils";

export const Route = createFileRoute("/docs/api/reference")({
  component: ApiReferencePage,
});

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const methodColors: Record<HttpMethod, { bg: string; text: string }> = {
  GET: { bg: "bg-blue-500/10", text: "text-blue-500" },
  POST: { bg: "bg-green-500/10", text: "text-green-500" },
  PUT: { bg: "bg-orange-500/10", text: "text-orange-500" },
  PATCH: { bg: "bg-purple-500/10", text: "text-purple-500" },
  DELETE: { bg: "bg-red-500/10", text: "text-red-500" },
};

interface ApiEndpoint {
  method: HttpMethod;
  path: string;
  description: string;
  parameters?: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
  response?: {
    status: number;
    body: string;
  };
}

const apiEndpoints: ApiEndpoint[] = [
  {
    method: "GET",
    path: "/api/health",
    description: "Check the health status of the API service",
    parameters: [],
    response: {
      status: 200,
      body: `{
  "status": "ok",
  "timestamp": "2026-03-28T12:00:00Z",
  "version": "1.0.0"
}`,
    },
  },
  {
    method: "GET",
    path: "/api/users",
    description: "Retrieve a list of all users",
    parameters: [
      { name: "page", type: "integer", required: false, description: "Page number for pagination" },
      { name: "limit", type: "integer", required: false, description: "Number of items per page" },
      { name: "search", type: "string", required: false, description: "Search by email or name" },
    ],
    response: {
      status: 200,
      body: `{
  "data": [
    {
      "id": "usr_123",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 100
}`,
    },
  },
  {
    method: "GET",
    path: "/api/users/:id",
    description: "Retrieve a single user by ID",
    parameters: [{ name: "id", type: "string", required: true, description: "The user ID" }],
    response: {
      status: 200,
      body: `{
  "id": "usr_123",
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2026-01-15T10:00:00Z"
}`,
    },
  },
  {
    method: "POST",
    path: "/api/users",
    description: "Create a new user",
    parameters: [
      { name: "email", type: "string", required: true, description: "User email address" },
      { name: "name", type: "string", required: true, description: "User display name" },
      { name: "password", type: "string", required: true, description: "User password" },
    ],
    response: {
      status: 201,
      body: `{
  "id": "usr_456",
  "email": "newuser@example.com",
  "name": "Jane Doe",
  "createdAt": "2026-03-28T12:00:00Z"
}`,
    },
  },
  {
    method: "PUT",
    path: "/api/users/:id",
    description: "Update an existing user",
    parameters: [
      { name: "id", type: "string", required: true, description: "The user ID" },
      { name: "name", type: "string", required: false, description: "New display name" },
    ],
    response: {
      status: 200,
      body: `{
  "id": "usr_123",
  "email": "user@example.com",
  "name": "Updated Name",
  "updatedAt": "2026-03-28T12:30:00Z"
}`,
    },
  },
  {
    method: "DELETE",
    path: "/api/users/:id",
    description: "Delete a user by ID",
    parameters: [{ name: "id", type: "string", required: true, description: "The user ID" }],
    response: {
      status: 204,
      body: "",
    },
  },
  {
    method: "GET",
    path: "/api/auth/health",
    description: "Check the health status of the authentication service",
    parameters: [],
    response: {
      status: 200,
      body: `{
  "status": "ok",
  "timestamp": "2026-03-28T12:00:00Z"
}`,
    },
  },
];

function MethodBadge({ method }: { method: HttpMethod }) {
  const colors = methodColors[method];
  return (
    <span className={cn("text-xs font-bold px-2 py-1 rounded", colors.bg, colors.text)}>
      {method}
    </span>
  );
}

function ApiEndpointCard({ endpoint }: { endpoint: ApiEndpoint }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left"
      >
        <MethodBadge method={endpoint.method} />
        <code className="flex-1 text-sm font-mono text-foreground">{endpoint.path}</code>
        <p className="hidden sm:block text-sm text-muted-foreground flex-1">
          {endpoint.description}
        </p>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn("transition-transform duration-200", expanded ? "rotate-180" : "")}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t bg-muted/20 p-6">
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-foreground mb-2">Description</h4>
            <p className="text-sm text-muted-foreground">{endpoint.description}</p>
          </div>

          {endpoint.parameters && endpoint.parameters.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-foreground mb-3">Parameters</h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium text-foreground">Name</th>
                      <th className="text-left px-4 py-2 font-medium text-foreground">Type</th>
                      <th className="text-left px-4 py-2 font-medium text-foreground">Required</th>
                      <th className="text-left px-4 py-2 font-medium text-foreground">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {endpoint.parameters.map((param) => (
                      <tr key={param.name} className="border-t">
                        <td className="px-4 py-2 font-mono text-brand">{param.name}</td>
                        <td className="px-4 py-2 text-muted-foreground">{param.type}</td>
                        <td className="px-4 py-2">
                          {param.required ? (
                            <span className="text-xs text-red-500 font-medium">Required</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Optional</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-muted-foreground">{param.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {endpoint.response && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Response</h4>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={cn(
                    "text-xs font-bold px-2 py-1 rounded",
                    endpoint.response.status >= 200 && endpoint.response.status < 300
                      ? "bg-green-500/10 text-green-500"
                      : "bg-red-500/10 text-red-500",
                  )}
                >
                  {endpoint.response.status}
                </span>
              </div>
              {endpoint.response.body && (
                <pre className="bg-[#0a0a0a] p-4 rounded-lg overflow-x-auto border">
                  <code className="text-xs font-mono text-brand">{endpoint.response.body}</code>
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ApiReferencePage() {
  const [activeTab, setActiveTab] = useState<"all" | "users" | "auth">("all");

  const filteredEndpoints = apiEndpoints.filter((endpoint) => {
    if (activeTab === "all") return true;
    if (activeTab === "users") return endpoint.path.includes("/users");
    if (activeTab === "auth") return endpoint.path.includes("/auth");
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight">API Reference</h1>
        <p className="text-xl text-muted-foreground">
          Complete reference for all API endpoints with parameters and responses
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-8 border-b">
        {(["all", "users", "auth"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === tab
                ? "border-brand text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab === "all" && "All Endpoints"}
            {tab === "users" && "Users API"}
            {tab === "auth" && "Auth API"}
          </button>
        ))}
      </div>

      {/* API Endpoints */}
      <div className="space-y-3">
        {filteredEndpoints.map((endpoint, index) => (
          <ApiEndpointCard
            key={`${endpoint.method}-${endpoint.path}-${index}`}
            endpoint={endpoint}
          />
        ))}
      </div>
    </div>
  );
}