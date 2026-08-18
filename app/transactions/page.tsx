import { NavSlide } from "@/components/sidenav";
import { Search, Calendar, FilterX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TransactionFormModal from "./transaction-form-modal";
import TransactionRow from "./transaction-row";
import { getTransactions, getCategories } from "@/app/actions/transactions";
import { getAccounts } from "@/app/actions/accounts";
import { requireVerifiedUser } from "@/lib/auth";

type Props = {
  searchParams: Promise<{
    search?: string;
    account?: string;
    category?: string;
    type?: string;
    min?: string;
    date?: string;
    allTime?: string;
  }>;
};

export default async function TransactionsPage({
  searchParams,
}: Props) {
  await requireVerifiedUser();

  const params = await searchParams;

  const [transactionsResult, accounts, categories] = await Promise.all([
    getTransactions(params),
    getAccounts(),
    getCategories(),
  ]);

  if ("error" in transactionsResult) {
    throw new Error(transactionsResult.error);
  }

  const transactions = transactionsResult.transactions;
  const isFiltered = !!(params.search || params.account || params.category || params.type || params.date || params.min || params.allTime === 'true');
  const isDefaultCurrentMonth = !isFiltered;

  const currentMonthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="flex min-h-screen bg-background">
      <NavSlide />

      <main className="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6 overflow-x-hidden pb-24 lg:pb-6 pt-16 lg:pt-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Transactions</h1>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Manage and track all your income and expenses.
            </p>
          </div>

          <div className="shrink-0">
            <TransactionFormModal
              accounts={accounts}
              categories={categories}
            />
          </div>
        </div>

        {/* Filter Indicator Banner */}
        {isDefaultCurrentMonth && (
          <div className="flex items-center justify-between bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 p-3 rounded-xl text-xs sm:text-sm text-blue-700 dark:text-blue-300">
            <div className="flex items-center gap-2 font-medium">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span>Showing transactions for current month: <strong>{currentMonthName}</strong></span>
            </div>
            <Link
              href="/transactions?allTime=true"
              className="text-xs font-semibold underline hover:text-blue-800 dark:hover:text-blue-200"
            >
              View All Time
            </Link>
          </div>
        )}

        {/* Search & Filters */}
        <form method="GET" className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                name="search"
                defaultValue={params.search}
                placeholder="Search notes or amount..."
                className="pl-9"
              />
            </div>

            <select
              name="account"
              defaultValue={params.account ?? ""}
              className="h-9 rounded-lg border bg-background px-3 text-sm font-medium min-w-[130px] flex-1 sm:flex-none"
            >
              <option value="">All Accounts</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>

            <select
              name="category"
              defaultValue={params.category ?? ""}
              className="h-9 rounded-lg border bg-background px-3 text-sm font-medium min-w-[130px] flex-1 sm:flex-none"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.emoji ? `${category.emoji} ` : ''}{category.name}
                </option>
              ))}
            </select>

            <select
              name="type"
              defaultValue={params.type ?? ""}
              className="h-9 rounded-lg border bg-background px-3 text-sm font-medium min-w-[110px] flex-1 sm:flex-none"
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            <Input
              type="date"
              name="date"
              defaultValue={params.date}
              className="h-9 w-auto flex-1 sm:flex-none"
            />

            <Input
              type="number"
              name="min"
              defaultValue={params.min}
              placeholder="Min ₹"
              className="h-9 w-[100px] flex-1 sm:flex-none"
            />

            <div className="flex gap-2">
              <Button type="submit" size="sm">
                Apply Filters
              </Button>

              {isFiltered && (
                <Button variant="outline" size="sm" render={<Link href="/transactions" />}>
                  <FilterX className="h-4 w-4 mr-1" /> Clear
                </Button>
              )}
            </div>
          </div>
        </form>

        {/* Table — horizontally scrollable on mobile */}
        <div className="rounded-2xl border bg-card shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[640px]">
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-bold">Date</TableHead>
                  <TableHead className="font-bold">Description / Notes</TableHead>
                  <TableHead className="font-bold">Account</TableHead>
                  <TableHead className="font-bold">Category</TableHead>
                  <TableHead className="text-right font-bold">Amount</TableHead>
                  <TableHead className="text-right font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-12 text-center text-muted-foreground"
                    >
                      No transactions found for the selected criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction) => (
                    <TransactionRow
                      key={transaction.id}
                      transaction={transaction}
                      accounts={accounts}
                      categories={categories}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
}