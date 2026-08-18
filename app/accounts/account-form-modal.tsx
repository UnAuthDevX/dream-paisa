'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoaderCircle, Pencil, PlusCircle, Trash2 } from 'lucide-react';
import { createAccount, updateAccount, deleteAccount } from '@/app/actions/accounts';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Account = { id: number; name: string; balance: number };

interface AccountFormModalProps {
  account?: Account; // present when editing
}

export default function AccountFormModal({ account }: AccountFormModalProps = {}) {
  const isEditing = !!account;
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [deletePending, setDeletePending] = useState(false);
  const submissionLock = useRef(false);
  const deletionLock = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ name: string; balance: number } | null>(null);

  async function handleSubmit(formData: FormData) {
    if (submissionLock.current) return;
    submissionLock.current = true;
    setPending(true);
    setError(null);
    try {
      const result = isEditing
        ? await updateAccount(account!.id, formData)
        : await createAccount(formData);

      if (result?.error) setError(result.error);
      else if (result?.success && result.account) {
        setOpen(false);
        setSuccess(result.account);
      } else setError('Unable to save account. Please try again.');
    } catch {
      setError('Unable to save account. Please try again.');
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
      await deleteAccount(account!.id);
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
                <span className="sr-only">Edit account</span>
              </Button>
            ) : (
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Account
              </Button>
            )
          }
        />
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Account' : 'Add Account'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update the account name and balance.' : 'Create a new financial account (e.g. Bank, Wallet)'}
            </DialogDescription>
          </DialogHeader>
          <form action={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Account Name</Label>
                <Input id="name" name="name" placeholder="e.g. Checking Account" defaultValue={account?.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="balance">{isEditing ? 'Balance (₹)' : 'Initial Balance (₹)'}</Label>
                <Input id="balance" name="balance" type="number" step="0.01" defaultValue={account?.balance ?? 0} required />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : isEditing ? 'Update Account' : 'Save Account'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>

        <SuccessDialog
          open={success !== null}
          onDone={() => setSuccess(null)}
          title={isEditing ? '✅ Account Updated!' : '✅ Account Added Successfully!'}
        >
          <p>{success?.name}</p>
          <p>{isEditing ? 'Balance' : 'Opening balance'}: ₹{success?.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
        </SuccessDialog>
      </Dialog>

      {isEditing && (
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete account</span>
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete &quot;{account!.name}&quot;?</AlertDialogTitle>
              <AlertDialogDescription>
                ⚠️ Warning: Deleting &quot;{account!.name}&quot; will NOT delete your transaction history. All transactions associated with this account will be safely preserved and marked as unassigned.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deletePending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deletePending ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : 'Delete Account'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
