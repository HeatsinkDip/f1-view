import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const googleVerificationToken = (
  process.env.GOOGLE_SITE_VERIFICATION || "ZqAYFt_6FXSyUzmfSzoraYQRq6qqpdHIBliIjxW8dSU"
)
  .trim()
  .replace(/^google-site-verification=/i, "");

export const metadata: Metadata = {
  title: "F1 View - Formula 1 Telemetry & Race Analytics",
  description: "F1 View is a Formula 1 Telemetry & Race Analytics platform.",
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
