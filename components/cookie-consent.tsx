'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'dreampaisa-cookie-consent';
const CONSENT_EVENT = 'dreampaisa-cookie-consent-change';

type ConsentChoice = 'accepted' | 'rejected' | null;

function getConsent(): ConsentChoice {
  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === 'accepted' || value === 'rejected' ? value : null;
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange);
  window.addEventListener(CONSENT_EVENT, onStoreChange);
  return () => {
    window.removeEventListener('storage', onStoreChange);
    window.removeEventListener(CONSENT_EVENT, onStoreChange);
  };
}

function setConsent(choice: Exclude<ConsentChoice, null>) {
  window.localStorage.setItem(STORAGE_KEY, choice);
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

export function CookieConsent() {
  const consent = useSyncExternalStore(subscribe, getConsent, () => null);

  if (consent !== null) return null;

  return (
    <aside
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-2xl rounded-2xl border bg-card p-4 shadow-xl sm:p-5"
      aria-label="Cookie preferences"
    >
      <p className="font-semibold">Your privacy choices</p>
      <p className="mt-1 text-sm text-muted-foreground">
        DreamPaisa uses essential storage to remember this choice. Advertising cookies are not enabled unless you accept them.
        Read our <Link href="/privacy" className="underline underline-offset-2">Privacy Policy</Link> for details.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setConsent('rejected')}
          className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Reject advertising cookies
        </button>
        <button
          type="button"
          onClick={() => setConsent('accepted')}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Accept advertising cookies
        </button>
      </div>
    </aside>
  );
}

export function CookiePreferencesButton() {
  return (
    <button
      type="button"
      onClick={() => {
        window.localStorage.removeItem(STORAGE_KEY);
        window.dispatchEvent(new Event(CONSENT_EVENT));
      }}
      className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
    >
      Change cookie preferences
    </button>
  );
}
