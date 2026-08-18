import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { ServiceWorker } from "@/components/service-worker";
import { CookieConsent } from "@/components/cookie-consent";

export const metadata: Metadata = {
  title: "DreamPaisa - Personal Finance Tracker",
  description:
    "Track your income, expenses, accounts, and spending habits with DreamPaisa.",
  applicationName: "DreamPaisa",
  keywords: [
    "personal finance",
    "expense tracker",
    "budget tracker",
    "money management",
    "finance tracker",
    "DreamPaisa",
  ],
  other: {
    "google-adsense-account": "ca-pub-1096202877849237",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <ServiceWorker />

          <main className="flex-1">
            {children}
          </main>

          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}