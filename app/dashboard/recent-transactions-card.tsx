import Link from 'next/link';
import { format } from 'date-fns';
import { ChevronRight, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type TransactionItem = {
  id: number;
  amount: number;
  date: Date;
  notes: string | null;
  transactionType?: string | null;
  subType?: string | null;
  account: { name: string } | null;
  category: {
    name: string;
    type: string;
    icon: string;
    emoji: string | null;
    color: string;
  } | null;
  asset?: { name: string; type: string } | null;
  investment?: { name: string; type: string } | null;
  loan?: { id: number; name: string; type: string } | null;
  recurringTransaction?: { id: number; name: string; frequency: string } | null;
};

export default function RecentTransactionsCard({ transactions }: { transactions: TransactionItem[] }) {
  return (
    <Card className="shadow-sm border-border/80 rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-bold">Recent Transactions</CardTitle>
        <Link
          href="/transactions"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-0.5"
        >
          View All <ChevronRight className="h-4 w-4" />
        </Link>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">No recent transactions recorded.</div>
        ) : (
          <div className="divide-y divide-border/40">
            {transactions.map((t) => {
              const isIncome = t.amount > 0;
              const catName = t.asset?.name
                ? `💻 ${t.asset.name}`
                : t.investment?.name
                ? `📈 ${t.investment.name}`
                : t.loan?.name
                ? `🏦 ${t.loan.name}`
                : t.recurringTransaction?.name
                ? `🔁 ${t.recurringTransaction.name}`
                : t.category?.name || (isIncome ? 'Income' : 'Expense');

              const title = t.notes || (t.asset ? `Asset: ${t.asset.name}` : t.investment ? `Investment: ${t.investment.name}` : t.loan ? `Loan payment: ${t.loan.name}` : t.recurringTransaction ? `Recurring: ${t.recurringTransaction.name}` : (isIncome ? 'Income' : 'Expense'));
              const formattedDate = format(new Date(t.date), 'MMM dd, yyyy • hh:mm a');
              const categoryColor = t.asset
                ? '#2563EB'
                : t.investment
                ? '#4F46E5'
                : t.loan ? '#D97706' : t.recurringTransaction ? '#7C3AED' : t.category?.color || (isIncome ? '#22C55E' : '#64748B');

              return (
                <div key={t.id} className="py-3.5 flex items-center justify-between gap-3 hover:bg-muted/30 px-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Circle Icon */}
                    <div
                      className="h-11 w-11 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm"
                      style={{ backgroundColor: categoryColor }}
                    >
                      {t.asset ? (
                        <span className="text-xl">💻</span>
                      ) : t.investment ? (
                        <span className="text-xl">📈</span>
                      ) : t.loan ? (
                        <span className="text-xl">🏦</span>
                      ) : t.recurringTransaction ? (
                        <span className="text-xl">🔁</span>
                      ) : t.category?.emoji ? (
                        <span className="text-xl">{t.category.emoji}</span>
                      ) : isIncome ? (
                        <ArrowUpRight className="h-5 w-5 stroke-[2.5]" />
                      ) : (
                        <ArrowDownLeft className="h-5 w-5 stroke-[2.5]" />
                      )}
                    </div>

                    {/* Title and Date */}
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate text-foreground">{title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{formattedDate}</p>
                    </div>
                  </div>

                  {/* Category Pill & Amount */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className="hidden sm:inline-block px-3 py-1 text-xs font-medium rounded-full"
                      style={{
                        backgroundColor: `${categoryColor}15`,
                        color: categoryColor,
                      }}
                    >
                      {catName}
                    </span>

                    <span
                      className={`font-bold text-sm text-right ${
                        isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {isIncome ? `+ ₹${t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : `- ₹${Math.abs(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
