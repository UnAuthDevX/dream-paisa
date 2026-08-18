'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoaderCircle, Pencil, PlusCircle, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { createTransaction, updateTransaction } from '@/app/actions/transactions';
import { SuccessDialog } from '@/components/success-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Account = { id: number; name: string };
type Category = {
  id: string;
  name: string;
  type: string;
  icon?: string;
  emoji?: string | null;
  color?: string;
  description?: string | null;
};
type ExistingTransaction = {
  id: number;
  accountId: number | null;
  categoryId: string | null;
  amount: number;
  date: Date;
  notes: string | null;
};

interface TransactionFormModalProps {
  accounts: Account[];
  categories: Category[];
  transaction?: ExistingTransaction;
}

export default function TransactionFormModal({
  accounts,
  categories,
  transaction,
}: TransactionFormModalProps) {
  const isEditing = !!transaction;
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const submissionLock = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ amount: number; notes: string } | null>(null);

  const initialTxType = transaction ? (transaction.amount > 0 ? 'Income' : 'Expense') : 'Expense';
  const [txType, setTxType] = useState<'Expense' | 'Income'>(initialTxType);

  const defaultDate = transaction
    ? new Date(transaction.date).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  const defaultAmount = transaction ? Math.abs(transaction.amount) : '';

  // Filter categories by selected transaction type (Income vs Expense)
  const filteredCategories = categories.filter(cat => cat.type.toLowerCase() === txType.toLowerCase());

  async function handleSubmit(formData: FormData) {
    if (submissionLock.current) return;
    submissionLock.current = true;
    setPending(true);
    setError(null);

    const rawAmountStr = formData.get('amount') as string;
    const rawAmount = Math.abs(parseFloat(rawAmountStr));
    if (isNaN(rawAmount) || rawAmount === 0) {
      setError('Please enter a valid amount.');
      setPending(false);
      submissionLock.current = false;
      return;
    }

    const finalAmount = txType === 'Expense' ? -rawAmount : rawAmount;
    formData.set('amount', finalAmount.toString());

    try {
      const result = isEditing
        ? await updateTransaction(transaction!.id, formData)
        : await createTransaction(formData);

      if (result?.error) setError(result.error);
      else if (result?.success && result.transaction) {
        setOpen(false);
        setSuccess(result.transaction);
      } else setError('Unable to save transaction. Please try again.');
    } catch {
      setError('Unable to save transaction. Please try again.');
    } finally {
      setPending(false);
      submissionLock.current = false;
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            isEditing ? (
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Pencil className="h-3.5 w-3.5" />
                <span className="sr-only">Edit transaction</span>
              </Button>
            ) : (
              <Button disabled={accounts.length === 0}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Transaction
              </Button>
            )
          }
        />
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update transaction details. Account balance will automatically adjust.'
                : 'Log an income or expense transaction.'}
            </DialogDescription>
          </DialogHeader>

          {/* Type Toggle: Expense vs Income */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl">
            <button
              type="button"
              onClick={() => setTxType('Expense')}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-sm font-semibold rounded-lg transition-all ${
                txType === 'Expense'
                  ? 'bg-destructive text-destructive-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ArrowDownCircle className="h-4 w-4" /> Expense
            </button>
            <button
              type="button"
              onClick={() => setTxType('Income')}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-sm font-semibold rounded-lg transition-all ${
                txType === 'Income'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ArrowUpCircle className="h-4 w-4" /> Income
            </button>
          </div>

          <form action={handleSubmit}>
            <div className="grid gap-4 py-3">
              <div className="space-y-2">
                <Label htmlFor="accountId">Account</Label>
                <Select
                  name="accountId"
                  required
                  defaultValue={transaction?.accountId?.toString()}
                  items={accounts.map((account) => ({ label: account.name, value: account.id.toString() }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {(value) => accounts.find((account) => account.id.toString() === value)?.name ?? 'Select account'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id.toString()}>
                        {acc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                <Select
                  name="categoryId"
                  defaultValue={transaction?.categoryId ?? undefined}
                  items={filteredCategories.map((category) => ({ label: category.name, value: category.id }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {(value) => filteredCategories.find((category) => category.id === value)?.name ?? 'Select category'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center gap-2">
                          <span className="text-base">{cat.emoji || '🏷️'}</span>
                          <span>{cat.name}</span>
                          {cat.color && (
                            <span
                              className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-semibold"
                              style={{
                                backgroundColor: `${cat.color}20`,
                                color: cat.color,
                              }}
                            >
                              {cat.type}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground font-semibold">₹</span>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    defaultValue={defaultAmount}
                    className="pl-7"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" defaultValue={defaultDate} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes / Description</Label>
                <Input id="notes" name="notes" placeholder="e.g. Salary credited, Grocery shopping" defaultValue={transaction?.notes ?? ''} />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <DialogFooter className="mt-2">
              <Button type="submit" disabled={pending} className={txType === 'Income' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}>
                {pending ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : isEditing ? 'Update Transaction' : `Save ${txType}`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <SuccessDialog
        open={success !== null}
        onDone={() => setSuccess(null)}
        title={isEditing ? '✅ Transaction Updated!' : '✅ Transaction Logged Successfully!'}
      >
        <p className="font-semibold text-lg">
          ₹{Math.abs(success?.amount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })} · {success?.amount && success.amount > 0 ? 'Income' : 'Expense'}
        </p>
        {success?.notes && <p className="text-muted-foreground text-sm">{success.notes}</p>}
      </SuccessDialog>
    </>
  );
}
