'use client';

import { useRef } from 'react';
import Script from 'next/script';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type SuccessDialogProps = {
  open: boolean;
  onDone: () => void;
  title: string;
  children: ReactNode;
  transactionNumber?: number;
};

const ENABLE_GOOGLE_ADS = false;

const GOOGLE_CLIENT = 'ca-pub-1096202877849237';
const GOOGLE_SLOT = '3810160132';
const GOOGLE_LAYOUT_KEY = '-hd-7+2h-1m-4u';

const ALT_AD_SCRIPT =
  'https://pl31116684.profitableratecpmnetwork.com/2e00b9b6701fc29b7f9efd46e6632114/invoke.js';

const ALT_AD_CONTAINER =
  'container-2e00b9b6701fc29b7f9efd46e6632114';


function GoogleAd() {
  const pushedRef = useRef(false);

  const pushAd = () => {
    if (pushedRef.current) {
      return;
    }

    try {
      if (typeof window === 'undefined') {
        return;
      }

      if (!window.adsbygoogle) {
        console.warn('Google AdSense script has not loaded yet.');
        return;
      }

      window.adsbygoogle.push({});
      pushedRef.current = true;
    } catch (error) {
      console.error('Google AdSense error:', error);
    }
  };

  if (!ENABLE_GOOGLE_ADS) {
    return (
      <div className="flex min-h-[160px] w-full items-center justify-center text-xs text-muted-foreground">
        Advertisement
      </div>
    );
  }

  return (
    <>
      <Script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${GOOGLE_CLIENT}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
        onLoad={pushAd}
      />

      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          width: '100%',
        }}
        data-ad-format="fluid"
        data-ad-layout-key={GOOGLE_LAYOUT_KEY}
        data-ad-client={GOOGLE_CLIENT}
        data-ad-slot={GOOGLE_SLOT}
      />
    </>
  );
}

function AlternativeAd() {
  return (
    <>
      <Script
        async
        data-cfasync="false"
        src={ALT_AD_SCRIPT}
        strategy="afterInteractive"
      />

      <div
        id={ALT_AD_CONTAINER}
        className="min-h-[160px] w-full overflow-hidden"
      />
    </>
  );
}


function AdSlot({
  transactionNumber = 1,
}: {
  transactionNumber?: number;
}) {
  const useGoogle = transactionNumber % 2 === 1;

  return (
    <div className="border-y py-3">
      <p className="mb-2 text-center text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
        Advertisement
      </p>

      <div className="flex min-h-[180px] w-full items-center justify-center overflow-hidden rounded-lg border bg-muted/40 p-3">
        {useGoogle ? <GoogleAd /> : <AlternativeAd />}
      </div>
    </div>
  );
}


export function SuccessDialog({
  open,
  onDone,
  title,
  children,
  transactionNumber = 1,
}: SuccessDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onDone();
        }
      }}
    >
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>

          <div className="space-y-1 text-sm text-muted-foreground">
            {children}
          </div>
        </DialogHeader>

        <AdSlot transactionNumber={transactionNumber} />

        <DialogFooter>
          <Button
            type="button"
            onClick={onDone}
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}
