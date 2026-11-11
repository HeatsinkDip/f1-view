import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How F1 View handles telemetry requests, local theme preferences, and optional FastF1 session authentication.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-16">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to F1 View
        </Link>

        <header className="space-y-3 border-b border-border pb-6">
          <h1 className="text-4xl font-black tracking-tight uppercase italic">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Transparency on how F1 View processes telemetry requests and user preferences.
          </p>
        </header>

        <section className="space-y-6 text-muted-foreground leading-relaxed">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">1. Telemetry & Public Data</h2>
            <p>
              F1 View retrieves public Formula 1 timing, race schedules, weather, tyre stint, and driver standings data through FastF1, OpenF1, and Jolpica APIs. Browsing race analytics does not require creating an account.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">2. Local Preferences</h2>
            <p>
              Light and dark theme selections are stored locally in your browser using standard storage so your preferred theme persists across visits.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">3. Optional Local F1TV Session</h2>
            <p>
              F1 View does not run third-party advertising trackers. Optional F1TV authentication is disabled by default for public remote traffic unless explicitly configured on a self-hosted backend.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

