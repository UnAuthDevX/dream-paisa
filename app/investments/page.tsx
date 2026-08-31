import { getInvestments, getPortfolioTotals } from '@/app/actions/portfolio';
import { requireVerifiedUser } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import InvestmentFormModal from './investment-form-modal';
import { NavSlide } from '@/components/sidenav';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Wallet, PieChart } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

export const metadata = { title: 'Investments', description: 'Track portfolio value, invested capital, and investment returns.' };

export default async function InvestmentsPage() {
  await requireVerifiedUser();
  const [investments, totals] = await Promise.all([
    getInvestments(),
    getPortfolioTotals(),
  ]);

  const totalGainLoss = totals.investmentValue - totals.investedAmount;
  const totalGainLossPercentage =
    totals.investedAmount > 0 ? (totalGainLoss / totals.investedAmount) * 100 : 0;

  return (
    <div className="flex min-h-screen bg-background">
      <NavSlide />

      <main className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-x-hidden pb-24 lg:pb-6 pt-16 lg:pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Investment Portfolio</h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
              Monitor your wealth multipliers, mutual funds, stocks, and returns.
            </p>
          </div>
          <InvestmentFormModal />
        </div>

        {/* Portfolio Overview Summary Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
          <Card className="rounded-2xl shadow-xs border-indigo-100 dark:border-indigo-950/60 bg-indigo-50/30 dark:bg-indigo-950/20">
            <CardHeader className="pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center justify-between">
                <span>Total Portfolio Value</span>
                <TrendingUp className="h-4 w-4 text-indigo-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                ₹{totals.investmentValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Current market valuation</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-xs">
            <CardHeader className="pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center justify-between">
                <span>Capital Invested</span>
                <Wallet className="h-4 w-4 text-slate-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                ₹{totals.investedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Total principal deployed</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-xs">
            <CardHeader className="pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center justify-between">
                <span>Total Returns (P&amp;L)</span>
                {totalGainLoss >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-rose-600" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-xl sm:text-2xl font-bold ${
                  totalGainLoss >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {totalGainLoss >= 0 ? '+' : ''}₹{totalGainLoss.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {totalGainLoss >= 0 ? '+' : ''}{totalGainLossPercentage.toFixed(1)}% overall gain
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Investment Cards Grid */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {investments.length ? (
            investments.map((investment) => {
              const isProfit = investment.gainLoss >= 0;
              return (
                <Card key={investment.id} className="rounded-2xl shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800 transition-all flex flex-col justify-between">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle className="text-base sm:text-lg font-bold"><Link href={`/investments/${investment.id}`} className="hover:text-primary">{investment.name}</Link></CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">
                          {investment.type}
                        </span>
                        {investment.quantity !== null && investment.quantity > 0 && (
                          <span className="text-[11px] text-muted-foreground">
                            {investment.quantity} units
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <InvestmentFormModal investment={investment} />
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-2">
                    <div className="grid grid-cols-2 gap-2 p-2.5 bg-muted/40 rounded-xl">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Current Value</p>
                        <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                          ₹{investment.currentValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Invested</p>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                          ₹{investment.investedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
                      <span
                        className={`font-semibold flex items-center gap-1 ${
                          isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {isProfit ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                        {isProfit ? '+' : ''}₹{Math.abs(investment.gainLoss).toLocaleString('en-IN')} ({investment.gainLossPercentage.toFixed(1)}%)
                      </span>

                      <span className="text-[11px] text-muted-foreground">
                        {investment.dateAcquired
                          ? `Added ${format(new Date(investment.dateAcquired), 'MMM yyyy')}`
                          : 'No date'}
                      </span>
                    </div>

                    <Link href={`/investments/${investment.id}`} className="text-xs font-semibold text-primary hover:underline">View history</Link>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full rounded-2xl border bg-muted/30 p-12 text-center text-muted-foreground space-y-3">
              <PieChart className="h-10 w-10 mx-auto text-muted-foreground/60" />
              <div>
                <p className="font-semibold text-base text-foreground">No investments logged yet</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                  Track your mutual funds, equity stocks, fixed deposits, gold bonds, and crypto to observe total portfolio growth.
                </p>
              </div>
              <div className="pt-2">
                <InvestmentFormModal />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
