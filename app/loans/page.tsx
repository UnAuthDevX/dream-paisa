import { getLoans } from '@/app/actions/loans';
import { getAccounts } from '@/app/actions/accounts';
import { requireVerifiedUser } from '@/lib/auth';

export const metadata = { title: 'Loans & Liabilities', description: 'Track loans, EMIs, outstanding balances, and repayment progress.' };
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoanFormModal from './loan-form-modal';
import PayEMIModal from './pay-emi-modal';
import { NavSlide } from '@/components/sidenav';
import Link from 'next/link';
import { Building2, Calendar, ShieldAlert, ArrowRight, CheckCircle2, History } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function LoansPage() {
  await requireVerifiedUser();
  const [loanData, accounts] = await Promise.all([
    getLoans(),
    getAccounts(),
  ]);

  const { loans, totalOutstanding, totalPrincipal, totalInterestPaid, totalMonthlyEMI } = loanData;

  return (
    <div className="flex min-h-screen bg-background">
      <NavSlide />

      <main className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-x-hidden pb-24 lg:pb-6 pt-16 lg:pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Loans &amp; Liabilities</h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
              Track borrowed capital, monitor EMI schedules, and separate interest expenses from principal repayments.
            </p>
          </div>
          <LoanFormModal />
        </div>

        {/* Overview Metric Summary */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-2xl shadow-xs border-amber-100 dark:border-amber-950/60 bg-amber-50/30 dark:bg-amber-950/20">
            <CardHeader className="pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center justify-between">
                <span>Total Outstanding</span>
                <ShieldAlert className="h-4 w-4 text-amber-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-amber-700 dark:text-amber-300">
                ₹{totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Current principal liability remaining</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-xs">
            <CardHeader className="pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center justify-between">
                <span>Monthly EMI Commitment</span>
                <Calendar className="h-4 w-4 text-blue-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                ₹{totalMonthlyEMI.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Total active monthly payout</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-xs">
            <CardHeader className="pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center justify-between">
                <span>Original Principal</span>
                <Building2 className="h-4 w-4 text-slate-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                ₹{totalPrincipal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Total borrowed capital across loans</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-xs">
            <CardHeader className="pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center justify-between">
                <span>Total Interest Paid</span>
                <History className="h-4 w-4 text-rose-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400">
                ₹{totalInterestPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Cumulative interest cost to date</p>
            </CardContent>
          </Card>
        </div>

        {/* Loan Cards Grid */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {loans.length ? (
            loans.map((loan) => (
              <Card key={loan.id} className="rounded-2xl shadow-xs hover:border-amber-300 dark:hover:border-amber-800 transition-all flex flex-col justify-between">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-base sm:text-lg font-bold">{loan.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                        {loan.type}
                      </span>
                      {loan.lender && (
                        <span className="text-[11px] text-muted-foreground">via {loan.lender}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <LoanFormModal loan={loan} />
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-muted/40 rounded-xl">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Remaining Balance</p>
                      <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                        ₹{loan.remainingPrincipal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Monthly EMI</p>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                        ₹{loan.emiAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {/* Repayment Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-muted-foreground">Repayment Progress</span>
                      <span className="text-emerald-600 font-bold">{loan.progressPercentage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${Math.min(100, loan.progressPercentage)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
                    <span>{loan.interestRate}% p.a. • {loan.tenureMonths} mos</span>
                    {loan.status === 'CLOSED' ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Paid Off
                      </span>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    {loan.status === 'ACTIVE' && accounts.length > 0 && (
                      <PayEMIModal
                        loanId={loan.id}
                        loanName={loan.name}
                        defaultEMI={loan.emiAmount}
                        remainingPrincipal={loan.remainingPrincipal}
                        accounts={accounts}
                      />
                    )}
                    <Link href={`/loans/${loan.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-xs flex items-center justify-center gap-1 rounded-xl">
                        Details <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full rounded-2xl border bg-muted/30 p-12 text-center text-muted-foreground space-y-3">
              <Building2 className="h-10 w-10 mx-auto text-muted-foreground/60" />
              <div>
                <p className="font-semibold text-base text-foreground">No loans or liabilities logged</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                  Track home loans, car loans, personal loans, or credit card dues to maintain accurate liability balances.
                </p>
              </div>
              <div className="pt-2">
                <LoanFormModal />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
