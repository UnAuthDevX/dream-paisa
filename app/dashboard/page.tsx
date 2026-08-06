import { getDashboardInsights } from '@/app/actions/transactions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import DashboardCharts from './charts'; // Client component for Recharts
import { requireVerifiedUser } from '@/lib/auth';
import { getPortfolioTotals } from '@/app/actions/portfolio';
import { NavSlide } from '@/components/sidenav';
import { NavTop } from '@/components/topnav';

export default async function DashboardPage() {
  const verifiedUser = await requireVerifiedUser();
  const [insights, portfolio] = await Promise.all([getDashboardInsights(), getPortfolioTotals()]);
  const user = verifiedUser.user_metadata?.full_name || verifiedUser.email || 'User';
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className='flex flex-row'>
        <NavSlide/>
        <div>
          <h1 className="text-3xl font-bold">Welcome, <span className='text-primary'>{user}</span></h1>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{insights.totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assets & Investments</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(portfolio.assetValue + portfolio.investmentValue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <p className="mt-1 text-xs text-muted-foreground">Assets ₹{portfolio.assetValue.toLocaleString('en-IN')} · Investments ₹{portfolio.investmentValue.toLocaleString('en-IN')}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">+₹{insights.monthlyIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">-₹{insights.monthlyExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {insights.categoryChartData.length > 0 ? (
              <DashboardCharts data={insights.categoryChartData} />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No expenses this month.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

        </div>
      </div>
          </div>
  );
}

