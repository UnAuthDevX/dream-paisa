import type { Metadata } from 'next';
import { Navbar } from '@/components/navbar';
import { SiteFooter } from '@/components/site-footer';

export const metadata: Metadata = {
  title: 'About DreamPaisa',
  description: 'Learn how DreamPaisa helps you organize personal finances and understand your spending.',
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:py-16">
        <p className="text-sm font-semibold text-primary">ABOUT DREAMPAISA</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">A clearer view of your everyday money.</h1>
        <div className="mt-8 space-y-5 text-muted-foreground leading-7">
          <p>
            DreamPaisa is a personal finance tracker that helps you record income and expenses, organize accounts,
            and see a simple picture of your financial activity in one place.
          </p>
          <p>
            You can track transactions, accounts, assets, and investments, then use the dashboard to understand
            spending patterns and balances. DreamPaisa is for personal organization and awareness; it does not
            provide investment, tax, legal, or financial advice.
          </p>
          <p>
            Your finance records are private to your account. We do not sell your personal transaction data or use it
            to choose advertising. If advertising is added, it will appear only in appropriate public areas of the site.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
