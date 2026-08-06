import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { ServiceWorker } from "@/components/service-worker";

export const metadata: Metadata = {
  title: "DreamPaisa - Personal Finance Tracker",
  description: "Track your finances and build good habits",
};

if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args) => {
    if (args?.toString().includes('Encountered a script tag while rendering React component')) {
      return;
    }
    originalError(...args);
  };
}

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
    
//   );
// }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers attribute="class" defaultTheme="light" enableSystem={false}>
          <ServiceWorker />
          <main className="flex-1">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
