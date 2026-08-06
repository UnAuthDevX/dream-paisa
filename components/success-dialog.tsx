'use client';

import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type SuccessDialogProps = {
  open: boolean;
  onDone: () => void;
  title: string;
  children: ReactNode;
};

export function SuccessDialog({ open, onDone, title, children }: SuccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onDone()}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <div className="space-y-1 text-sm text-muted-foreground">{children}</div>
        </DialogHeader>
        <div className="border-y py-3 text-center">
          <p className="mb-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">Sponsored</p>
          <div className="rounded-lg border bg-muted/40 p-3 text-left">
            <p className="font-medium text-foreground">HDFC SIP</p>
            <p className="text-sm text-muted-foreground">Start investing from ₹500</p>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={onDone}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
