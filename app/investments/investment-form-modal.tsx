'use client';

import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { createInvestment } from '@/app/actions/portfolio';
import { SuccessDialog } from '@/components/success-dialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function InvestmentFormModal() {
  const [open, setOpen] = useState(false); const [pending, setPending] = useState(false); const [error, setError] = useState<string | null>(null); const [success, setSuccess] = useState<{ name: string; value: number } | null>(null);
  async function submit(formData: FormData) { setPending(true); setError(null); const result = await createInvestment(formData); setPending(false); if (result?.error) setError(result.error); else if (result?.success && result.item) { setOpen(false); setSuccess(result.item); } }
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger render={<Button><PlusCircle className="mr-2 h-4 w-4" />Add Investment</Button>} />
    <DialogContent><DialogHeader><DialogTitle>Add investment</DialogTitle><DialogDescription>Track mutual funds, stocks, deposits, and more.</DialogDescription></DialogHeader><form action={submit} className="space-y-4"><div className="space-y-2"><Label htmlFor="investment-name">Name</Label><Input id="investment-name" name="name" placeholder="e.g. Index Fund" required /></div><div className="space-y-2"><Label htmlFor="investment-type">Type</Label><Input id="investment-type" name="type" placeholder="e.g. Mutual Fund" required /></div><div className="space-y-2"><Label htmlFor="investment-amount">Invested amount (₹)</Label><Input id="investment-amount" name="amount" type="number" min="0" step="0.01" required /></div><div className="space-y-2"><Label htmlFor="investment-quantity">Quantity (optional)</Label><Input id="investment-quantity" name="quantity" type="number" min="0" step="any" /></div><div className="space-y-2"><Label htmlFor="investment-date">Purchase date</Label><Input id="investment-date" name="dateAcquired" type="date" /></div>{error && <p className="text-sm text-destructive">{error}</p>}<DialogFooter><Button disabled={pending}>{pending ? 'Saving...' : 'Save investment'}</Button></DialogFooter></form></DialogContent>
    <SuccessDialog open={!!success} onDone={() => setSuccess(null)} title="✅ Investment Added Successfully!"><p>{success?.name}</p><p>Invested: ₹{success?.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p></SuccessDialog></Dialog>;
}
