/**
 * Terms of Service Page
 * Simple, clean layout for legal terms with premium typography.
 */

import { createFileRoute } from "@tanstack/react-router";
import { Header } from "~/components/header";
import { Footer } from "~/components/footer";
import { AnimatedPageBackground } from "~/components/background/animated-page-background";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="relative isolate min-h-screen bg-background">
      <AnimatedPageBackground />
      <Header />

      <main className="pt-32 pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground tracking-tight">
              Terms of Service
            </h1>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-foreground/80 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Introduction</h2>
              <p>
                Welcome to TSS Elysia. By accessing or using our platform, you agree to be bound by
                these Terms of Service. If you do not agree with any part of these terms, you may
                not access the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">2. Use of Service</h2>
              <p>
                Our platform provides tools for building and managing modern TypeScript
                applications. You are responsible for maintaining the security of your account and
                all activities that occur under your account.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You must provide accurate information when creating an account.</li>
                <li>You may not use the service for any illegal or unauthorized purpose.</li>
                <li>
                  You must not attempt to disrupt or interfere with the security or performance of
                  the service.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">3. Intellectual Property</h2>
              <p>
                The service and its original content, features, and functionality are and will
                remain the exclusive property of TSS Elysia and its licensors. Our trademarks and
                trade dress may not be used in connection with any product or service without our
                prior written consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">4. Termination</h2>
              <p>
                We may terminate or suspend your account and bar access to the service immediately,
                without prior notice or liability, under our sole discretion, for any reason
                whatsoever and without limitation, including but not limited to a breach of the
                Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                5. Limitation of Liability
              </h2>
              <p>
                In no event shall TSS Elysia, nor its directors, employees, partners, agents,
                suppliers, or affiliates, be liable for any indirect, incidental, special,
                consequential or punitive damages, including without limitation, loss of profits,
                data, use, goodwill, or other intangible losses.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">6. Changes to Terms</h2>
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at
                any time. We will provide at least 30 days notice prior to any new terms taking
                effect. What constitutes a material change will be determined at our sole
                discretion.
              </p>
            </section>

            <section className="pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground">
                If you have any questions about these Terms, please contact us at
                support@tss-elysia.com.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}