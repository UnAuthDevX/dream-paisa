'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/db';
import { z } from 'zod';

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

  const { data: signInData, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  if (!signInData.user.email_confirmed_at) {
    await supabase.auth.signOut();
    return { error: 'Please verify your email before signing in. Check your inbox for the verification link.' };
  }

  const existingUser = await prisma.user.findUnique({ where: { email: signInData.user.email! } });
  if (existingUser?.deletedAt) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    await supabase.auth.signInWithOtp({
      email: signInData.user.email!,
      options: { emailRedirectTo: new URL('/auth/callback?next=/settings?recover=confirm', siteUrl).toString() },
    });
    await supabase.auth.signOut();
    return { error: 'Your account is pending deletion. We sent a recovery verification link to your email.' };
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
    return { error: 'Invalid input' };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.name,
      },
      emailRedirectTo: new URL('/auth/callback', siteUrl).toString(),
    }
  });

  if (error) {
    return { error: error.message };
  }

  return { success: 'Check your inbox and verify your email before signing in.' };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}
