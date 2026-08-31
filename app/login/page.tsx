'use client';

import { Suspense, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { login } from '../auth-actions';
import { LoaderCircle } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <>
      <Button
        className="h-11 w-full"
        type="submit"
        disabled={pending}
      >
        {pending ? (
          <>
            <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign in'
        )}
      </Button>

      {pending && (
        <div className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border bg-muted/40 px-4 py-4">
          <LoaderCircle className="h-6 w-6 animate-spin" />

          <p className="text-sm font-medium">
            Authenticating your account
          </p>

          <p className="text-xs text-muted-foreground">
            Please wait...
          </p>
        </div>
      )}
    </>
  );
}

function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const submissionLock = useRef(false);

  const searchParams = useSearchParams();

  const message = searchParams.get('message');
  const callbackError = searchParams.get('error');

  async function handleSubmit(formData: FormData) {
    if (submissionLock.current) return;

    submissionLock.current = true;
    setError(null);

    const result = await login(formData);

    if (result?.error) {
      setError(result.error);
      submissionLock.current = false;
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-1rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md">

        <CardHeader className="space-y-3 px-6 pt-8 pb-6">
          <CardTitle className="text-2xl">
            Welcome back
          </CardTitle>

          <CardDescription className="text-sm leading-relaxed">
            Enter your email and password to sign in to your
            DreamPaisa account.
          </CardDescription>
        </CardHeader>

        <form action={handleSubmit}>

          <CardContent className="space-y-6 px-6">

            {/* Email */}
            <div className="space-y-3">
              <Label htmlFor="email">
                Email
              </Label>

              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                className="h-11"
                required
              />
              <div className="text-right">
                <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-3">
              <Label htmlFor="password">
                Password
              </Label>

              <Input
                id="password"
                name="password"
                type="password"
                className="h-11"
                required
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
                <p className="text-sm leading-relaxed text-destructive">
                  {error}
                </p>
              </div>
            )}

            {/* Callback Error */}
            {callbackError && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
                <p className="text-sm leading-relaxed text-destructive">
                  {callbackError}
                </p>
              </div>
            )}

            {/* Message */}
            {message && (
              <div className="rounded-lg border p-4">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {message}
                </p>
              </div>
            )}

          </CardContent>

          <CardFooter className="flex flex-col gap-5 px-6 pt-6 pb-8">

            <SubmitButton />

            <div className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="font-medium text-foreground underline underline-offset-4"
              >
                Sign up
              </Link>
            </div>

          </CardFooter>
        </form>

      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-4rem)]" />
      }
    >
      <LoginForm />
    </Suspense>
  );
}
