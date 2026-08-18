import type { Metadata } from 'next';
import { Navbar } from '@/components/navbar';
import { SiteFooter } from '@/components/site-footer';

export const metadata: Metadata = {
  title: 'Terms of Service | DreamPaisa',
  description: 'Terms for using DreamPaisa, a personal finance tracking service.',
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:py-16">
        <article className="space-y-8 text-muted-foreground leading-7">
          <header><p className="text-sm font-semibold text-primary">LEGAL</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Terms of Service</h1><p className="mt-2 text-sm">Last updated: August 18, 2026</p></header>
          <section><h2 className="text-xl font-semibold text-foreground">Using DreamPaisa</h2><p className="mt-2">DreamPaisa is provided for personal finance tracking and educational use. You are responsible for the accuracy of the information you enter and for keeping your account credentials secure.</p></section>
          <section><h2 className="text-xl font-semibold text-foreground">Not financial advice</h2><p className="mt-2">DreamPaisa does not provide investment, tax, legal, credit, or financial advice. Decisions you make based on information in the app are your responsibility.</p></section>
          <section><h2 className="text-xl font-semibold text-foreground">Acceptable use</h2><p className="mt-2">Do not misuse the service, attempt to access another person&apos;s data, interfere with the service, or use automated activity that harms availability. If advertising appears on public pages, do not click ads to inflate earnings or encourage others to do so.</p></section>
          <section><h2 className="text-xl font-semibold text-foreground">Availability and changes</h2><p className="mt-2">We may update, change, or discontinue features as the service evolves. We may update these terms by posting a revised version on this page.</p></section>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
