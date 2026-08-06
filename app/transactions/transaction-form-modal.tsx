'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle } from 'lucide-react';
import { createTransaction } from '@/app/actions/transactions';
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

type Account = { id: number, name: string };
type Category = { id: number, name: string, type: string };

export default function TransactionFormModal({ 
  accounts, 
  categories 
}: { 
  accounts: Account[], 
  categories: Category[] 
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ amount: number; notes: string } | null>(null);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await createTransaction(formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    } else if (result?.success && result.transaction) {
      setPending(false);
      setOpen(false);
      setSuccess(result.transaction);
    } else {
      setPending(false);
      setError('Unable to save transaction. Please try again.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button disabled={accounts.length === 0}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Transaction
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>
            Log a new expense or income. Use negative amount for expenses.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="accountId">Account</Label>
              <Select name="accountId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(acc => (
                    <SelectItem key={acc.id} value={acc.id.toString()}>{acc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <Select name="categoryId">
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name} ({cat.type})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input id="amount" name="amount" type="number" step="0.01" placeholder="-15.50" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" name="notes" placeholder="e.g. Lunch at cafe" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      <SuccessDialog
        open={success !== null}
        onDone={() => setSuccess(null)}
        title="✅ Transaction Added Successfully!"
      >
        <p>₹{Math.abs(success?.amount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })} · {success?.amount && success.amount < 0 ? 'Expense' : 'Income'}</p>
        {success?.notes && <p>{success.notes}</p>}
      </SuccessDialog>
    </Dialog>
  );
}
