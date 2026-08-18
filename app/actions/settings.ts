'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import prisma from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import { getActiveDatabaseUser, getCurrentDatabaseUser } from '@/lib/account-lifecycle';

const nameSchema = z.string().trim().min(2).max(100);
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters.');
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export async function updateProfile(formData: FormData) {
  const user = await getActiveDatabaseUser();
  const parsed = nameSchema.safeParse(formData.get('name'));
  if (!user) return { error: 'Your account is not available.' };
  if (!parsed.success) return { error: 'Use a name between 2 and 100 characters.' };
  await prisma.user.update({ where: { id: user.id }, data: { name: parsed.data } });
  revalidatePath('/settings');
  return { success: 'Profile updated.' };
}

export async function requestPasswordChange() {
  const user = await getActiveDatabaseUser();
  if (!user) return { error: 'Your account is not available.' };
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
    redirectTo: new URL('/auth/callback?next=/settings?password=reset', siteUrl).toString(),
  });
  return error ? { error: error.message } : { success: 'Check your email for a secure password-reset link.' };
}

export async function completePasswordChange(formData: FormData) {
  const user = await getActiveDatabaseUser();
  const parsed = passwordSchema.safeParse(formData.get('password'));
  if (!user) return { error: 'Your account is not available.' };
  if (!parsed.success) return { error: 'Use a password with at least 8 characters.' };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data });
  if (error) return { error: error.message };

  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login?message=Password%20updated%20successfully.%20Please%20log%20in%20with%20your%20new%20password.');
}
