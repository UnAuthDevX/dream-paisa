'use client';

import { useState, useRef } from 'react';
import { createInsurance, updateInsurance, deleteInsurance } from '@/app/actions/insurance';
import type { InsuranceWithMetrics } from '@/app/actions/insurance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toLocalDateInputValue } from '@/lib/date';
import { PlusCircle, Pencil, Trash2, LoaderCircle } from 'lucide-react';

type Props = {
  policy?: InsuranceWithMetrics;
};

const INSURANCE_TYPES = ['LIFE', 'HEALTH', 'VEHICLE', 'HOME', 'TRAVEL', 'TERM', 'ULIP', 'OTHER'];
const PREMIUM_FREQUENCIES = ['MONTHLY', 'QUARTERLY', 'ANNUAL'];

export default function InsuranceFormModal({ policy }: Props) {
  const isEdit = !!policy;
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState(policy?.type ?? 'LIFE');
  const [frequency, setFrequency] = useState(policy?.premiumFrequency ?? 'ANNUAL');
  const deleteRef = useRef(false);

  async function handleSubmit(formData: FormData) {
    if (pending) return;
    setPending(true);
    setError(null);

    formData.set('type', type);
    formData.set('premiumFrequency', frequency);

    const result = isEdit
      ? await updateInsurance(policy!.id, formData)
      : await createInsurance(formData);

    setPending(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setOpen(false);
    }
  }

  async function handleDelete() {
    if (deleteRef.current || !policy) return;
    deleteRef.current = true;
    await deleteInsurance(policy.id);
    setOpen(false);
  }

  const toDateInput = (d: Date | null | undefined) =>
    d ? toLocalDateInputValue(new Date(d)) : '';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={isEdit ? (
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button className="rounded-2xl flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Policy
          </Button>
        )} />

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Insurance Policy' : 'Add Insurance Policy'}</DialogTitle>
          <DialogDescription>
            Track life, health, vehicle, and home insurance policies.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="ins-name">Policy Name</Label>
              <Input id="ins-name" name="name" defaultValue={policy?.name} placeholder="e.g. LIC Jeevan Anand" required />
            </div>

            <div className="space-y-1.5">
              <Label>Insurance Type</Label>
              <Select value={type} onValueChange={(value) => setType(value ?? 'LIFE')}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INSURANCE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ins-provider">Provider</Label>
              <Input id="ins-provider" name="provider" defaultValue={policy?.provider} placeholder="e.g. LIC, HDFC" required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ins-policyNum">Policy Number</Label>
              <Input id="ins-policyNum" name="policyNumber" defaultValue={policy?.policyNumber ?? ''} placeholder="Optional" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ins-nominee">Nominee</Label>
              <Input id="ins-nominee" name="nominee" defaultValue={policy?.nominee ?? ''} placeholder="Optional" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ins-coverage">Coverage Amount (₹)</Label>
              <Input id="ins-coverage" name="coverageAmount" type="number" min="0" step="1000"
                defaultValue={policy?.coverageAmount ?? ''} placeholder="e.g. 5000000" required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ins-premium">Premium Amount (₹)</Label>
              <Input id="ins-premium" name="premiumAmount" type="number" min="1" step="100"
                defaultValue={policy?.premiumAmount ?? ''} placeholder="e.g. 25000" required />
            </div>

            <div className="space-y-1.5">
              <Label>Premium Frequency</Label>
              <Select value={frequency} onValueChange={(value) => setFrequency(value ?? 'ANNUAL')}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PREMIUM_FREQUENCIES.map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ins-start">Start Date</Label>
              <Input id="ins-start" name="startDate" type="date"
                defaultValue={toDateInput(policy?.startDate) || toLocalDateInputValue()} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ins-renewal">Renewal Date *</Label>
              <Input id="ins-renewal" name="renewalDate" type="date"
                defaultValue={toDateInput(policy?.renewalDate) || toLocalDateInputValue()} required />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="ins-notes">Notes</Label>
              <Textarea id="ins-notes" name="notes" defaultValue={policy?.notes ?? ''} rows={2}
                placeholder="Optional notes..." className="rounded-xl resize-none" />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            {isEdit && (
              <Button type="button" variant="destructive" size="sm"
                className="rounded-xl" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            )}
            <Button type="submit" disabled={pending} className="flex-1 rounded-xl">
              {pending ? <LoaderCircle className="h-4 w-4 animate-spin mr-2" /> : null}
              {isEdit ? 'Save Changes' : 'Add Policy'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
