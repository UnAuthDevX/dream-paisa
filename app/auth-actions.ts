'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/db';
import { z } from 'zod';

const genericPasswordResetMessage = 'If an account exists for this email, a reset link has been sent.';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

const signupSchema = loginSchema.extend({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(100),
});

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const parsed = loginSchema.safeParse(data);

  if (!parsed.success) {
    return { error: 'Invalid input' };
  }

  const { data: signInData, error } =
    await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

  if (error) {
    return { error: error.message };
  }

  if (!signInData.user.email_confirmed_at) {
    await supabase.auth.signOut();

    return {
      error:
        'Please verify your email before signing in. Check your inbox for the verification link.',
    };
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email: signInData.user.email!,
    },
  });

  if (existingUser?.deletedAt) {
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

    await supabase.auth.signInWithOtp({
      email: signInData.user.email!,
      options: {
        emailRedirectTo: new URL(
          '/auth/callback?next=/settings?recover=confirm',
          siteUrl
        ).toString(),
      },
    });

    await supabase.auth.signOut();

    return {
      error:
        'Your account is pending deletion. We sent a recovery verification link to your email.',
    };
  }

  redirect('/dashboard');
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    name: formData.get('name') as string,
  };

  const parsed = signupSchema.safeParse(data);

  if (!parsed.success) {
    return {
      error: 'Please enter a valid name, email, and password.',
    };
  }

  const email = parsed.data.email.toLowerCase().trim();

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser && !existingUser.deletedAt) {
    return {
      error: 'An account with this email already exists. Please sign in instead.',
    };
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  const { data: signUpData, error } = await supabase.auth.signUp({
    email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.name,
      },
      emailRedirectTo: new URL(
        '/auth/callback',
        siteUrl
      ).toString(),
    },
  });

  if (error) {
    console.error('Signup error:', error);

    return {
      error: error.message,
    };
  }

  if (
    signUpData.user &&
    signUpData.user.identities &&
    signUpData.user.identities.length === 0
  ) {
    return {
      error: 'An account with this email already exists. Please sign in instead.',
    };
  }

  return {
    success:
      'Account created! Check your inbox and verify your email before signing in.',
  };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

export async function requestPasswordReset(emailValue: string) {
  const email = z.string().email().safeParse(emailValue.trim().toLowerCase());
  if (!email.success) return { success: genericPasswordResetMessage };

  const user = await prisma.user.findUnique({
    where: { email: email.data },
    select: { id: true, lastPasswordResetRequestAt: true },
  });

  // Keep the response identical whether or not an account exists, and when a
  // request is rate-limited, so this endpoint cannot be used to enumerate users.
  const fifteenDaysMs = 15 * 24 * 60 * 60 * 1000;
  if (user?.lastPasswordResetRequestAt && Date.now() - user.lastPasswordResetRequestAt.getTime() < fifteenDaysMs) {
    return { success: genericPasswordResetMessage };
  }

  if (user) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.data, {
      redirectTo: new URL('/auth/callback?next=/reset-password', siteUrl).toString(),
    });

    // Do not expose delivery/provider errors to unauthenticated callers.
    if (!error) {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastPasswordResetRequestAt: new Date() },
      });
    }
  }

  return { success: genericPasswordResetMessage };
}

export async function resetPasswordWithToken(newPassword: string) {
  const password = z.string().min(8, 'Password must be at least 8 characters.').safeParse(newPassword);
  if (!password.success) return { error: password.error.issues[0]?.message ?? 'Invalid password.' };

  // Supabase validates the recovery session created from the emailed token.
  const supabase = await createClient();
  const { data, error } = await supabase.auth.updateUser({ password: password.data });
  if (error || !data.user) return { error: 'This reset link is invalid or has expired. Please request a new one.' };

  await prisma.user.updateMany({
    where: { email: data.user.email?.toLowerCase() },
    data: { passwordResetTokenHash: null, passwordResetTokenExpiresAt: null },
  });
  return { success: 'Your password has been reset. You can now sign in.' };
}
