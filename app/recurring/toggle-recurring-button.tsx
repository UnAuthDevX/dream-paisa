'use client';

import { useTransition } from 'react';
import { toggleRecurringActive } from '@/app/actions/recurring';
import { Button } from '@/components/ui/button';
import { LoaderCircle, Pause, Play } from 'lucide-react';

export default function ToggleRecurringButton({ id, isActive }: { id: number; isActive: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant={isActive ? 'outline' : 'default'}
      size="sm"
      className="rounded-xl flex items-center gap-1.5 text-xs"
      disabled={pending}
      onClick={() => startTransition(() => { void toggleRecurringActive(id); })}
    >
      {pending ? (
        <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
      ) : isActive ? (
        <Pause className="h-3.5 w-3.5" />
      ) : (
        <Play className="h-3.5 w-3.5" />
      )}
      {isActive ? 'Pause' : 'Resume'}
    </Button>
  );
}
