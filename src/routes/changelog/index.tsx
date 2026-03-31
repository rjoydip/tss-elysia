/**
 * Changelog Page
 * Following Supabase changelog UI design: https://supabase.com/changelog
 */

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { cn } from "~/lib/utils";
import { changelogData, ChangelogEntry, ChangelogType } from "~/lib/changelog/data";
import { Header } from "~/components/header";
import { Footer } from "~/components/footer";

export const Route = createFileRoute("/changelog/")({
  component: ChangelogPage,
});

const typeLabels: Record<ChangelogType, { label: string; className: string }> = {
  feature: {
    label: "New",
    className: "bg-brand/10 text-brand border-brand/20",
  },
  fix: { label: "Fix", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  breaking: { label: "Breaking", className: "bg-red-500/10 text-red-500 border-red-500/20" },
  improvement: {
    label: "Improved",
    className: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  },
  docs: { label: "Docs", className: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
};

function ChangelogBadge({ type }: { type: ChangelogType }) {
  const config = typeLabels[type];
  return (
    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", config.className)}>
      {config.label}
    </span>
  );
}

function ChangelogEntryComponent({
  entry,
  isLatest,
}: {
  entry: ChangelogEntry;
  isLatest: boolean;
}) {
  const [expanded, setExpanded] = useState(isLatest);

  return (
    <div className="border rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-6 hover:bg-muted/50 transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-foreground">{entry.version}</span>
            {isLatest && (
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-brand text-black">
                Latest
              </span>
            )}
          </div>
          <div className="hidden sm:block">
            <p className="font-medium text-foreground">{entry.title}</p>
            <p className="text-sm text-muted-foreground">{entry.releasedAt}</p>
          </div>
        </div>
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
          className={cn("transition-transform duration-200", expanded ? "rotate-180" : "")}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t px-6 py-4 bg-muted/20">
          <div className="sm:hidden mb-4">
            <p className="font-medium text-foreground">{entry.title}</p>
            <p className="text-sm text-muted-foreground">{entry.releasedAt}</p>
          </div>
          <ul className="space-y-3">
            {entry.items.map((item) => (
              <li key={item.id} className="flex items-start gap-3">
                <ChangelogBadge type={item.type} />
                <span className="text-sm text-foreground">{item.description}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ChangelogPage() {
  const latestVersion = changelogData[0];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Main Content */}
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">Changelog</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Stay up to date with the latest improvements and bug fixes
            </p>
          </div>

          {/* Latest Version Banner */}
          <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-brand/10 to-brand-hover/5 border border-brand/20">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl font-bold text-foreground">{latestVersion.version}</span>
              <span className="text-sm font-semibold px-2 py-1 rounded-full bg-brand text-black">
                Latest
              </span>
            </div>
            <p className="text-foreground mb-2">{latestVersion.title}</p>
            <p className="text-sm text-muted-foreground">{latestVersion.releasedAt}</p>
          </div>

          {/* Changelog Entries */}
          <div className="space-y-4">
            {changelogData.map((entry, index) => (
              <ChangelogEntryComponent key={entry.version} entry={entry} isLatest={index === 0} />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}