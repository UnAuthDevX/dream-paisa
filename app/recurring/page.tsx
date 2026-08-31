import { getRecurringTransactions } from '@/app/actions/recurring';
import { getAccounts } from '@/app/actions/accounts';
import { getCategories } from '@/app/actions/transactions';

export const metadata = { title: 'Recurring Transactions', description: 'Manage subscriptions, recurring income, and regular commitments.' };
import { requireVerifiedUser } from '@/lib/auth';
import { NavSlide } from '@/components/sidenav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RecurringFormModal from './recurring-form-modal';
import ToggleRecurringButton from './toggle-recurring-button';
import MarkRecurringPaidButton from './mark-recurring-paid-button';
import { RefreshCw, TrendingDown, CalendarClock, Zap } from 'lucide-react';
import Link from 'next/link';

const FREQUENCY_LABELS: Record<string, string> = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  YEARLY: 'Yearly',
};

export default async function RecurringPage() {
  await requireVerifiedUser();
  const [recurringData, accounts, categories] = await Promise.all([
    getRecurringTransactions(),
    getAccounts(),
    getCategories(),
  ]);

  const { recurring, monthlyCommitment, yearlyCommitment, activeCount } = recurringData;

  const active = recurring.filter((r) => r.isActive);
  const paused = recurring.filter((r) => !r.isActive);

  return (
    <div className="flex min-h-screen bg-background">
      <NavSlide />

      <main className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-x-hidden pb-24 lg:pb-6 pt-16 lg:pt-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Recurring Commitments</h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
              Track subscriptions, EMIs, salaries, and other repeating transactions.
            </p>
          </div>
          <RecurringFormModal accounts={accounts} categories={categories} />
        </div>

        {/* Summary Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3">
          <Card className="rounded-2xl shadow-xs border-rose-100 dark:border-rose-950/60 bg-rose-50/30 dark:bg-rose-950/20">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                <span>Monthly Outflow</span>
                <TrendingDown className="h-4 w-4 text-rose-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-rose-700 dark:text-rose-300">
                ₹{monthlyCommitment.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Normalized monthly expenses</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-xs">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                <span>Yearly Outflow</span>
                <CalendarClock className="h-4 w-4 text-slate-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                ₹{yearlyCommitment.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Annualized expense commitments</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-xs">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                <span>Active Schedules</span>
                <Zap className="h-4 w-4 text-emerald-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {activeCount}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Currently running</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Schedules */}
        {active.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Active</h2>
            <div className="space-y-2">
              {active.map((r) => (
                <Card key={r.id} className="rounded-2xl shadow-xs hover:border-primary/30 transition-all">
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm truncate">{r.name}</span>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${r.type === 'EXPENSE' ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border-rose-200' : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 border-emerald-200'}`}>
                          {r.type}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                          {FREQUENCY_LABELS[r.frequency] ?? r.frequency}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                        <span>{r.accountName}</span>
                        {r.categoryName && <span>· {r.categoryName}</span>}
                        <span>· Next: {new Date(r.nextOccurrence).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        {r.lastPaymentDate && <span className="font-medium text-emerald-600">· Paid: {new Date(r.lastPaymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className={`text-base font-bold ${r.type === 'EXPENSE' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {r.type === 'EXPENSE' ? '-' : '+'}₹{r.amount.toLocaleString('en-IN')}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          ≈ ₹{Math.round(r.monthlyAmount).toLocaleString('en-IN')}/mo
                        </p>
                      </div>
                      <ToggleRecurringButton id={r.id} isActive={true} />
                      <MarkRecurringPaidButton id={r.id} />
                      <Link href={`/transactions?recurringId=${r.id}&allTime=true`} className="text-xs font-semibold text-primary hover:underline">History</Link>
                      <RecurringFormModal item={r} accounts={accounts} categories={categories} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Paused Schedules */}
        {paused.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Paused</h2>
            <div className="space-y-2">
              {paused.map((r) => (
                <Card key={r.id} className="rounded-2xl shadow-xs opacity-60 hover:opacity-80 transition-opacity">
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm truncate">{r.name}</span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                          {FREQUENCY_LABELS[r.frequency] ?? r.frequency}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{r.accountName}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <p className="text-base font-bold text-muted-foreground">
                        ₹{r.amount.toLocaleString('en-IN')}
                      </p>
                      <ToggleRecurringButton id={r.id} isActive={false} />
                      <Link href={`/transactions?recurringId=${r.id}&allTime=true`} className="text-xs font-semibold text-primary hover:underline">History</Link>
                      <RecurringFormModal item={r} accounts={accounts} categories={categories} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {recurring.length === 0 && (
          <div className="rounded-2xl border bg-muted/30 p-12 text-center space-y-3">
            <RefreshCw className="h-10 w-10 mx-auto text-muted-foreground/60" />
            <div>
              <p className="font-semibold text-base text-foreground">No recurring transactions set up</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                Automate tracking for subscriptions, EMIs, rent, salaries, and other repeating payments.
              </p>
            </div>
            <div className="pt-2">
              <RecurringFormModal accounts={accounts} categories={categories} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
