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
  return error ? { error: error.message } : { success: 'Your password has been changed.' };
}

export async function requestAccountDeletion() {
  const user = await getActiveDatabaseUser();
  if (!user) return { error: 'Your account is not available.' };
  const supabase = await createClient();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  const { error } = await supabase.auth.signInWithOtp({
    email: user.email,
    options: { emailRedirectTo: new URL('/auth/callback?next=/settings?delete=confirm', siteUrl).toString() },
  });
  if (error) return { error: error.message };
  await prisma.user.update({ where: { id: user.id }, data: { deletionRequestedAt: new Date(), deletionLinkExpiresAt: expiresAt } });
  await supabase.auth.signOut();
  return { success: 'Check your email. The deletion verification link expires in 10 minutes.' };
}

export async function confirmAccountDeletion() {
  const user = await getActiveDatabaseUser();
  const cookieStore = await cookies();
  const verifiedAt = Number(cookieStore.get('dreampaisa-delete-verified')?.value);
  if (!user || !user.deletionRequestedAt || !user.deletionLinkExpiresAt || !verifiedAt || verifiedAt < user.deletionRequestedAt.getTime() || user.deletionLinkExpiresAt < new Date()) {
    return { error: 'This deletion verification has expired. Request a new link.' };
  }
  const now = new Date();
  await prisma.user.update({ where: { id: user.id }, data: { deletedAt: now, purgeAfter: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), deletionRequestedAt: null, deletionLinkExpiresAt: null } });
  cookieStore.delete('dreampaisa-delete-verified');
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login?message=Your%20data%20is%20scheduled%20for%20permanent%20deletion%20in%207%20days.%20You%20can%20recover%20it%20before%20then.');
}

export async function recoverAccount() {
  const user = await getCurrentDatabaseUser();
  const cookieStore = await cookies();
  const verifiedAt = Number(cookieStore.get('dreampaisa-recovery-verified')?.value);
  if (!user?.deletedAt || !user.purgeAfter || user.purgeAfter <= new Date() || !verifiedAt || verifiedAt < user.deletedAt.getTime()) {
    return { error: 'This recovery verification is invalid or the recovery period has ended.' };
  }
  await prisma.user.update({ where: { id: user.id }, data: { deletedAt: null, purgeAfter: null } });
  cookieStore.delete('dreampaisa-recovery-verified');
  revalidatePath('/', 'layout');
  return { success: 'Your account and data have been recovered.' };
}
