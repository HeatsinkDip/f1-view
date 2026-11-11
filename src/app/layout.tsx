import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { SITE_URL } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const googleVerificationToken = (
  process.env.GOOGLE_SITE_VERIFICATION || "EvAgXn9-WHbNJmQapJFAKb6_Kdkw6eCq7oul-KQTQQU"
)
  .trim()
  .replace(/^google-site-verification=/i, "");

const SITE_TITLE = "F1 View - Formula 1 Telemetry & Race Analytics";
const SITE_DESCRIPTION =
  "Formula 1 telemetry & race analytics platform powered by FastF1, OpenF1, FastAPI, and Next.js. Explore telemetry traces, interactive track maps, tyre strategy, race control, and championship standings.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  keywords: [
    "Formula 1",
    "F1 telemetry",
    "FastF1",
    "OpenF1",
    "race analytics",
    "tyre strategy",
    "championship standings",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "F1 View",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/hero-bg.png",
        width: 1024,
        height: 1024,
        alt: "F1 View - Formula 1 Telemetry & Race Analytics",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/hero-bg.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: googleVerificationToken,
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
