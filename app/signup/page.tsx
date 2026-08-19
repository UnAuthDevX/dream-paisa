'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
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
import { signup } from '../auth-actions';
import { LoaderCircle } from 'lucide-react';

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submissionLock = useRef(false);

  async function handleSubmit(formData: FormData) {
    if (submissionLock.current) return;

    submissionLock.current = true;
    setPending(true);
    setError(null);
    setSuccess(null);

    const result = await signup(formData);

    if (result?.error) {
      setError(result.error);
      setPending(false);
      submissionLock.current = false;
      return;
    }

    if (result?.success) {
      setSuccess(result.success);
      setPending(false);
      submissionLock.current = false;
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-1rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md">

        <CardHeader className="space-y-3 px-6 pt-8 pb-6">
          <CardTitle className="text-2xl">
            Create an account
          </CardTitle>

          <CardDescription className="text-sm leading-relaxed">
            Enter your details to get started with DreamPaisa.
          </CardDescription>
        </CardHeader>

        <form action={handleSubmit}>

          <CardContent className="space-y-6 px-6">

            <div className="space-y-3">
              <Label htmlFor="name">
                Name
              </Label>

              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                className="h-11"
                required
                disabled={pending}
              />
            </div>

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
                disabled={pending}
              />
            </div>

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
                disabled={pending}
              />
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
                <p className="text-sm leading-relaxed text-destructive">
                  {error}
                </p>
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
                <p className="text-sm leading-relaxed text-green-600">
                  {success}
                </p>
              </div>
            )}

          </CardContent>

          <CardFooter className="flex flex-col gap-5 px-6 pt-6 pb-8">

            <Button
              className="h-11 w-full"
              type="submit"
              disabled={pending || !!success}
            >
              {pending ? (
                <>
                  <LoaderCircle
                    className="mr-2 h-5 w-5 animate-spin"
                  />
                  Creating account...
                </>
              ) : success ? (
                'Account created ✓'
              ) : (
                'Sign up'
              )}
            </Button>

            {pending && (
              <div className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border bg-muted/40 px-4 py-4">
                <LoaderCircle className="h-6 w-6 animate-spin" />

                <p className="text-sm font-medium">
                  Creating your account
                </p>

                <p className="text-xs text-muted-foreground">
                  Please wait...
                </p>
              </div>
            )}

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-foreground underline underline-offset-4"
              >
                Sign in
              </Link>
            </div>

          </CardFooter>
        </form>

      </Card>
    </div>
  );
}