import { getDashboardInsights, getRecentTransactions, getTransactionAnalytics } from '@/app/actions/transactions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingUp, TrendingDown, Target, Building2, ShieldCheck, RefreshCw, Activity } from 'lucide-react';
import DashboardCharts from './charts';
import { requireVerifiedUser } from '@/lib/auth';
import { getPortfolioTotals } from '@/app/actions/portfolio';
import { NavSlide } from '@/components/sidenav';
import DashboardFilter from './dashboard-filter';
import RecentTransactionsCard from './recent-transactions-card';
import { getDashboardPreferences } from '@/app/actions/dashboard-preferences';
import { getGoals } from '@/app/actions/goals';
import { getLoans } from '@/app/actions/loans';
import { getInsurances } from '@/app/actions/insurance';
import { getRecurringTransactions } from '@/app/actions/recurring';

export const metadata = { title: 'Dashboard', description: 'Your personal finance dashboard, cash flow, net worth, and insights.' };

type Props = {
  searchParams: Promise<{
    month?: string;
    year?: string;
    mode?: string;
  }>;
};

export default async function DashboardPage({ searchParams }: Props) {
  const verifiedUser = await requireVerifiedUser();
  const params = await searchParams;

  const now = new Date();
  const month = params.month ? Number(params.month) : now.getMonth() + 1;
  const year = params.year ? Number(params.year) : now.getFullYear();
  const mode: 'monthly' | 'yearly' = params.mode === 'yearly' ? 'yearly' : 'monthly';

  const [insights, portfolio, recentTransactions, analytics, preferences, goals, loans, insurance, recurring] = await Promise.all([
    getDashboardInsights({ month, year, mode }),
    getPortfolioTotals(),
    getRecentTransactions(5, { month, year, mode }),
    getTransactionAnalytics({ month, year, mode }),
    getDashboardPreferences(),
    getGoals(),
    getLoans(),
    getInsurances(),
    getRecurringTransactions(),
  ]);
  const enabled = new Set(preferences.filter((preference) => preference.isEnabled).map((preference) => preference.widgetKey));

  const user = verifiedUser.user_metadata?.full_name || verifiedUser.email || 'User';

  return (
    <div className="flex min-h-screen bg-background">
      <NavSlide />

      <main className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-x-hidden pb-24 lg:pb-6 pt-16 lg:pt-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate pl-12 lg:pl-0 mb-2">
          Welcome, <span className="text-primary">{user}</span>
        </h1>

        {/* Dashboard Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Financial Overview</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {mode === 'yearly'
                ? `Yearly summary for ${year}`
                : `Monthly summary for ${new Date(year, month - 1).toLocaleString('default', { month: 'long' })} ${year}`}
            </p>
          </div>

          <DashboardFilter currentMonth={insights.selectedMonth} currentYear={insights.selectedYear} currentMode={insights.selectedMode} />
        </div>

        {/* Overview Metric Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 xl:grid-cols-4">
          <Card className={`rounded-2xl shadow-xs ${enabled.has('total_balance') ? '' : 'hidden'}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center shrink-0">
                <Wallet className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="pb-3 sm:pb-4">
              <div className="text-base sm:text-xl lg:text-2xl font-bold truncate">₹{insights.totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Combined accounts balance</p>
            </CardContent>
          </Card>

          <Card className={`rounded-2xl shadow-xs ${enabled.has('net_worth') ? '' : 'hidden'}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Net Worth</CardTitle>
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center shrink-0">
                <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent className="pb-3 sm:pb-4">
              <div className="text-base sm:text-xl lg:text-2xl font-bold truncate">₹{(insights.totalBalance + portfolio.assetValue + portfolio.investmentValue - loans.totalOutstanding).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
              <p className="mt-0.5 text-[10px] sm:text-xs text-muted-foreground truncate">Accounts + assets + investments − loans</p>
            </CardContent>
          </Card>

          <Card className={`rounded-2xl shadow-xs ${enabled.has('income_expense') ? '' : 'hidden'}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                {mode === 'yearly' ? 'Yearly Income' : 'Monthly Income'}
              </CardTitle>
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-green-50 dark:bg-green-950 flex items-center justify-center shrink-0">
                <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent className="pb-3 sm:pb-4">
              <div className="text-base sm:text-xl lg:text-2xl font-bold text-green-600 dark:text-green-400 truncate">+₹{insights.monthlyIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Total earnings for period</p>
            </CardContent>
          </Card>

          <Card className={`rounded-2xl shadow-xs ${enabled.has('income_expense') ? '' : 'hidden'}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                {mode === 'yearly' ? 'Yearly Expenses' : 'Monthly Expenses'}
              </CardTitle>
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-rose-50 dark:bg-rose-950 flex items-center justify-center shrink-0">
                <TrendingDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-rose-500" />
              </div>
            </CardHeader>
            <CardContent className="pb-3 sm:pb-4">
              <div className="text-base sm:text-xl lg:text-2xl font-bold text-rose-600 dark:text-rose-400 truncate">-₹{insights.monthlyExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Total spending for period</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-3 sm:gap-4 grid-cols-2 xl:grid-cols-4">
          {enabled.has('savings_rate') && <Card className="rounded-2xl shadow-xs"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Savings Rate</CardTitle><TrendingUp className="h-4 w-4 text-emerald-600" /></CardHeader><CardContent><p className="text-xl font-bold">{analytics.savingsRate.savingsRate.toFixed(1)}%</p><p className="text-xs text-muted-foreground">₹{analytics.savingsRate.savings.toLocaleString('en-IN')} saved this month</p></CardContent></Card>}
          {enabled.has('transaction_growth') && <Card className="rounded-2xl shadow-xs"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Activity growth</CardTitle><Activity className="h-4 w-4 text-blue-600" /></CardHeader><CardContent><p className="text-xl font-bold">{analytics.growth.currentMonthCount}</p><p className="text-xs text-muted-foreground">{analytics.growth.displayGrowthString}</p></CardContent></Card>}
          {enabled.has('goals') && <Card className="rounded-2xl shadow-xs"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Goals progress</CardTitle><Target className="h-4 w-4 text-violet-600" /></CardHeader><CardContent><p className="text-xl font-bold">₹{goals.totalCurrentAmount.toLocaleString('en-IN')}</p><p className="text-xs text-muted-foreground">of ₹{goals.totalTargetAmount.toLocaleString('en-IN')} across {goals.goals.length} goals</p></CardContent></Card>}
          {enabled.has('loans') && <Card className="rounded-2xl shadow-xs"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Outstanding loans</CardTitle><Building2 className="h-4 w-4 text-rose-600" /></CardHeader><CardContent><p className="text-xl font-bold">₹{loans.totalOutstanding.toLocaleString('en-IN')}</p><p className="text-xs text-muted-foreground">{loans.loans.filter((loan) => loan.status === 'ACTIVE').length} active loan(s)</p></CardContent></Card>}
          {enabled.has('insurance') && <Card className="rounded-2xl shadow-xs"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Insurance renewals</CardTitle><ShieldCheck className="h-4 w-4 text-sky-600" /></CardHeader><CardContent><p className="text-xl font-bold">{insurance.activePoliciesCount}</p><p className="text-xs text-muted-foreground">{insurance.upcomingRenewalsCount} due in the next 30 days</p></CardContent></Card>}
          {enabled.has('recurring_transactions') && <Card className="rounded-2xl shadow-xs"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Recurring commitments</CardTitle><RefreshCw className="h-4 w-4 text-amber-600" /></CardHeader><CardContent><p className="text-xl font-bold">₹{recurring.monthlyCommitment.toLocaleString('en-IN')}</p><p className="text-xs text-muted-foreground">monthly across {recurring.activeCount} active item(s)</p></CardContent></Card>}
          {enabled.has('assets') && <Card className="rounded-2xl shadow-xs"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Assets</CardTitle><Wallet className="h-4 w-4 text-blue-600" /></CardHeader><CardContent><p className="text-xl font-bold">₹{portfolio.assetValue.toLocaleString('en-IN')}</p><p className="text-xs text-muted-foreground">₹{portfolio.purchaseValue.toLocaleString('en-IN')} purchase value</p></CardContent></Card>}
          {enabled.has('investments') && <Card className="rounded-2xl shadow-xs"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Investments</CardTitle><TrendingUp className="h-4 w-4 text-indigo-600" /></CardHeader><CardContent><p className="text-xl font-bold">₹{portfolio.investmentValue.toLocaleString('en-IN')}</p><p className="text-xs text-muted-foreground">₹{portfolio.investedAmount.toLocaleString('en-IN')} invested</p></CardContent></Card>}
        </div>

        {/* Charts & Recent Transactions */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          {enabled.has('expense_categories') && <Card className="rounded-2xl shadow-xs">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Expenses by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {insights.categoryChartData.length > 0 ? (
                <DashboardCharts data={insights.categoryChartData} />
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                  No expenses recorded in this period.
                </div>
              )}
            </CardContent>
          </Card>}

          {enabled.has('income_categories') && <Card className="rounded-2xl shadow-xs">
            <CardHeader><CardTitle className="text-lg font-bold">Income by Category</CardTitle></CardHeader>
            <CardContent>{insights.incomeCategoryChartData.length > 0 ? <DashboardCharts data={insights.incomeCategoryChartData} /> : <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">No income recorded in this period.</div>}</CardContent>
          </Card>}

          <RecentTransactionsCard transactions={recentTransactions} />
        </div>
      </main>
    </div>
  );
}
