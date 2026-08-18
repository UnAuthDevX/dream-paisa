import { getDashboardInsights, getRecentTransactions } from '@/app/actions/transactions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import DashboardCharts from './charts';
import { requireVerifiedUser } from '@/lib/auth';
import { getPortfolioTotals } from '@/app/actions/portfolio';
import { NavSlide } from '@/components/sidenav';
import DashboardFilter from './dashboard-filter';
import RecentTransactionsCard from './recent-transactions-card';

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

  const [insights, portfolio, recentTransactions] = await Promise.all([
    getDashboardInsights({ month, year, mode }),
    getPortfolioTotals(),
    getRecentTransactions(5),
  ]);

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
          <Card className="rounded-2xl shadow-xs">
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

          <Card className="rounded-2xl shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Assets &amp; Investments</CardTitle>
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center shrink-0">
                <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent className="pb-3 sm:pb-4">
              <div className="text-base sm:text-xl lg:text-2xl font-bold truncate">₹{(portfolio.assetValue + portfolio.investmentValue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
              <p className="mt-0.5 text-[10px] sm:text-xs text-muted-foreground truncate">Assets ₹{portfolio.assetValue.toLocaleString('en-IN')} · Inv ₹{portfolio.investmentValue.toLocaleString('en-IN')}</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-xs">
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

          <Card className="rounded-2xl shadow-xs">
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

        {/* Charts & Recent Transactions */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          <Card className="rounded-2xl shadow-xs">
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
          </Card>

          <RecentTransactionsCard transactions={recentTransactions} />
        </div>
      </main>
    </div>
  );
}
