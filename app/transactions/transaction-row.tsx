'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
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

type Account = { id: number; name: string };
type Category = {
  id: string;
  name: string;
  type: string;
  emoji?: string | null;
  color?: string;
  icon?: string;
};
type Transaction = {
  id: number;
  date: Date;
  notes: string | null;
  amount: number;
  accountId: number | null;
  categoryId: string | null;
  account: Account | null;
  category: Category | null;
};

interface TransactionRowProps {
  transaction: Transaction;
  accounts: Account[];
  categories: Category[];
}

export default function TransactionRow({ transaction, accounts, categories }: TransactionRowProps) {
  const [deletePending, setDeletePending] = useState(false);

  async function handleDelete() {
    setDeletePending(true);
    await deleteTransaction(transaction.id);
    setDeletePending(false);
  }

  const category = transaction.category;
  const isIncome = transaction.amount > 0;

  return (
    <TableRow key={transaction.id} className="hover:bg-muted/40 transition-colors">
      <TableCell className="font-medium text-xs sm:text-sm">
        {format(new Date(transaction.date), 'MMM d, yyyy')}
      </TableCell>
      <TableCell className="font-medium text-sm">
        {transaction.notes || (isIncome ? 'Income' : 'Expense')}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {transaction.account?.name || <span className="italic text-muted-foreground/70">Unassigned</span>}
      </TableCell>
      <TableCell>
        {category ? (
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
      <TableCell className={`text-right font-bold text-sm ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'}`}>
        {isIncome ? '+' : '-'}₹{Math.abs(transaction.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <TransactionFormModal
            accounts={accounts}
            categories={categories}
            transaction={transaction}
          />
          <AlertDialog>
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
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
}
