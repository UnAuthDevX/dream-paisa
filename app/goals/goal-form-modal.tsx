'use client';

import { useState, useRef } from 'react';
import { createGoal, updateGoal, deleteGoal } from '@/app/actions/goals';
import type { GoalWithMetrics } from '@/app/actions/goals';
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
  goal?: GoalWithMetrics;
};

const GOAL_CATEGORIES = [
  'Emergency Fund', 'Vacation', 'Home', 'Vehicle', 'Education',
  'Wedding', 'Retirement', 'Investment', 'Gadget', 'Other',
];

export default function GoalFormModal({ goal }: Props) {
  const isEdit = !!goal;
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState(goal?.category ?? 'Emergency Fund');
  const deleteRef = useRef(false);

  async function handleSubmit(formData: FormData) {
    if (pending) return;
    setPending(true);
    setError(null);
    formData.set('category', category);

    const result = isEdit
      ? await updateGoal(goal!.id, formData)
      : await createGoal(formData);

    setPending(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setOpen(false);
    }
  }

  async function handleDelete() {
    if (deleteRef.current || !goal) return;
    deleteRef.current = true;
    await deleteGoal(goal.id);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={isEdit ? (
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button className="rounded-2xl flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Goal
          </Button>
        )} />

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Financial Goal' : 'New Financial Goal'}</DialogTitle>
          <DialogDescription>
            Set savings targets with deadlines and track your progress toward them.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="goal-name">Goal Name</Label>
              <Input id="goal-name" name="name" defaultValue={goal?.name}
                placeholder="e.g. Emergency Fund, Europe Trip" required />
            </div>

            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={(value) => setCategory(value ?? 'Emergency Fund')}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GOAL_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="goal-target-date">Target Date *</Label>
              <Input id="goal-target-date" name="targetDate" type="date"
                defaultValue={goal ? toLocalDateInputValue(new Date(goal.targetDate)) : toLocalDateInputValue()} required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="goal-target">Target Amount (₹) *</Label>
              <Input id="goal-target" name="targetAmount" type="number" min="1" step="1000"
                defaultValue={goal?.targetAmount} placeholder="e.g. 100000" required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="goal-current">Current Saved (₹)</Label>
              <Input id="goal-current" name="currentAmount" type="number" min="0" step="100"
                defaultValue={goal?.currentAmount ?? 0} placeholder="0" />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="goal-monthly">Monthly Target (₹, optional)</Label>
              <Input id="goal-monthly" name="monthlyTarget" type="number" min="0" step="100"
                defaultValue={goal?.monthlyTarget ?? ''} placeholder="Auto-calculated if blank" />
              <p className="text-[11px] text-muted-foreground">
                Override the auto-calculated monthly savings needed.
              </p>
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="goal-notes">Notes (optional)</Label>
              <Textarea id="goal-notes" name="notes" defaultValue={goal?.notes ?? ''} rows={2}
                className="rounded-xl resize-none" placeholder="Additional context..." />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            {isEdit && (
              <Button type="button" variant="destructive" size="sm" className="rounded-xl"
                onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            )}
            <Button type="submit" disabled={pending} className="flex-1 rounded-xl">
              {pending ? <LoaderCircle className="h-4 w-4 animate-spin mr-2" /> : null}
              {isEdit ? 'Save Changes' : 'Create Goal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
