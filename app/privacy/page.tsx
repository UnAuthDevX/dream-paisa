import type { Metadata } from 'next';
import { CookiePreferencesButton } from '@/components/cookie-consent';
import { Navbar } from '@/components/navbar';
import { SiteFooter } from '@/components/site-footer';

export const metadata: Metadata = {
  title: 'Privacy Policy | DreamPaisa',
  description: 'How DreamPaisa collects, uses, and protects personal data and cookie preferences.',
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:py-16">
        <article className="space-y-8 text-muted-foreground leading-7">
          <header>
            <p className="text-sm font-semibold text-primary">LEGAL</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Privacy Policy</h1>
            <p className="mt-2 text-sm">Last updated: August 18, 2026</p>
          </header>
          <section><h2 className="text-xl font-semibold text-foreground">Information we handle</h2><p className="mt-2">DreamPaisa stores the account profile and financial records you choose to enter, such as accounts, transactions, assets, and investments. This information is used to provide the service and is not sold.</p></section>
          <section><h2 className="text-xl font-semibold text-foreground">How we use information</h2><p className="mt-2">We use your information to authenticate your account, display your finance dashboard, maintain your records, and protect the service. DreamPaisa is not a bank and does not provide financial advice.</p></section>
          <section><h2 className="text-xl font-semibold text-foreground">Cookies and advertising</h2><p className="mt-2">DreamPaisa uses essential browser storage to remember your cookie choice. If Google advertising is enabled on public pages, third parties including Google may use cookies, web beacons, IP addresses, or similar identifiers to serve and measure ads. Advertising will not be used to target people based on private finance records, and ads will not be placed in authenticated finance dashboards.</p><p className="mt-2">Any ads will be clearly separated from navigation and app controls to avoid accidental clicks. You can change your choice at any time. Where required by law, consent is requested before advertising cookies are used.</p><div className="mt-4"><CookiePreferencesButton /></div></section>
          <section><h2 className="text-xl font-semibold text-foreground">Data sharing and security</h2><p className="mt-2">We share data only with service providers needed to operate DreamPaisa, such as authentication, hosting, and database providers, or when legally required. We use reasonable safeguards, but no online service can guarantee absolute security.</p></section>
          <section><h2 className="text-xl font-semibold text-foreground">Your choices</h2><p className="mt-2">You can update your account details or request deletion through the application. Questions about privacy can be sent through the Contact page.</p></section>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
