'use client';

import { useState } from 'react';
import { payInsurancePremium } from '@/app/actions/insurance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { CreditCard, LoaderCircle } from 'lucide-react';
import { toLocalDateInputValue } from '@/lib/date';

type Account = { id: number; name: string; balance: number };

type Props = {
  insuranceId: number;
  policyName: string;
  defaultPremium: number;
  accounts: Account[];
};

export default function PayPremiumModal({ insuranceId, policyName, defaultPremium, accounts }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountId, setAccountId] = useState(accounts[0]?.id?.toString() ?? '');

  async function handleSubmit(formData: FormData) {
    if (pending) return;
    setPending(true);
    setError(null);

    const amount = Number(formData.get('amount'));
    const nextRenewalDate = formData.get('nextRenewalDate') as string | null;
    const date = formData.get('date') as string | null;
    const notes = formData.get('notes') as string | null;

    const result = await payInsurancePremium({
      insuranceId,
      accountId: Number(accountId),
      amount,
      nextRenewalDate: nextRenewalDate || undefined,
      date: date || undefined,
      notes: notes || undefined,
    });

    setPending(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button size="sm" className="rounded-xl flex items-center gap-1.5">
          <CreditCard className="h-3.5 w-3.5" /> Pay Premium
        </Button>
      } />

      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Pay Insurance Premium</DialogTitle>
          <DialogDescription>{policyName}</DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Debit Account</Label>
            <Select value={accountId} onValueChange={(value) => setAccountId(value ?? '')}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id.toString()}>
                    {a.name} (₹{a.balance.toLocaleString('en-IN')})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="prem-amount">Premium Amount (₹)</Label>
              <Input id="prem-amount" name="amount" type="number" min="1" step="100"
                defaultValue={defaultPremium} required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prem-date">Payment Date</Label>
              <Input id="prem-date" name="date" type="date"
                defaultValue={toLocalDateInputValue()} />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="prem-next">Next Renewal Date (optional)</Label>
              <Input id="prem-next" name="nextRenewalDate" type="date" defaultValue={toLocalDateInputValue()} />
              <p className="text-[11px] text-muted-foreground">
                Leave blank to auto-advance by 1 year from current renewal date.
              </p>
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="prem-notes">Notes (optional)</Label>
              <Input id="prem-notes" name="notes" placeholder="e.g. Annual premium 2025-26" />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button type="submit" disabled={pending} className="w-full rounded-xl">
            {pending ? <LoaderCircle className="h-4 w-4 animate-spin mr-2" /> : null}
            Confirm Payment
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
