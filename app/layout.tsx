import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { ServiceWorker } from "@/components/service-worker";
import { CookieConsent } from "@/components/cookie-consent";
import Script from "next/script";


export const metadata: Metadata = {
  title: "DreamPaisa - Personal Finance Tracker",
  description:
    "Track your income, expenses, accounts, and spending habits with DreamPaisa.",
  applicationName: "DreamPaisa",
  other: {
    "google-adsense-account": "ca-pub-1096202877849237",
  },
  keywords: [
    "personal finance",
    "expense tracker",
    "budget tracker",
    "money management",
    "finance tracker",
    "DreamPaisa",
  ],
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
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-5PF9SCZH71"
        />

        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-5PF9SCZH71');
          `}
        </Script>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1096202877849237"
          crossOrigin="anonymous"
        ></Script>
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