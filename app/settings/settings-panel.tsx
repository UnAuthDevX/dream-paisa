'use client';

import { useState } from 'react';
import { completePasswordChange, requestPasswordChange, updateProfile } from '@/app/actions/settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { logout } from '../auth-actions';
import { KeyRound, User, LogOut } from 'lucide-react';

type Props = {
  name: string;
  email: string;
  passwordReset: boolean;
};

export default function SettingsPanel({ name, email, passwordReset }: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function run(action: () => Promise<{ error?: string; success?: string } | void>) {
    if (pending) return;
    setPending(true);
    setMessage(null);
    setError(null);
    const result = await action();
    setPending(false);
    if (result?.error) setError(result.error);
    else if (result?.success) setMessage(result.success);
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Profile Settings */}
      <section className="rounded-2xl border bg-card p-6 shadow-xs">
        <div className="flex items-center gap-3 border-b pb-4">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Profile Settings</h1>
            <p className="text-xs text-muted-foreground">Manage your personal account details</p>
          </div>
        </div>

        <form action={(data) => run(() => updateProfile(data))} className="mt-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input id="name" name="name" defaultValue={name} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" value={email} disabled className="bg-muted/50" />
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving...' : 'Save Profile'}
            </Button>
            <Button type="button" variant="outline" className="text-destructive hover:bg-destructive/10 border-destructive/30" onClick={() => logout()}>
              <LogOut className="h-4 w-4 mr-1.5" /> Sign Out
            </Button>
          </div>
        </form>
      </section>

      {/* Password Management */}
      <section className="rounded-2xl border bg-card p-6 shadow-xs">
        <div className="flex items-center gap-3 border-b pb-4">
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Password & Security</h2>
            <p className="text-xs text-muted-foreground">Update your login password securely</p>
          </div>
        </div>

        {passwordReset ? (
          <form action={(data) => run(() => completePasswordChange(data))} className="mt-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input id="password" name="password" type="password" minLength={8} placeholder="Enter at least 8 characters" required />
            </div>
            <Button type="submit" disabled={pending} className="bg-blue-600 hover:bg-blue-700 text-white">
              {pending ? 'Updating & Logging Out...' : 'Set New Password'}
            </Button>
          </form>
        ) : (
          <div className="mt-5 space-y-3">
            <p className="text-xs text-muted-foreground">
              Request a secure password change link sent to <strong>{email}</strong>.
            </p>
            <Button type="button" variant="outline" disabled={pending} onClick={() => run(requestPasswordChange)}>
              {pending ? 'Sending Link...' : 'Email Password Reset Link'}
            </Button>
          </div>
        )}
      </section>

      {message && <p className="text-sm font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 p-3 rounded-xl">{message}</p>}
      {error && <p className="text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded-xl">{error}</p>}
    </div>
  );
}