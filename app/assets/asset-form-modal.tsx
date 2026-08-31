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
import { toLocalDateInputValue } from '@/lib/date';

type Asset = {
  id: number;
  name: string;
  type: string;
  purchaseValue?: number;
  currentValue?: number;
  value?: number;
  acquired: Date | null;
};

interface AssetFormModalProps {
  asset?: Asset;
}

const COMMON_CATEGORIES = [
  'Electronics',
  'Vehicle',
  'Real Estate',
  'Gold & Jewelry',
  'Gadgets & Appliances',
  'Furniture',
  'Collectibles',
  'Other',
];

export default function AssetFormModal({ asset }: AssetFormModalProps = {}) {
  const isEditing = !!asset;
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [deletePending, setDeletePending] = useState(false);
  const submissionLock = useRef(false);
  const deletionLock = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ name: string; value: number } | null>(null);

  const initialPurchase = asset?.purchaseValue ?? (asset?.value ?? '');
  const initialCurrent = asset?.currentValue ?? (asset?.value ?? '');

  const [purchaseValue, setPurchaseValue] = useState<string | number>(initialPurchase);
  const [currentValue, setCurrentValue] = useState<string | number>(initialCurrent);

  const defaultAcquired = asset?.acquired
    ? toLocalDateInputValue(new Date(asset.acquired))
    : toLocalDateInputValue();

  function handlePurchaseChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setPurchaseValue(val);
    if (!isEditing && (!currentValue || currentValue === purchaseValue)) {
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
        ? await updateAsset(asset!.id, formData)
        : await createAsset(formData);
      if (result?.error) setError(result.error);
      else if (result?.success && result.item) {
        setOpen(false);
        setSuccess(result.item);
      } else setError('Unable to save asset. Please try again.');
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
                <span className="sr-only">Edit asset</span>
              </Button>
            ) : (
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Asset
              </Button>
            )
          }
        />
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update asset details, purchase price, or estimated current value.'
                : 'Track physical assets and calculate real-time depreciation.'}
            </DialogDescription>
          </DialogHeader>
          <form action={submit} className="space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="asset-name">Asset Name</Label>
              <Input
                id="asset-name"
                name="name"
                placeholder="e.g. MacBook Pro, Honda Activa, 24K Gold"
                defaultValue={asset?.name}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="asset-type">Category</Label>
              <Input
                id="asset-type"
                name="type"
                placeholder="e.g. Electronics, Vehicle, Real Estate"
                defaultValue={asset?.type || 'Electronics'}
                list="category-options"
                required
              />
              <datalist id="category-options">
                {COMMON_CATEGORIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="asset-purchase-val">Purchase Value (₹)</Label>
                <Input
                  id="asset-purchase-val"
                  name="purchaseValue"
                  type="number"
                  min="0"
                  step="0.01"
                  value={purchaseValue}
                  onChange={handlePurchaseChange}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="asset-current-val">Current Value (₹)</Label>
                <Input
                  id="asset-current-val"
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

            <div className="space-y-1.5">
              <Label htmlFor="asset-date">Acquisition Date</Label>
              <Input
                id="asset-date"
                name="acquired"
                type="date"
                defaultValue={defaultAcquired}
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
                  'Update Asset'
                ) : (
                  'Save Asset'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>

        <SuccessDialog
          open={!!success}
          onDone={() => setSuccess(null)}
          title={isEditing ? '✅ Asset Updated!' : '✅ Asset Added Successfully!'}
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
                {deletePending ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                  </>
                ) : (
                  'Delete Asset'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
