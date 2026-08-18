'use client';

import { useRef, useState } from 'react';
import { LoaderCircle, Pencil, PlusCircle, Trash2 } from 'lucide-react';
import { createAsset, updateAsset, deleteAsset } from '@/app/actions/portfolio';
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

type Asset = { id: number; name: string; type: string; value: number; acquired: Date | null };

interface AssetFormModalProps {
  asset?: Asset;
}

export default function AssetFormModal({ asset }: AssetFormModalProps = {}) {
  const isEditing = !!asset;
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [deletePending, setDeletePending] = useState(false);
  const submissionLock = useRef(false);
  const deletionLock = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ name: string; value: number } | null>(null);

  const defaultAcquired = asset?.acquired
    ? new Date(asset.acquired).toISOString().split('T')[0]
    : '';

  async function submit(formData: FormData) {
    if (submissionLock.current) return;
    submissionLock.current = true;
    setPending(true);
    setError(null);
    try {
      const result = isEditing
        ? await updateAsset(asset!.id, formData)
        : await createAsset(formData);
      if (result?.error) setError(result.error);
      else if (result?.success && result.item) { setOpen(false); setSuccess(result.item); }
      else setError('Unable to save asset. Please try again.');
    } catch {
      setError('Unable to save asset. Please try again.');
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
      await deleteAsset(asset!.id);
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
                <span className="sr-only">Edit asset</span>
              </Button>
            ) : (
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />Add Asset
              </Button>
            )
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Asset' : 'Add Asset'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update the details for this asset.' : 'Track valuable things you own.'}
            </DialogDescription>
          </DialogHeader>
          <form action={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="asset-name">Name</Label>
              <Input id="asset-name" name="name" placeholder="e.g. Car" defaultValue={asset?.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="asset-type">Type</Label>
              <Input id="asset-type" name="type" placeholder="e.g. Vehicle" defaultValue={asset?.type} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="asset-value">Current value (₹)</Label>
              <Input id="asset-value" name="value" type="number" min="0" step="0.01" defaultValue={asset?.value} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="asset-date">Acquired on</Label>
              <Input id="asset-date" name="acquired" type="date" defaultValue={defaultAcquired} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : isEditing ? 'Update Asset' : 'Save Asset'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>

        <SuccessDialog
          open={!!success}
          onDone={() => setSuccess(null)}
          title={isEditing ? '✅ Asset Updated!' : '✅ Asset Added Successfully!'}
        >
          <p>{success?.name}</p>
          <p>Value: ₹{success?.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
        </SuccessDialog>
      </Dialog>

      {isEditing && (
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete asset</span>
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete &quot;{asset!.name}&quot;?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this asset from your portfolio. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deletePending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deletePending ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : 'Delete Asset'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
