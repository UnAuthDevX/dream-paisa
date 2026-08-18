'use client';

import Script from 'next/script';
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
          <p className="mb-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">Ads</p>
          <div className="rounded-lg border bg-muted/40 p-3 text-left">
            <Script
              async
              src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1096202877849237"
              crossOrigin="anonymous"
              strategy="afterInteractive"
            />

            <ins
              className="adsbygoogle"
              style={{ display: 'block' }}
              data-ad-format="fluid"
              data-ad-layout-key="-gw-3+1f-3d+2z"
              data-ad-client="ca-pub-1096202877849237"
              data-ad-slot="3810160132"
            />

            <Script id="adsbygoogle-init" strategy="afterInteractive">
              {`(adsbygoogle = window.adsbygoogle || []).push({});`}
            </Script>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={onDone}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
