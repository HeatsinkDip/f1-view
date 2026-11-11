import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { buildPageSocialMetadata } from "@/lib/site";

const TERMS_TITLE = "Terms & Disclaimer";
const TERMS_DESCRIPTION =
  "Terms of use, open-source MIT license summary, and unofficial Formula 1 trademark disclaimer for F1 View.";

export const metadata: Metadata = {
  title: TERMS_TITLE,
  description: TERMS_DESCRIPTION,
  ...buildPageSocialMetadata({
    title: TERMS_TITLE,
    description: TERMS_DESCRIPTION,
    path: "/terms",
  }),
};

export default function TermsPage() {
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
          <h1 className="text-4xl font-black tracking-tight uppercase italic">Terms & Disclaimer</h1>
          <p className="text-muted-foreground">
            Usage guidelines and attribution for F1 View Formula 1 telemetry analytics.
          </p>
        </header>

        <section className="space-y-6 text-muted-foreground leading-relaxed">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">1. Unofficial Fan Project</h2>
            <p>
              F1 View is an unofficial project and is not associated in any way with Formula 1 companies. F1, FORMULA ONE, FORMULA 1, FIA FORMULA ONE WORLD CHAMPIONSHIP, GRAND PRIX, and related marks are trademarks of Formula One Licensing B.V.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">2. Telemetry Accuracy</h2>
            <p>
              Telemetry traces, lap comparisons, strategy estimates, and weather metrics are provided as-is for educational and motorsport analysis purposes using public open-source data providers.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">3. Open Source</h2>
            <p>
              Source code is maintained on{" "}
              <a
                href="https://github.com/HeatsinkDip/f1-view"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline underline-offset-4 hover:text-red-600 dark:hover:text-red-400"
              >
                GitHub (HeatsinkDip/f1-view)
              </a>{" "}
              under the MIT License.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

