'use client';

import Link from 'next/link';
import { useState } from 'react';
import { resetPasswordWithToken } from '@/app/auth-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ResetPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  async function submit(formData: FormData) {
    const password = String(formData.get('password') ?? '');
    const confirmation = String(formData.get('confirmation') ?? '');
    setMessage(null); setError(null);
    if (password !== confirmation) { setError('Passwords do not match.'); return; }
    setPending(true);
    const result = await resetPasswordWithToken(password);
    setPending(false);
    if (result.error) setError(result.error); else setMessage(result.success ?? null);
  }
  return <div className="flex min-h-screen items-center justify-center p-4"><Card className="w-full max-w-md">
    <CardHeader><CardTitle>Choose a new password</CardTitle><CardDescription>This page works only after opening a valid password-reset email link.</CardDescription></CardHeader>
    <form action={submit}><CardContent className="space-y-4"><div className="space-y-2"><Label htmlFor="password">New password</Label><Input id="password" name="password" type="password" minLength={8} required autoComplete="new-password" /></div><div className="space-y-2"><Label htmlFor="confirmation">Confirm password</Label><Input id="confirmation" name="confirmation" type="password" minLength={8} required autoComplete="new-password" /></div>
      {error && <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}{message && <p className="rounded-lg border bg-muted p-3 text-sm">{message}</p>}
    </CardContent><CardFooter className="flex flex-col gap-4"><Button type="submit" className="w-full" disabled={pending || !!message}>{pending ? 'Resetting…' : 'Reset password'}</Button><Link href="/login" className="text-sm text-primary hover:underline">Back to sign in</Link></CardFooter></form>
  </Card></div>;
}
