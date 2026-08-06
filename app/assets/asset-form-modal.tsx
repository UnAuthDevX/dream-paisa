'use client';

import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { createAsset } from '@/app/actions/portfolio';
import { SuccessDialog } from '@/components/success-dialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AssetFormModal() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ name: string; value: number } | null>(null);
  async function submit(formData: FormData) {
    setPending(true); setError(null);
    const result = await createAsset(formData);
    setPending(false);
    if (result?.error) setError(result.error);
    else if (result?.success && result.item) { setOpen(false); setSuccess(result.item); }
  }
  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger render={<Button><PlusCircle className="mr-2 h-4 w-4" />Add Asset</Button>} />
    <DialogContent><DialogHeader><DialogTitle>Add asset</DialogTitle><DialogDescription>Track valuable things you own.</DialogDescription></DialogHeader>
      <form action={submit} className="space-y-4"><div className="space-y-2"><Label htmlFor="asset-name">Name</Label><Input id="asset-name" name="name" placeholder="e.g. Car" required /></div>
        <div className="space-y-2"><Label htmlFor="asset-type">Type</Label><Input id="asset-type" name="type" placeholder="e.g. Vehicle" required /></div>
        <div className="space-y-2"><Label htmlFor="asset-value">Current value (₹)</Label><Input id="asset-value" name="value" type="number" min="0" step="0.01" required /></div>
        <div className="space-y-2"><Label htmlFor="asset-date">Acquired on</Label><Input id="asset-date" name="acquired" type="date" /></div>
        {error && <p className="text-sm text-destructive">{error}</p>}<DialogFooter><Button disabled={pending}>{pending ? 'Saving...' : 'Save asset'}</Button></DialogFooter></form>
    </DialogContent>
    <SuccessDialog open={!!success} onDone={() => setSuccess(null)} title="✅ Asset Added Successfully!"><p>{success?.name}</p><p>Value: ₹{success?.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p></SuccessDialog>
  </Dialog>;
}
