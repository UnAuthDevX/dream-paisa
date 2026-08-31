import Link from 'next/link';
import { ArrowRight, BarChart3, CalendarClock, CircleDollarSign, Landmark, ShieldCheck, Target, TrendingUp, WalletCards } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { SiteFooter } from '@/components/site-footer';

const features = [
  { icon: WalletCards, title: 'Accounts and transactions', text: 'Track balances across accounts and log income, expenses, transfers, assets, and investments in one timeline.' },
  { icon: TrendingUp, title: 'Assets and investments', text: 'Monitor purchase value, current value, returns, and a complete transaction history for every investment.' },
  { icon: Landmark, title: 'Loans and liabilities', text: 'Record EMIs with principal and interest splits, see outstanding balances, and follow repayment progress.' },
  { icon: ShieldCheck, title: 'Insurance', text: 'Keep policies, coverage, premiums, nominees, payment history, and renewal dates organised.' },
  { icon: Target, title: 'Goals', text: 'Set targets and deadlines, then see the monthly savings required to reach each goal.' },
  { icon: CalendarClock, title: 'Recurring commitments', text: 'Manage subscriptions, salary, rent, and other repeating cash-flow items without duplicate entries.' },
  { icon: BarChart3, title: 'Useful insights', text: 'Review top categories, savings rate, month-over-month activity, and your portfolio in the dashboard.' },
  { icon: CircleDollarSign, title: 'Your dashboard, your way', text: 'Choose dashboard widgets, change their order, and use a theme that suits your workspace.' },
];

export const metadata = { title: 'Features and how it works', description: 'Discover how DreamPaisa helps you organise spending, assets, investments, goals, loans, and recurring commitments.' };

export default function FeaturesPage() {
  return <div className="flex min-h-screen flex-col"><Navbar /><main className="flex-1">
    <section className="border-b bg-gradient-to-b from-primary/10 to-background py-16 text-center sm:py-24"><div className="container mx-auto max-w-3xl px-4"><p className="mb-3 text-sm font-semibold text-primary">THE DREAMPAISA GUIDE</p><h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Everything you need to see your money clearly.</h1><p className="mt-5 text-lg text-muted-foreground">DreamPaisa brings your everyday finances and long-term plan together without turning them into a spreadsheet project.</p><Link href="/signup" className="mt-8 inline-flex h-11 items-center rounded-lg bg-primary px-5 font-medium text-primary-foreground hover:bg-primary/90">Start organising your money <ArrowRight className="ml-2 h-4 w-4" /></Link></div></section>
    <section className="container mx-auto px-4 py-14 sm:py-20"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{features.map(({ icon: Icon, title, text }) => <article key={title} className="rounded-2xl border bg-card p-5 shadow-xs"><div className="mb-4 grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div><h2 className="font-bold">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></article>)}</div></section>
    <section className="border-y bg-muted/30 py-14"><div className="container mx-auto max-w-4xl px-4"><h2 className="text-center text-3xl font-bold">How to get started</h2><ol className="mt-8 grid gap-5 sm:grid-cols-3">{[['1', 'Add your accounts', 'Enter the balances you want to track.'], ['2', 'Log what happens', 'Add transactions, assets, investments, policies, and liabilities.'], ['3', 'Use the dashboard', 'Review your cash flow, goals, returns, and upcoming commitments.']].map(([number, title, text]) => <li key={number} className="rounded-2xl bg-background p-5"><span className="text-2xl font-black text-primary">{number}</span><h3 className="mt-3 font-bold">{title}</h3><p className="mt-1 text-sm text-muted-foreground">{text}</p></li>)}</ol></div></section>
  </main><SiteFooter /></div>;
}
