'use client';

import { useRef, useState } from 'react';
import { LoaderCircle, Pencil, PlusCircle, Trash2 } from 'lucide-react';
import { createLoan, updateLoan, deleteLoan } from '@/app/actions/loans';
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
import { toLocalDateInputValue } from '@/lib/date';

type Loan = {
  id: number;
  name: string;
  type: string;
  lender: string | null;
  principalAmount: number;
  interestRate: number;
  tenureMonths: number;
  startDate: Date;
  emiAmount: number;
  notes: string | null;
};

const LOAN_TYPES = [
  'Personal Loan',
  'Home Loan',
  'Vehicle Loan',
  'Education Loan',
  'Credit Card',
  'Other Liability',
];

export default function LoanFormModal({ loan }: { loan?: Loan } = {}) {
  const isEditing = !!loan;
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [deletePending, setDeletePending] = useState(false);
  const submissionLock = useRef(false);
  const deletionLock = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ name: string } | null>(null);

  const defaultDate = loan?.startDate
    ? toLocalDateInputValue(new Date(loan.startDate))
    : toLocalDateInputValue();

  async function submit(formData: FormData) {
    if (submissionLock.current) return;
    submissionLock.current = true;
    setPending(true);
    setError(null);
    try {
      const result = isEditing
        ? await updateLoan(loan!.id, formData)
        : await createLoan(formData);

      if (result?.error) setError(result.error);
      else if (result?.success) {
        setOpen(false);
        setSuccess({ name: (formData.get('name') as string) || 'Loan' });
      } else setError('Unable to save loan.');
    } catch {
      setError('Unable to save loan.');
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
      await deleteLoan(loan!.id);
      setOpen(false);
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
                <span className="sr-only">Edit loan</span>
              </Button>
            ) : (
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Loan / Liability
              </Button>
            )
          }
        />
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Loan' : 'Add Loan / Liability'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update your loan terms and EMI.' : 'Track borrowed capital, interest rate, and EMI repayment schedule.'}
            </DialogDescription>
          </DialogHeader>
          <form action={submit} className="space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="loan-name">Loan Name</Label>
              <Input
                id="loan-name"
                name="name"
                placeholder="e.g. Home Loan, HDFC Car Loan"
                defaultValue={loan?.name}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="loan-type">Loan Type</Label>
                <Input
                  id="loan-type"
                  name="type"
                  placeholder="e.g. Home Loan"
                  defaultValue={loan?.type || 'Personal Loan'}
                  list="loan-types"
                  required
                />
                <datalist id="loan-types">
                  {LOAN_TYPES.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="loan-lender">Lender (optional)</Label>
                <Input
                  id="loan-lender"
                  name="lender"
                  placeholder="e.g. HDFC, SBI, Friend"
                  defaultValue={loan?.lender ?? ''}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="principal-amount">Principal Amount (₹)</Label>
                <Input
                  id="principal-amount"
                  name="principalAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={loan?.principalAmount}
                  placeholder="500000"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="emi-amount">Monthly EMI (₹)</Label>
                <Input
                  id="emi-amount"
                  name="emiAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={loan?.emiAmount}
                  placeholder="12500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="interest-rate">Interest Rate (% p.a.)</Label>
                <Input
                  id="interest-rate"
                  name="interestRate"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={loan?.interestRate ?? 8.5}
                  placeholder="8.5"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tenure-months">Tenure (Months)</Label>
                <Input
                  id="tenure-months"
                  name="tenureMonths"
                  type="number"
                  min="1"
                  defaultValue={loan?.tenureMonths ?? 36}
                  placeholder="36"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="start-date">Loan Start Date</Label>
              <Input
                id="start-date"
                name="startDate"
                type="date"
                defaultValue={defaultDate}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="loan-notes">Notes (optional)</Label>
              <Input
                id="loan-notes"
                name="notes"
                placeholder="Account number, floating rate terms..."
                defaultValue={loan?.notes ?? ''}
              />
            </div>

            {error && <p className="text-xs text-destructive font-medium">{error}</p>}

            <DialogFooter className="mt-2">
              <Button type="submit" disabled={pending} className="w-full sm:w-auto">
                {pending ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : isEditing ? (
                  'Update Loan'
                ) : (
                  'Save Loan'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>

        <SuccessDialog
          open={!!success}
          onDone={() => setSuccess(null)}
          title={isEditing ? '✅ Loan Updated!' : '✅ Loan Saved Successfully!'}
        >
          <p className="font-semibold text-lg">{success?.name}</p>
        </SuccessDialog>
      </Dialog>

      {isEditing && (
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete loan</span>
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete &quot;{loan!.name}&quot;?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove this loan record and its history.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deletePending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deletePending ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                  </>
                ) : (
                  'Delete Loan'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
