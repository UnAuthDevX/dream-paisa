import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowDownRight, ArrowUpRight, History, Landmark, TrendingUp } from 'lucide-react';
import { getInvestmentById } from '@/app/actions/portfolio';
import { requireVerifiedUser } from '@/lib/auth';
import { NavSlide } from '@/components/sidenav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import InvestmentFormModal from '../investment-form-modal';

type Props = { params: Promise<{ id: string }> };

export default async function InvestmentDetailPage({ params }: Props) {
  await requireVerifiedUser();
  const investment = await getInvestmentById(Number((await params).id));
  if (!investment) notFound();

  const isProfit = investment.gainLoss >= 0;
  const formatINR = (value: number) => `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return <div className="flex min-h-screen bg-background"><NavSlide />
    <main className="flex-1 space-y-4 overflow-x-hidden p-4 pb-24 pt-16 sm:space-y-6 sm:p-6 lg:pb-6 lg:pt-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div><Link href="/investments" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Back to investments</Link><h1 className="mt-2 text-2xl font-bold sm:text-3xl">{investment.name}</h1><p className="text-sm text-muted-foreground">{investment.type}{investment.quantity ? ` · ${investment.quantity} units` : ''}</p></div>
        <InvestmentFormModal investment={investment} />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <Card className="rounded-2xl"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm text-muted-foreground"><Landmark className="h-4 w-4" />Invested capital</CardTitle></CardHeader><CardContent className="text-xl font-bold">{formatINR(investment.investedAmount)}</CardContent></Card>
        <Card className="rounded-2xl"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm text-muted-foreground"><TrendingUp className="h-4 w-4 text-indigo-600" />Current value</CardTitle></CardHeader><CardContent className="text-xl font-bold text-indigo-600">{formatINR(investment.currentValue)}</CardContent></Card>
        <Card className="rounded-2xl"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">{isProfit ? <ArrowUpRight className="h-4 w-4 text-emerald-600" /> : <ArrowDownRight className="h-4 w-4 text-rose-600" />}Return</CardTitle></CardHeader><CardContent className={`text-xl font-bold ${isProfit ? 'text-emerald-600' : 'text-rose-600'}`}>{isProfit ? '+' : ''}{formatINR(investment.gainLoss)} <span className="text-sm">({investment.gainLossPercentage.toFixed(1)}%)</span></CardContent></Card>
      </div>
      <Card className="rounded-2xl"><CardHeader><CardTitle className="flex items-center gap-2"><History className="h-5 w-5" />Investment transaction history</CardTitle></CardHeader><CardContent>
        {investment.transactions.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No linked investment transactions yet.</p> : <div className="space-y-2">{investment.transactions.map((transaction) => <div key={transaction.id} className="flex items-center justify-between rounded-xl bg-muted/40 p-3"><div><p className="font-medium">{transaction.notes || 'Investment transaction'}</p><p className="text-xs text-muted-foreground">{new Date(transaction.date).toLocaleDateString('en-IN')} · {transaction.account?.name ?? 'Deleted account'}</p></div><p className={`font-bold ${transaction.amount < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{transaction.amount < 0 ? '-' : '+'}{formatINR(Math.abs(transaction.amount))}</p></div>)}</div>}
      </CardContent></Card>
    </main>
  </div>;
}
