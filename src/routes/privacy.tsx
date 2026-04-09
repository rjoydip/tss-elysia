/**
 * Privacy Policy Page
 * Simple, clean layout for privacy policy with premium typography.
 */

import { createFileRoute } from "@tanstack/react-router";
import { Header } from "~/components/header";
import { Footer } from "~/components/footer";
import { AnimatedPageBackground } from "~/components/background/animated-page-background";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="relative isolate min-h-screen bg-background">
      <AnimatedPageBackground />
      <Header />

      <main className="pt-32 pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground tracking-tight">
              Privacy Policy
            </h1>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-foreground/80 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Information We Collect</h2>
              <p>
                We collect information that you participate in the TSS Elysia platform, including
                when you create an account, build applications, or contact support. This may
                include:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Personal identifiers (name, email address).</li>
                <li>Authentication credentials managed via Better Auth.</li>
                <li>Usage data and analytics to improve our service.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                2. How We Use Your Information
              </h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide, operate, and maintain our service.</li>
                <li>Improve, personalize, and expand our platform features.</li>
                <li>Understand and analyze how you use our service.</li>
                <li>Communicate with you regarding updates and support.</li>
                <li>Prevent fraudulent activity and ensure security.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">3. Data Sharing</h2>
              <p>
                We do not sell your personal data. We may share information with third-party service
                providers who perform services for us, such as authentication providers or cloud
                infrastructure, but only as necessary to provide the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">4. Data Security</h2>
              <p>
                We prioritize the security of your data. We use industry-standard security measures,
                including encryption and secure authentication protocols, to protect your personal
                information from unauthorized access or disclosure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">5. Your Choices</h2>
              <p>
                You have the right to access, update, or delete your personal information at any
                time. You can manage your account settings and profile information directly within
                the application.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">6. Cookies</h2>
              <p>
                We use cookies and similar tracking technologies to track activity on our service
                and hold certain information. You can instruct your browser to refuse all cookies or
                to indicate when a cookie is being sent.
              </p>
            </section>

            <section className="pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground">
                If you have any questions about this Privacy Policy, please contact us at
                privacy@tss-elysia.com.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}