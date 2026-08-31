import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { ServiceWorker } from "@/components/service-worker";
import { CookieConsent } from "@/components/cookie-consent";
import Script from "next/script";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dreampaisa.netlify.app/";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "DreamPaisa – Personal Finance & Net Worth Tracker",
    template: "%s | DreamPaisa",
  },
  description:
    "DreamPaisa is an all-in-one personal finance OS. DreamPaisa is a personal finance tracker for India. Track expenses, income, budgets, bank accounts, investments, assets, depreciation, and your net worth in one simple dashboard.",
  applicationName: "DreamPaisa",
  authors: [{ name: "unauthoriseddevelopers Team", url: siteUrl }],
  creator: "unauthoriseddevelopers",
  publisher: "unauthoriseddevelopers",
  category: "Finance",
  classification: "Personal Finance & Wealth Management",
  keywords: [
  // Core personal finance
  "personal finance tracker",
  "personal finance app",
  "money management app",
  "personal money manager",
  "financial management app",

  // Expense & income tracking
  "expense tracker",
  "expense tracker india",
  "daily expense tracker",
  "income and expense tracker",
  "income tracker",
  "spending tracker",
  "cash flow tracker",
  "monthly expense tracker",

  // Budgeting
  "budget tracker",
  "budget planner",
  "monthly budget planner",
  "personal budget tracker",
  "expense budget tracker",

  // Net worth & wealth
  "net worth tracker",
  "personal net worth tracker",
  "wealth tracker",
  "net worth calculator",
  "wealth management app",

  // Assets
  "asset tracker",
  "personal asset tracker",
  "asset depreciation calculator",
  "asset depreciation tracker",
  "asset management app",

  // Investments
  "investment tracker",
  "investment portfolio tracker",
  "portfolio tracker",
  "investment management app",
  "personal investment tracker",

  // Banking
  "bank account tracker",
  "multiple bank account tracker",
  "bank balance tracker",
  "personal banking tracker",

  // India-specific
  "indian personal finance",
  "personal finance app india",
  "money management app india",
  "expense tracker india",
  "budget app india",
  "net worth tracker india",
  "investment tracker india",
  "rupee expense tracker",

  // Product / brand
  "DreamPaisa",
  "Dream Paisa",
  "DreamPaisa tracker",
  "DreamPaisa app",
  "DreamPaisa personal finance",
  "DreamPaisa expense tracker",
  "DreamPaisa net worth tracker",
],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    title: "DreamPaisa - Smart Personal Finance & Net Worth Tracker",
    description:
      "Take total control of your money. Track expenses, bank accounts, physical assets with depreciation, and investments all in one unified financial dashboard.",
    siteName: "DreamPaisa",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "DreamPaisa - Personal Finance Companion",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DreamPaisa - Personal Finance & Net Worth Tracker",
    description:
      "Manage your cash flow, track physical assets, monitor investment portfolios, and grow your net worth with DreamPaisa.",
    images: ["/icon-512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "google-adsense-account": "ca-pub-1096202877849237",
"google-site-verification":"6QH_Y_FppYXs-Jy4nUHbYlMdPy20wTXfTeXHwHXOnhI",
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