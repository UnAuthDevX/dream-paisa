'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle } from 'lucide-react';
import { createAccount } from '@/app/actions/accounts';
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

export default function AccountFormModal() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ name: string; balance: number } | null>(null);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await createAccount(formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    } else if (result?.success && result.account) {
      setPending(false);
      setOpen(false);
      setSuccess(result.account);
    } else {
      setPending(false);
      setError('Unable to save account. Please try again.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Account
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Account</DialogTitle>
          <DialogDescription>
            Create a new financial account (e.g. Bank, Wallet)
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Account Name</Label>
              <Input id="name" name="name" placeholder="e.g. Checking Account" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="balance">Initial Balance (₹)</Label>
              <Input id="balance" name="balance" type="number" step="0.01" defaultValue="0" required />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      <SuccessDialog
        open={success !== null}
        onDone={() => setSuccess(null)}
        title="✅ Account Added Successfully!"
      >
        <p>{success?.name}</p>
        <p>Opening balance: ₹{success?.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
      </SuccessDialog>
    </Dialog>
  );
}
