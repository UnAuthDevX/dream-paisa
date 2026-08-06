'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getActiveDatabaseUser } from '@/lib/account-lifecycle';

const accountSchema = z.object({
  name: z.string().trim().min(1).max(100),
  balance: z.coerce.number().finite().default(0),
});

export async function getAccounts() {
  const dbUser = await getActiveDatabaseUser();
  if (!dbUser) return [];

  return await prisma.account.findMany({
    where: { userId: dbUser.id },
  });
}

export async function createAccount(formData: FormData) {
  const dbUser = await getActiveDatabaseUser();
  if (!dbUser) {
    return { error: 'You must sign in with a verified email to create an account.' };
  }

  const parsed = accountSchema.safeParse({
    name: formData.get('name'),
    balance: formData.get('balance'),
  });

  if (!parsed.success) {
    return { error: 'Invalid input' };
  }

  await prisma.account.create({
    data: {
      name: parsed.data.name,
      balance: parsed.data.balance,
      userId: dbUser.id,
    }
  });

  revalidatePath('/accounts');
  revalidatePath('/dashboard');

  return { success: true, account: { name: parsed.data.name, balance: parsed.data.balance } };
}
