import { getLoanById } from '@/app/actions/loans';
import { getAccounts } from '@/app/actions/accounts';
import { requireVerifiedUser } from '@/lib/auth';
import { NavSlide } from '@/components/sidenav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft, Building2, Calendar, CheckCircle2, History,
  IndianRupee, ShieldAlert, TrendingDown,
} from 'lucide-react';
import LoanFormModal from '../loan-form-modal';
import PayEMIModal from '../pay-emi-modal';

type Props = { params: Promise<{ id: string }> };

export default async function LoanDetailPage({ params }: Props) {
  await requireVerifiedUser();
  const { id } = await params;
  const loanId = Number(id);

  const [loan, accounts] = await Promise.all([
    getLoanById(loanId),
    getAccounts(),
  ]);

  if (!loan) notFound();

  const formatINR = (n: number) =>
    `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <div className="flex min-h-screen bg-background">
      <NavSlide />

      <main className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-x-hidden pb-24 lg:pb-6 pt-16 lg:pt-6">
        {/* Back + Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <Link
              href="/loans"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Loans
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold">{loan.name}</h1>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                {loan.type}
              </span>
              {loan.lender && (
                <span className="text-xs text-muted-foreground">via {loan.lender}</span>
              )}
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  loan.status === 'CLOSED'
                    ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                    : 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200'
                }`}
              >
                {loan.status}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {loan.status === 'ACTIVE' && accounts.length > 0 && (
              <PayEMIModal
                loanId={loan.id}
                loanName={loan.name}
                defaultEMI={loan.emiAmount}
                remainingPrincipal={loan.remainingPrincipal}
                accounts={accounts}
              />
            )}
            <LoanFormModal loan={loan} />
            <Link href={`/transactions?loanId=${loan.id}&allTime=true`} className="text-xs font-semibold text-primary hover:underline">View transactions</Link>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-2xl shadow-xs border-amber-100 dark:border-amber-950/60 bg-amber-50/30 dark:bg-amber-950/20">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-600" /> Remaining
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-amber-700 dark:text-amber-300">
                {formatINR(loan.remainingPrincipal)}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Outstanding balance</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-xs">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <IndianRupee className="h-3.5 w-3.5 text-blue-600" /> Principal Paid
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {formatINR(loan.principalPaid)}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                of {formatINR(loan.principalAmount)}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-xs">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <TrendingDown className="h-3.5 w-3.5 text-rose-500" /> Interest Paid
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-rose-600 dark:text-rose-400">
                {formatINR(loan.totalInterestPaid)}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Cumulative interest cost</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-xs">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-500" /> EMI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {formatINR(loan.emiAmount)}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {loan.interestRate}% p.a. · {loan.tenureMonths} mos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="rounded-2xl shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base font-bold">Repayment Progress</CardTitle>
              <span className="text-emerald-600 font-bold text-sm">
                {loan.progressPercentage.toFixed(1)}%
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, loan.progressPercentage)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Started: {new Date(loan.startDate).toLocaleDateString('en-IN')}</span>
              {loan.endDate && (
                <span>End date: {new Date(loan.endDate).toLocaleDateString('en-IN')}</span>
              )}
            </div>
            {loan.notes && (
              <p className="text-sm text-muted-foreground pt-1 border-t border-border/40 mt-2">
                {loan.notes}
              </p>
            )}
          </CardContent>
        </Card>

        {/* EMI Payment History */}
        <Card className="rounded-2xl shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loan.transactions.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground space-y-2">
                <Building2 className="h-8 w-8 mx-auto text-muted-foreground/50" />
                <p className="text-sm">No EMI payments recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {loan.transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors gap-1"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {tx.notes || `EMI Payment`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.date).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                        {' · '}{tx.account?.name ?? 'Deleted account'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {tx.principalComponent != null && tx.principalComponent > 0 && (
                        <div className="text-right">
                          <p className="text-[11px] text-muted-foreground">Principal</p>
                          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                            {formatINR(tx.principalComponent)}
                          </p>
                        </div>
                      )}
                      {tx.interestComponent != null && tx.interestComponent > 0 && (
                        <div className="text-right">
                          <p className="text-[11px] text-muted-foreground">Interest</p>
                          <p className="text-xs font-semibold text-rose-500">
                            {formatINR(tx.interestComponent)}
                          </p>
                        </div>
                      )}
                      <div className="text-right min-w-[80px]">
                        <p className="text-[11px] text-muted-foreground">Total</p>
                        <p className="text-sm font-bold text-foreground">
                          {formatINR(Math.abs(tx.amount))}
                        </p>
                      </div>
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
