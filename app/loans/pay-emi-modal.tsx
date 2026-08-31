'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, LoaderCircle } from 'lucide-react';
import { payLoanEMI } from '@/app/actions/loans';
import { toLocalDateInputValue } from '@/lib/date';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface AccountOption {
  id: number;
  name: string;
  balance: number;
}

interface PayEMIModalProps {
  loanId: number;
  loanName: string;
  defaultEMI: number;
  remainingPrincipal: number;
  accounts: AccountOption[];
}

export default function PayEMIModal({
  loanId,
  loanName,
  defaultEMI,
  remainingPrincipal,
  accounts,
}: PayEMIModalProps) {
  const [open, setOpen] = useState(false);
  const [accountId, setAccountId] = useState<string>(accounts[0]?.id.toString() || '');
  const [totalEMI, setTotalEMI] = useState<string>(defaultEMI.toString());
  const [principal, setPrincipal] = useState<string>((defaultEMI * 0.75).toFixed(2));
  const [interest, setInterest] = useState<string>((defaultEMI * 0.25).toFixed(2));
  const [date, setDate] = useState<string>(toLocalDateInputValue());
  const [notes, setNotes] = useState<string>(`EMI Payment - ${loanName}`);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleTotalChange(val: string) {
    setTotalEMI(val);
    const num = parseFloat(val) || 0;
    const p = Math.min(num, remainingPrincipal);
    const i = Math.max(0, num - p);
    setPrincipal(p.toFixed(2));
    setInterest(i.toFixed(2));
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    const accNum = parseInt(accountId, 10);
    const pNum = parseFloat(principal) || 0;
    const iNum = parseFloat(interest) || 0;

    if (!accNum) {
      setError('Please select an account to pay from.');
      return;
    }
    if (pNum + iNum <= 0) {
      setError('Total EMI amount must be positive.');
      return;
    }

    setPending(true);
    setError(null);

    try {
      const res = await payLoanEMI({
        loanId,
        accountId: accNum,
        principalComponent: pNum,
        interestComponent: iNum,
        date,
        notes,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        setOpen(false);
      }
    } catch {
      setError('Failed to process EMI payment.');
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" className="text-xs flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white">
            <CreditCard className="h-3.5 w-3.5" /> Pay EMI
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pay Loan EMI</DialogTitle>
          <DialogDescription>
            Record EMI payment for <strong>{loanName}</strong> with principal vs. interest breakdown.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handlePay} className="space-y-3.5 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="pay-account">Pay from Account</Label>
            <select
              id="pay-account"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
              required
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} (Balance: ₹{acc.balance.toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="total-emi">Total EMI Amount (₹)</Label>
            <Input
              id="total-emi"
              type="number"
              step="0.01"
              min="0"
              value={totalEMI}
              onChange={(e) => handleTotalChange(e.target.value)}
              className="font-bold text-base"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-xl">
            <div className="space-y-1">
              <Label htmlFor="principal-split" className="text-xs text-emerald-600 font-semibold">
                Principal Paid (₹)
              </Label>
              <Input
                id="principal-split"
                type="number"
                step="0.01"
                min="0"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                className="text-xs font-semibold"
                required
              />
              <p className="text-[10px] text-muted-foreground">Reduces liability</p>
            </div>

            <div className="space-y-1">
              <Label htmlFor="interest-split" className="text-xs text-rose-600 font-semibold">
                Interest Paid (₹)
              </Label>
              <Input
                id="interest-split"
                type="number"
                step="0.01"
                min="0"
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                className="text-xs font-semibold"
                required
              />
              <p className="text-[10px] text-muted-foreground">Pure expense</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="payment-date">Payment Date</Label>
            <Input
              id="payment-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="payment-notes">Notes</Label>
            <Input
              id="payment-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error && <p className="text-xs text-destructive font-medium">{error}</p>}

          <DialogFooter className="mt-2">
            <Button type="submit" disabled={pending} className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white">
              {pending ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : 'Confirm EMI Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
