'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getActiveDatabaseUser } from '@/lib/account-lifecycle';

const assetSchema = z.object({
  name: z.string().trim().min(1).max(100),
  type: z.string().trim().min(1).max(50),
  value: z.coerce.number().finite().nonnegative(),
  acquired: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const investmentSchema = z.object({
  name: z.string().trim().min(1).max(100),
  type: z.string().trim().min(1).max(50),
  amount: z.coerce.number().finite().nonnegative(),
  quantity: z.coerce.number().finite().nonnegative().optional(),
  dateAcquired: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

async function currentUserId() {
  const dbUser = await getActiveDatabaseUser();
  if (!dbUser) return null;
  return dbUser.id;
}

export async function getAssets() {
  const userId = await currentUserId();
  return userId ? prisma.asset.findMany({ where: { userId }, orderBy: { acquired: 'desc' } }) : [];
}

export async function getInvestments() {
  const userId = await currentUserId();
  return userId ? prisma.investment.findMany({ where: { userId }, orderBy: { dateAcquired: 'desc' } }) : [];
}

export async function createAsset(formData: FormData) {
  const userId = await currentUserId();
  if (!userId) return { error: 'Please sign in with a verified email to add an asset.' };

  const parsed = assetSchema.safeParse({
    name: formData.get('name'), type: formData.get('type'), value: formData.get('value'), acquired: formData.get('acquired') || undefined,
  });
  if (!parsed.success) return { error: 'Enter a valid asset name, type, and value.' };

  const asset = await prisma.asset.create({
    data: { ...parsed.data, acquired: parsed.data.acquired ? new Date(`${parsed.data.acquired}T00:00:00`) : null, userId },
  });
  revalidatePath('/assets');
  revalidatePath('/dashboard');
  return { success: true, item: { name: asset.name, value: asset.value } };
}

export async function createInvestment(formData: FormData) {
  const userId = await currentUserId();
  if (!userId) return { error: 'Please sign in with a verified email to add an investment.' };

  const parsed = investmentSchema.safeParse({
    name: formData.get('name'), type: formData.get('type'), amount: formData.get('amount'),
    quantity: formData.get('quantity') || undefined, dateAcquired: formData.get('dateAcquired') || undefined,
  });
  if (!parsed.success) return { error: 'Enter valid investment details.' };

  const investment = await prisma.investment.create({
    data: { ...parsed.data, dateAcquired: parsed.data.dateAcquired ? new Date(`${parsed.data.dateAcquired}T00:00:00`) : null, userId },
  });
  revalidatePath('/investments');
  revalidatePath('/dashboard');
  return { success: true, item: { name: investment.name, value: investment.amount } };
}

export async function getPortfolioTotals() {
  const userId = await currentUserId();
  if (!userId) return { assetValue: 0, investmentValue: 0 };
  const [assets, investments] = await Promise.all([
    prisma.asset.aggregate({ where: { userId }, _sum: { value: true } }),
    prisma.investment.aggregate({ where: { userId }, _sum: { amount: true } }),
  ]);
  return { assetValue: assets._sum.value ?? 0, investmentValue: investments._sum.amount ?? 0 };
}
