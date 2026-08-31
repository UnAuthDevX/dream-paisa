'use client';

import { useState } from 'react';
import { createRecurringTransaction, updateRecurringTransaction, deleteRecurringTransaction } from '@/app/actions/recurring';
import type { RecurringWithDetails } from '@/app/actions/recurring';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toLocalDateInputValue } from '@/lib/date';
import { PlusCircle, Pencil, Trash2, LoaderCircle } from 'lucide-react';

type Account = { id: number; name: string; balance: number };
type Category = { id: string; name: string };

type Props = {
  item?: RecurringWithDetails;
  accounts: Account[];
  categories?: Category[];
};

const TRANSACTION_TYPES = ['EXPENSE', 'INCOME'];
const FREQUENCIES = ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'];

export default function RecurringFormModal({ item, accounts, categories = [] }: Props) {
  const isEdit = !!item;
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState(item?.type ?? 'EXPENSE');
  const [frequency, setFrequency] = useState(item?.frequency ?? 'MONTHLY');
  const [accountId, setAccountId] = useState(item?.accountId?.toString() ?? accounts[0]?.id?.toString() ?? '');
  const [categoryId, setCategoryId] = useState(item?.categoryId ?? '');
  const [deleting, setDeleting] = useState(false);

  async function handleSubmit(formData: FormData) {
    if (pending) return;
    setPending(true);
    setError(null);

    formData.set('type', type);
    formData.set('frequency', frequency);
    formData.set('accountId', accountId);
    if (categoryId) formData.set('categoryId', categoryId);

    const result = isEdit
      ? await updateRecurringTransaction(item!.id, formData)
      : await createRecurringTransaction(formData);

    setPending(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setOpen(false);
    }
  }

  async function handleDelete() {
    if (deleting || !item) return;
    setDeleting(true);
    await deleteRecurringTransaction(item.id);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={isEdit ? (
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button className="rounded-2xl flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Recurring
          </Button>
        )} />

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Recurring Transaction' : 'New Recurring Transaction'}</DialogTitle>
          <DialogDescription>
            Set up automatic expense or income patterns (subscriptions, salaries, EMIs, etc.)
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="rec-name">Name</Label>
              <Input id="rec-name" name="name" defaultValue={item?.name} placeholder="e.g. Netflix, Salary" required />
            </div>

            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={type} onValueChange={(value) => setType(value ?? 'EXPENSE')}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Frequency</Label>
              <Select value={frequency} onValueChange={(value) => setFrequency(value ?? 'MONTHLY')}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rec-amount">Amount (₹)</Label>
              <Input id="rec-amount" name="amount" type="number" min="1" step="0.01"
                defaultValue={item?.amount} placeholder="e.g. 499" required />
            </div>

            <div className="space-y-1.5">
              <Label>Account</Label>
              <Select value={accountId} onValueChange={(value) => setAccountId(value ?? '')}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue>{(value) => accounts.find((account) => account.id.toString() === value)?.name ?? 'Select account'}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id.toString()}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {categories.length > 0 && (
              <div className="col-span-2 space-y-1.5">
                <Label>Category (optional)</Label>
                <Select value={categoryId} onValueChange={(value) => setCategoryId(value ?? '')}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue>{(value) => categories.find((category) => category.id === value)?.name ?? 'No category'}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="rec-start">Start Date</Label>
              <Input id="rec-start" name="startDate" type="date"
                defaultValue={item ? toLocalDateInputValue(new Date(item.startDate)) : toLocalDateInputValue()} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rec-end">End Date (optional)</Label>
              <Input id="rec-end" name="endDate" type="date"
                defaultValue={item?.endDate ? toLocalDateInputValue(new Date(item.endDate)) : toLocalDateInputValue()} />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="rec-notes">Notes (optional)</Label>
              <Textarea id="rec-notes" name="notes" defaultValue={item?.notes ?? ''} rows={2}
                className="rounded-xl resize-none" placeholder="e.g. Spotify family plan" />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            {isEdit && (
              <Button type="button" variant="destructive" size="sm" className="rounded-xl"
                onClick={handleDelete} disabled={deleting}>
                {deleting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1" />}
                Delete
              </Button>
            )}
            <Button type="submit" disabled={pending} className="flex-1 rounded-xl">
              {pending ? <LoaderCircle className="h-4 w-4 animate-spin mr-2" /> : null}
              {isEdit ? 'Save Changes' : 'Add Recurring'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
