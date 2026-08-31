'use client';

import Link from 'next/link';
import { useState } from 'react';
import { requestPasswordReset } from '@/app/auth-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(formData: FormData) {
    setPending(true);
    const result = await requestPasswordReset(String(formData.get('email') ?? ''));
    setMessage(result.success);
    setPending(false);
  }

  return <div className="flex min-h-screen items-center justify-center p-4"><Card className="w-full max-w-md">
    <CardHeader><CardTitle>Reset your password</CardTitle><CardDescription>Enter your email address and we’ll send a secure reset link if an account exists.</CardDescription></CardHeader>
    <form action={submit}><CardContent className="space-y-3"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required autoComplete="email" />
      {message && <p className="rounded-lg border bg-muted p-3 text-sm text-muted-foreground">{message}</p>}
    </CardContent><CardFooter className="flex flex-col gap-4"><Button type="submit" className="w-full" disabled={pending}>{pending ? 'Sending…' : 'Send reset link'}</Button><Link href="/login" className="text-sm text-primary hover:underline">Back to sign in</Link></CardFooter></form>
  </Card></div>;
}
