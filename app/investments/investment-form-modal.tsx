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
import { toLocalDateInputValue } from '@/lib/date';

type Investment = {
  id: number;
  name: string;
  type: string;
  investedAmount?: number;
  currentValue?: number;
  amount?: number;
  quantity?: number | null;
  dateAcquired?: Date | null;
};

interface InvestmentFormModalProps {
  investment?: Investment;
}

const COMMON_INVESTMENT_TYPES = [
  'Mutual Funds',
  'Stocks',
  'Sovereign Gold Bond',
  'Fixed Deposit',
  'Crypto',
  'Bonds',
  'Real Estate / REITs',
  'Other',
];

export default function InvestmentFormModal({ investment }: InvestmentFormModalProps = {}) {
  const isEditing = !!investment;
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [deletePending, setDeletePending] = useState(false);
  const submissionLock = useRef(false);
  const deletionLock = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ name: string; value: number } | null>(null);

  const initialInvested = investment?.investedAmount ?? (investment?.amount ?? '');
  const initialCurrent = investment?.currentValue ?? (investment?.amount ?? '');

  const [investedAmount, setInvestedAmount] = useState<string | number>(initialInvested);
  const [currentValue, setCurrentValue] = useState<string | number>(initialCurrent);

  const defaultDate = investment?.dateAcquired
    ? toLocalDateInputValue(new Date(investment.dateAcquired))
    : toLocalDateInputValue();

  function handleInvestedChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setInvestedAmount(val);
    if (!isEditing && (!currentValue || currentValue === investedAmount)) {
      setCurrentValue(val);
    }
  }

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
      else if (result?.success && result.item) {
        setOpen(false);
        setSuccess(result.item);
      } else setError('Unable to save investment. Please try again.');
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
                <span className="sr-only">Edit investment</span>
              </Button>
            ) : (
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Investment
              </Button>
            )
          }
        />
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Investment' : 'Add Investment'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update investment details, capital deployed, or market valuation.'
                : 'Track mutual funds, stocks, gold, and deposits.'}
            </DialogDescription>
          </DialogHeader>
          <form action={submit} className="space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="investment-name">Investment Name</Label>
              <Input
                id="investment-name"
                name="name"
                placeholder="e.g. Nifty 50 Index Fund, Sovereign Gold"
                defaultValue={investment?.name}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="investment-type">Asset Class / Type</Label>
              <Input
                id="investment-type"
                name="type"
                placeholder="e.g. Mutual Fund, Stocks, SGB"
                defaultValue={investment?.type || 'Mutual Funds'}
                list="investment-types"
                required
              />
              <datalist id="investment-types">
                {COMMON_INVESTMENT_TYPES.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="invested-amount">Invested Capital (₹)</Label>
                <Input
                  id="invested-amount"
                  name="investedAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={investedAmount}
                  onChange={handleInvestedChange}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="current-val">Current Value (₹)</Label>
                <Input
                  id="current-val"
                  name="currentValue"
                  type="number"
                  min="0"
                  step="0.01"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="investment-quantity">Quantity / Units (optional)</Label>
                <Input
                  id="investment-quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  step="any"
                  defaultValue={investment?.quantity ?? ''}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="investment-date">Acquisition Date</Label>
                <Input
                  id="investment-date"
                  name="dateAcquired"
                  type="date"
                  defaultValue={defaultDate}
                />
              </div>
            </div>

            {error && <p className="text-xs text-destructive font-medium">{error}</p>}

            <DialogFooter className="mt-2">
              <Button type="submit" disabled={pending} className="w-full sm:w-auto">
                {pending ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : isEditing ? (
                  'Update Investment'
                ) : (
                  'Save Investment'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>

        <SuccessDialog
          open={!!success}
          onDone={() => setSuccess(null)}
          title={isEditing ? '✅ Investment Updated!' : '✅ Investment Added Successfully!'}
        >
          <p className="font-semibold text-lg">{success?.name}</p>
          <p className="text-muted-foreground text-sm">
            Current Value: ₹{success?.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
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
                {deletePending ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                  </>
                ) : (
                  'Delete Investment'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
