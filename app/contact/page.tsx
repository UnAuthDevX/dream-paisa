import type { Metadata } from 'next';
import { Navbar } from '@/components/navbar';
import { SiteFooter } from '@/components/site-footer';

export const metadata: Metadata = {
  title: 'Contact DreamPaisa',
  description: 'Contact DreamPaisa support with questions about the personal finance tracker.',
};

export default function ContactPage() {
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:py-16">
        <p className="text-sm font-semibold text-primary">CONTACT</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">We&apos;re here to help.</h1>
        <div className="mt-8 rounded-2xl border bg-card p-6 text-muted-foreground">
          <p>For account, privacy, or product questions, contact DreamPaisa support.</p>
          {supportEmail ? (
            <a className="mt-4 inline-block font-medium text-primary underline underline-offset-4" href={`mailto:${supportEmail}`}>
              {supportEmail}
            </a>
          ) : (
            <p className="mt-4 text-sm">
              Support email is being configured. Set <code>NEXT_PUBLIC_SUPPORT_EMAIL</code> before publishing this page.
            </p>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
