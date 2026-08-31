'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TrendingDown, LoaderCircle } from 'lucide-react';
import { revalueAsset } from '@/app/actions/portfolio';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface RevalueModalProps {
  assetId: number;
  assetName: string;
  currentValue: number;
  purchaseValue: number;
}

export default function RevalueModal({
  assetId,
  assetName,
  currentValue,
  purchaseValue,
}: RevalueModalProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string>(currentValue.toString());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const numVal = parseFloat(value) || 0;
  const newDepreciation = Math.max(0, purchaseValue - numVal);
  const newDepreciationPercentage = purchaseValue > 0 ? (newDepreciation / purchaseValue) * 100 : 0;

  async function handleRevalue(e: React.FormEvent) {
    e.preventDefault();
    if (isNaN(numVal) || numVal < 0) {
      setError('Please enter a valid non-negative amount.');
      return;
    }
    setPending(true);
    setError(null);

    try {
      const result = await revalueAsset(assetId, numVal);
      if (result?.error) {
        setError(result.error);
      } else {
        setOpen(false);
      }
    } catch {
      setError('Failed to update asset value.');
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5 rounded-xl">
            <TrendingDown className="h-3.5 w-3.5" /> Revalue / Adjust Market Value
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Update Estimated Value</DialogTitle>
          <DialogDescription>
            Adjust the current estimated market value of <strong>{assetName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleRevalue} className="space-y-4 py-2">
          <div className="p-3 bg-muted/50 rounded-xl space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Original Purchase Value:</span>
              <span className="font-semibold">₹{purchaseValue.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">New Estimated Depreciation:</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400">
                -₹{newDepreciation.toLocaleString('en-IN')} ({newDepreciationPercentage.toFixed(1)}%)
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="current-value">New Current Estimated Value (₹)</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground font-semibold">₹</span>
              <Input
                id="current-value"
                type="number"
                step="0.01"
                min="0"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="pl-7 font-bold text-base"
                required
              />
            </div>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <DialogFooter className="mt-2">
            <Button type="submit" disabled={pending} className="w-full sm:w-auto">
              {pending ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Updating...</> : 'Save New Value'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}