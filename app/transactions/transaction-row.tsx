'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import Link from 'next/link';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import TransactionFormModal from './transaction-form-modal';
import { deleteTransaction } from '@/app/actions/transactions';
import { deleteRecurringPayment } from '@/app/actions/recurring';

type Account = { id: number; name: string };
type Category = {
  id: string;
  name: string;
  type: string;
  emoji?: string | null;
  color?: string;
  icon?: string;
};
type Asset = {
  id: number;
  name: string;
  type: string;
};
type Investment = {
  id: number;
  name: string;
  type: string;
};
type Loan = { id: number; name: string; type: string };
type RecurringTransaction = { id: number; name: string; frequency: string };
type Transaction = {
  id: number;
  date: Date;
  notes: string | null;
  amount: number;
  accountId: number | null;
  categoryId: string | null;
  transactionType?: string | null;
  subType?: string | null;
  assetId?: number | null;
  investmentId?: number | null;
  loanId?: number | null;
  recurringTransactionId?: number | null;
  account: Account | null;
  category: Category | null;
  asset?: Asset | null;
  investment?: Investment | null;
  loan?: Loan | null;
  recurringTransaction?: RecurringTransaction | null;
};

interface TransactionRowProps {
  transaction: Transaction;
  accounts: Account[];
  categories: Category[];
  assets?: Asset[];
  investments?: Investment[];
}

export default function TransactionRow({
  transaction,
  accounts,
  categories,
  assets = [],
  investments = [],
}: TransactionRowProps) {
  const [deletePending, setDeletePending] = useState(false);

  async function handleDelete() {
    setDeletePending(true);
    await deleteTransaction(transaction.id);
    setDeletePending(false);
  }

  async function handleRecurringPaymentDelete() {
    setDeletePending(true);
    await deleteRecurringPayment(transaction.id);
    setDeletePending(false);
  }

  const category = transaction.category;
  const asset = transaction.asset;
  const investment = transaction.investment;
  const loan = transaction.loan;
  const recurring = transaction.recurringTransaction;
  const isIncome = transaction.amount > 0;

  return (
    <TableRow key={transaction.id} className="hover:bg-muted/40 transition-colors">
      <TableCell className="font-medium text-xs sm:text-sm whitespace-nowrap">
        {format(new Date(transaction.date), 'MMM d, yyyy')}
      </TableCell>
      <TableCell className="font-medium text-sm">
        <div className="flex flex-col">
          <span>{transaction.notes || (isIncome ? 'Income' : 'Expense')}</span>
          {transaction.subType && (
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              {transaction.subType}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
        {transaction.account?.name || <span className="italic text-muted-foreground/70">Unassigned</span>}
      </TableCell>
      <TableCell>
        {asset ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <span>💻</span>
            <span>{asset.name}</span>
          </span>
        ) : investment ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <span>📈</span>
            <span>{investment.name}</span>
          </span>
        ) : loan ? (
          <Link href={`/loans/${loan.id}`} className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-300">
            <span>🏦</span><span>{loan.name}</span>
          </Link>
        ) : recurring ? (
          <Link href={`/recurring`} className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 hover:bg-violet-100 dark:border-violet-900 dark:bg-violet-950/60 dark:text-violet-300"><span>🔁</span><span>{recurring.name}</span></Link>
        ) : category ? (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full shadow-2xs"
            style={{
              backgroundColor: category.color ? `${category.color}15` : isIncome ? '#22C55E15' : '#64748B15',
              color: category.color || (isIncome ? '#22C55E' : '#64748B'),
              border: `1px solid ${category.color ? `${category.color}30` : 'transparent'}`,
            }}
          >
            <span>{category.emoji || (isIncome ? '💰' : '💸')}</span>
            <span>{category.name}</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
            Uncategorized
          </span>
        )}
      </TableCell>
      <TableCell className={`text-right font-bold text-sm whitespace-nowrap ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'}`}>
        {isIncome ? '+' : '-'}₹{Math.abs(transaction.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </TableCell>
      <TableCell className="text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1">
          {!loan && !recurring && <TransactionFormModal
            accounts={accounts}
            categories={categories}
            assets={assets}
            investments={investments}
            transaction={transaction}
          />}
          {loan && <span className="text-xs text-muted-foreground">Manage from loan</span>}
          {recurring && <AlertDialog><AlertDialogTrigger render={<Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /><span className="sr-only">Delete recurring payment</span></Button>} /><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Mark this recurring payment as not paid?</AlertDialogTitle><AlertDialogDescription>This removes the automatic transaction and reverses its account balance effect. The recurring schedule stays active for future cycles.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Keep payment</AlertDialogCancel><AlertDialogAction onClick={handleRecurringPaymentDelete} disabled={deletePending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{deletePending ? 'Removing...' : 'Remove payment'}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>}
          {!loan && !recurring && <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="sr-only">Delete transaction</span>
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this transaction?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove this transaction log and adjust account balances accordingly.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={deletePending}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deletePending ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>}
        </div>
      </TableCell>
    </TableRow>
  );
}
