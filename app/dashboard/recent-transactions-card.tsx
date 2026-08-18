import Link from 'next/link';
import { format } from 'date-fns';
import { ChevronRight, ArrowUpRight, ArrowDownLeft, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type TransactionItem = {
  id: number;
  amount: number;
  date: Date;
  notes: string | null;
  account: { name: string } | null;
  category: {
    name: string;
    type: string;
    icon: string;
    emoji: string | null;
    color: string;
  } | null;
};

// Fallback color themes for categories
const CATEGORY_STYLES: Record<string, { bg: string; text: string; badgeBg: string; badgeText: string }> = {
  Shopping: { bg: 'bg-emerald-500', text: 'text-white', badgeBg: 'bg-red-50 dark:bg-red-950/40', badgeText: 'text-red-500 dark:text-red-400' },
  Entertainment: { bg: 'bg-emerald-500', text: 'text-white', badgeBg: 'bg-blue-50 dark:bg-blue-950/40', badgeText: 'text-blue-500 dark:text-blue-400' },
  Income: { bg: 'bg-blue-600', text: 'text-white', badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40', badgeText: 'text-emerald-600 dark:text-emerald-400' },
  Salary: { bg: 'bg-blue-600', text: 'text-white', badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40', badgeText: 'text-emerald-600 dark:text-emerald-400' },
  'Food & Dining': { bg: 'bg-amber-500', text: 'text-white', badgeBg: 'bg-amber-50 dark:bg-amber-950/40', badgeText: 'text-amber-600 dark:text-amber-400' },
  Transport: { bg: 'bg-indigo-600', text: 'text-white', badgeBg: 'bg-purple-50 dark:bg-purple-950/40', badgeText: 'text-purple-600 dark:text-purple-400' },
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
              const catName = t.category?.name || (isIncome ? 'Income' : 'Expense');
              const style = CATEGORY_STYLES[catName] || {
                bg: isIncome ? 'bg-emerald-500' : 'bg-slate-700',
                text: 'text-white',
                badgeBg: isIncome ? 'bg-emerald-50 dark:bg-emerald-950/40' : 'bg-slate-100 dark:bg-slate-800',
                badgeText: isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300',
              };

              const title = t.notes || t.category?.name || t.account?.name || (isIncome ? 'Income' : 'Expense');
              const formattedDate = format(new Date(t.date), 'MMM dd, yyyy • hh:mm a');
              const categoryColor = t.category?.color || (isIncome ? '#22C55E' : '#64748B');

              return (
                <div key={t.id} className="py-3.5 flex items-center justify-between gap-3 hover:bg-muted/30 px-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Circle Icon */}
                    <div
                      className="h-11 w-11 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm"
                      style={{ backgroundColor: categoryColor }}
                    >
                      {t.category?.emoji ? (
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
