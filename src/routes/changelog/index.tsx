/**
 * Changelog Page
 * Following Supabase changelog UI design: https://supabase.com/changelog
 */

import { createFileRoute } from "@tanstack/react-router";
import { changelogData, ChangelogEntry, ChangelogType } from "~/lib/changelog/data";
import { Header } from "~/components/header";
import { Footer } from "~/components/footer";
import { Badge } from "~/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

export const Route = createFileRoute("/changelog/")({
  component: ChangelogPage,
});

const typeLabels: Record<ChangelogType, { label: string; className: string }> = {
  feature: {
    label: "New",
    className: "bg-primary/10 text-primary border-primary/20",
  },
  fix: { label: "Fix", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  breaking: { label: "Breaking", className: "bg-red-500/10 text-red-500 border-red-500/20" },
  improvement: {
    label: "Improved",
    className: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  },
  docs: { label: "Docs", className: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
};

const typeBadgeVariant: Record<ChangelogType, "default" | "secondary" | "destructive" | "outline"> =
  {
    feature: "default",
    fix: "secondary",
    breaking: "destructive",
    improvement: "secondary",
    docs: "outline",
  };

function ChangelogBadge({ type }: { type: ChangelogType }) {
  return (
    <Badge variant={typeBadgeVariant[type]} className="shrink-0">
      {typeLabels[type].label}
    </Badge>
  );
}

function ChangelogEntryComponent({ entry }: { entry: ChangelogEntry }) {
  return (
    <Accordion type="single" collapsible defaultValue={entry.version}>
      <AccordionItem value={entry.version} className="border rounded-xl overflow-hidden">
        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50">
          <div className="flex items-center gap-4 text-left">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-foreground">{entry.version}</span>
            </div>
            <div className="hidden sm:block">
              <p className="font-medium text-foreground">{entry.title}</p>
              <p className="text-sm text-muted-foreground">{entry.releasedAt}</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-4">
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
        </AccordionContent>
      </AccordionItem>
    </Accordion>
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
          <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl font-bold text-foreground">{latestVersion.version}</span>
              <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">
                Latest
              </Badge>
            </div>
            <p className="text-foreground mb-2">{latestVersion.title}</p>
            <p className="text-sm text-muted-foreground">{latestVersion.releasedAt}</p>
          </div>

          {/* Changelog Entries */}
          <div className="space-y-4">
            {changelogData.map((entry) => (
              <ChangelogEntryComponent key={entry.version} entry={entry} />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}