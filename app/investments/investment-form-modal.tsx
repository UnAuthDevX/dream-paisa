'use client';

import { useRef, useState } from 'react';
import { LoaderCircle, Pencil, PlusCircle, Trash2 } from 'lucide-react';
import { createInvestment, updateInvestment, deleteInvestment } from '@/app/actions/portfolio';
import { SuccessDialog } from '@/components/success-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Investment = {
  id: number;
  name: string;
  type: string;
  amount: number;
  quantity: number | null;
  dateAcquired: Date | null;
};

interface InvestmentFormModalProps {
  investment?: Investment;
}

export default function InvestmentFormModal({ investment }: InvestmentFormModalProps = {}) {
  const isEditing = !!investment;
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [deletePending, setDeletePending] = useState(false);
  const submissionLock = useRef(false);
  const deletionLock = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ name: string; value: number } | null>(null);

  const defaultDate = investment?.dateAcquired
    ? new Date(investment.dateAcquired).toISOString().split('T')[0]
    : '';

  async function submit(formData: FormData) {
    if (submissionLock.current) return;
    submissionLock.current = true;
    setPending(true);
    setError(null);
    try {
      const result = isEditing
        ? await updateInvestment(investment!.id, formData)
        : await createInvestment(formData);
      if (result?.error) setError(result.error);
      else if (result?.success && result.item) { setOpen(false); setSuccess(result.item); }
      else setError('Unable to save investment. Please try again.');
    } catch {
      setError('Unable to save investment. Please try again.');
    } finally {
      setPending(false);
      submissionLock.current = false;
    }
  }

  async function handleDelete() {
    if (deletionLock.current) return;
    deletionLock.current = true;
    setDeletePending(true);
    try {
      await deleteInvestment(investment!.id);
    } finally {
      setDeletePending(false);
      deletionLock.current = false;
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            isEditing ? (
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit investment</span>
              </Button>
            ) : (
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />Add Investment
              </Button>
            )
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Investment' : 'Add Investment'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update the details for this investment.' : 'Track mutual funds, stocks, deposits, and more.'}
            </DialogDescription>
          </DialogHeader>
          <form action={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="investment-name">Name</Label>
              <Input id="investment-name" name="name" placeholder="e.g. Index Fund" defaultValue={investment?.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="investment-type">Type</Label>
              <Input id="investment-type" name="type" placeholder="e.g. Mutual Fund" defaultValue={investment?.type} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="investment-amount">Invested amount (₹)</Label>
              <Input id="investment-amount" name="amount" type="number" min="0" step="0.01" defaultValue={investment?.amount} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="investment-quantity">Quantity (optional)</Label>
              <Input id="investment-quantity" name="quantity" type="number" min="0" step="any" defaultValue={investment?.quantity ?? ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="investment-date">Purchase date</Label>
              <Input id="investment-date" name="dateAcquired" type="date" defaultValue={defaultDate} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : isEditing ? 'Update Investment' : 'Save Investment'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>

        <SuccessDialog
          open={!!success}
          onDone={() => setSuccess(null)}
          title={isEditing ? '✅ Investment Updated!' : '✅ Investment Added Successfully!'}
        >
          <p>{success?.name}</p>
          <p>Invested: ₹{success?.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
        </SuccessDialog>
      </Dialog>

      {isEditing && (
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete investment</span>
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete &quot;{investment!.name}&quot;?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this investment from your portfolio. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deletePending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deletePending ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : 'Delete Investment'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
