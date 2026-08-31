'use client';

import { useState, useTransition } from 'react';
import { CheckCircle2, LoaderCircle } from 'lucide-react';
import { markRecurringTransactionPaid } from '@/app/actions/recurring';
import { Button } from '@/components/ui/button';

export default function MarkRecurringPaidButton({ id }: { id: number }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return <div className="flex flex-col items-end gap-1"><Button size="sm" variant="outline" className="rounded-xl text-xs" disabled={pending} onClick={() => startTransition(async () => { const result = await markRecurringTransactionPaid(id); setError(result.error ?? null); })}>{pending ? <LoaderCircle className="mr-1 h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="mr-1 h-3.5 w-3.5" />}Mark paid early</Button>{error && <span className="max-w-40 text-right text-[10px] text-destructive">{error}</span>}</div>;
}
