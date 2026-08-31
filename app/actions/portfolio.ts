'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getActiveDatabaseUser } from '@/lib/account-lifecycle';

const assetSchema = z.object({
  name: z.string().trim().min(1, 'Asset name is required').max(100),
  type: z.string().trim().min(1, 'Category is required').max(50),
  purchaseValue: z.coerce.number().finite().nonnegative('Purchase value must be 0 or more'),
  currentValue: z.coerce.number().finite().nonnegative().optional(),
  acquired: z.string().optional().nullable(),
});

const investmentSchema = z.object({
  name: z.string().trim().min(1, 'Investment name is required').max(100),
  type: z.string().trim().min(1, 'Type is required').max(50),
  investedAmount: z.coerce.number().finite().nonnegative('Invested amount must be positive'),
  currentValue: z.coerce.number().finite().nonnegative().optional(),
  quantity: z.coerce.number().finite().nonnegative().optional().nullable(),
  dateAcquired: z.string().optional().nullable(),
});

async function currentUserId() {
  const dbUser = await getActiveDatabaseUser();
  if (!dbUser) return null;
  return dbUser.id;
}

export type AssetWithMetrics = {
  id: number;
  userId: number;
  name: string;
  type: string;
  purchaseValue: number;
  currentValue: number;
  value: number;
  acquired: Date | null;
  depreciation: number;
  depreciationPercentage: number;
  transactionCount?: number;
};

export async function getAssets() {
  const userId = await currentUserId();
  if (!userId) {
    return {
      assets: [] as AssetWithMetrics[],
      totalPurchaseValue: 0,
      totalCurrentValue: 0,
      totalDepreciation: 0,
    };
  }

  const rawAssets = await prisma.asset.findMany({
    where: { userId },
    orderBy: [{ acquired: 'desc' }, { id: 'desc' }],
    include: {
      _count: {
        select: { transactions: true },
      },
    },
  });

  let totalPurchaseValue = 0;
  let totalCurrentValue = 0;

  const assets: AssetWithMetrics[] = rawAssets.map((asset) => {
    const purchaseVal = asset.purchaseValue > 0 ? asset.purchaseValue : (asset.value > 0 ? asset.value : 0);
    const currentVal = asset.currentValue > 0 ? asset.currentValue : (asset.value > 0 ? asset.value : purchaseVal);
    const depreciation = Math.max(0, purchaseVal - currentVal);
    const depreciationPercentage = purchaseVal > 0 ? (depreciation / purchaseVal) * 100 : 0;

    totalPurchaseValue += purchaseVal;
    totalCurrentValue += currentVal;

    return {
      id: asset.id,
      userId: asset.userId,
      name: asset.name,
      type: asset.type,
      purchaseValue: purchaseVal,
      currentValue: currentVal,
      value: currentVal,
      acquired: asset.acquired,
      depreciation,
      depreciationPercentage,
      transactionCount: asset._count.transactions,
    };
  });

  const totalDepreciation = Math.max(0, totalPurchaseValue - totalCurrentValue);

  return {
    assets,
    totalPurchaseValue,
    totalCurrentValue,
    totalDepreciation,
  };
}

export async function getAssetById(id: number) {
  const userId = await currentUserId();
  if (!userId) return null;

  const asset = await prisma.asset.findFirst({
    where: { id, userId },
    include: {
      transactions: {
        orderBy: { date: 'desc' },
        include: {
          account: true,
          category: true,
        },
      },
    },
  });

  if (!asset) return null;

  const purchaseVal = asset.purchaseValue > 0 ? asset.purchaseValue : (asset.value > 0 ? asset.value : 0);
  const currentVal = asset.currentValue > 0 ? asset.currentValue : (asset.value > 0 ? asset.value : purchaseVal);
  const depreciation = Math.max(0, purchaseVal - currentVal);
  const depreciationPercentage = purchaseVal > 0 ? (depreciation / purchaseVal) * 100 : 0;

  const maintenanceTransactions = asset.transactions.filter(
    (t) => t.subType === 'REPAIR' || t.subType === 'MAINTENANCE' || t.subType === 'ACCESSORIES' || (t.subType !== 'PURCHASE' && t.amount < 0)
  );
  const totalMaintenanceSpent = maintenanceTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return {
    ...asset,
    purchaseValue: purchaseVal,
    currentValue: currentVal,
    depreciation,
    depreciationPercentage,
    totalMaintenanceSpent,
  };
}

export async function createAsset(formData: FormData) {
  const userId = await currentUserId();
  if (!userId) return { error: 'Please sign in with a verified email to add an asset.' };

  const parsed = assetSchema.safeParse({
    name: formData.get('name'),
    type: formData.get('type'),
    purchaseValue: formData.get('purchaseValue') ?? formData.get('value'),
    currentValue: formData.get('currentValue') || undefined,
    acquired: formData.get('acquired') || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Enter valid asset details.' };
  }

  const purchaseVal = parsed.data.purchaseValue;
  const currentVal = parsed.data.currentValue ?? purchaseVal;

  const asset = await prisma.asset.create({
    data: {
      name: parsed.data.name,
      type: parsed.data.type,
      purchaseValue: purchaseVal,
      currentValue: currentVal,
      value: currentVal,
      acquired: parsed.data.acquired ? new Date(`${parsed.data.acquired}T00:00:00`) : new Date(),
      userId,
    },
  });

  revalidatePath('/assets');
  revalidatePath(`/assets/${asset.id}`);
  revalidatePath('/dashboard');
  return { success: true, item: { name: asset.name, value: asset.currentValue } };
}

export async function updateAsset(id: number, formData: FormData) {
  const userId = await currentUserId();
  if (!userId) return { error: 'Please sign in to update an asset.' };

  const parsed = assetSchema.safeParse({
    name: formData.get('name'),
    type: formData.get('type'),
    purchaseValue: formData.get('purchaseValue') ?? formData.get('value'),
    currentValue: formData.get('currentValue') || undefined,
    acquired: formData.get('acquired') || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Enter valid asset details.' };
  }

  const existing = await prisma.asset.findFirst({ where: { id, userId } });
  if (!existing) return { error: 'Asset not found or unauthorized.' };

  const purchaseVal = parsed.data.purchaseValue;
  const currentVal = parsed.data.currentValue ?? (existing.currentValue > 0 ? existing.currentValue : purchaseVal);

  const updated = await prisma.asset.update({
    where: { id },
    data: {
      name: parsed.data.name,
      type: parsed.data.type,
      purchaseValue: purchaseVal,
      currentValue: currentVal,
      value: currentVal,
      acquired: parsed.data.acquired ? new Date(`${parsed.data.acquired}T00:00:00`) : null,
    },
  });

  revalidatePath('/assets');
  revalidatePath(`/assets/${id}`);
  revalidatePath('/dashboard');
  return { success: true, item: { name: updated.name, value: updated.currentValue } };
}

export async function revalueAsset(id: number, newCurrentValue: number) {
  const userId = await currentUserId();
  if (!userId) return { error: 'Please sign in to revalue this asset.' };

  if (isNaN(newCurrentValue) || newCurrentValue < 0) {
    return { error: 'Please provide a valid non-negative current value.' };
  }

  const existing = await prisma.asset.findFirst({ where: { id, userId } });
  if (!existing) return { error: 'Asset not found or unauthorized.' };

  const updated = await prisma.asset.update({
    where: { id },
    data: {
      currentValue: newCurrentValue,
      value: newCurrentValue,
    },
  });

  revalidatePath('/assets');
  revalidatePath(`/assets/${id}`);
  revalidatePath('/dashboard');
  return { success: true, item: { name: updated.name, currentValue: updated.currentValue } };
}

export async function deleteAsset(id: number) {
  const userId = await currentUserId();
  if (!userId) return { error: 'Please sign in to delete an asset.' };

  const existing = await prisma.asset.findFirst({ where: { id, userId } });
  if (!existing) return { error: 'Asset not found or unauthorized.' };

  await prisma.asset.delete({ where: { id } });

  revalidatePath('/assets');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function createInvestment(formData: FormData) {
  const userId = await currentUserId();
  if (!userId) return { error: 'Please sign in with a verified email to add an investment.' };

  const parsed = investmentSchema.safeParse({
    name: formData.get('name'),
    type: formData.get('type'),
    investedAmount: formData.get('investedAmount') ?? formData.get('amount'),
    currentValue: formData.get('currentValue') || undefined,
    quantity: formData.get('quantity') || undefined,
    dateAcquired: formData.get('dateAcquired') || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Enter valid investment details.' };
  }

  const investedAmt = parsed.data.investedAmount;
  const currentVal = parsed.data.currentValue ?? investedAmt;

  const investment = await prisma.investment.create({
    data: {
      name: parsed.data.name,
      type: parsed.data.type,
      investedAmount: investedAmt,
      currentValue: currentVal,
      amount: currentVal,
      quantity: parsed.data.quantity,
      dateAcquired: parsed.data.dateAcquired ? new Date(`${parsed.data.dateAcquired}T00:00:00`) : new Date(),
      userId,
    },
  });

  revalidatePath('/investments');
  revalidatePath('/dashboard');
  return { success: true, item: { name: investment.name, value: investment.currentValue } };
}

export async function updateInvestment(id: number, formData: FormData) {
  const userId = await currentUserId();
  if (!userId) return { error: 'Please sign in to update an investment.' };

  const parsed = investmentSchema.safeParse({
    name: formData.get('name'),
    type: formData.get('type'),
    investedAmount: formData.get('investedAmount') ?? formData.get('amount'),
    currentValue: formData.get('currentValue') || undefined,
    quantity: formData.get('quantity') || undefined,
    dateAcquired: formData.get('dateAcquired') || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Enter valid investment details.' };
  }

  const existing = await prisma.investment.findFirst({ where: { id, userId } });
  if (!existing) return { error: 'Investment not found or unauthorized.' };

  const investedAmt = parsed.data.investedAmount;
  const currentVal = parsed.data.currentValue ?? (existing.currentValue > 0 ? existing.currentValue : investedAmt);

  const updated = await prisma.investment.update({
    where: { id },
    data: {
      name: parsed.data.name,
      type: parsed.data.type,
      investedAmount: investedAmt,
      currentValue: currentVal,
      amount: currentVal,
      quantity: parsed.data.quantity,
      dateAcquired: parsed.data.dateAcquired ? new Date(`${parsed.data.dateAcquired}T00:00:00`) : null,
    },
  });

  revalidatePath('/investments');
  revalidatePath('/dashboard');
  return { success: true, item: { name: updated.name, value: updated.currentValue } };
}

export async function deleteInvestment(id: number) {
  const userId = await currentUserId();
  if (!userId) return { error: 'Please sign in to delete an investment.' };

  const existing = await prisma.investment.findFirst({ where: { id, userId } });
  if (!existing) return { error: 'Investment not found or unauthorized.' };

  await prisma.investment.delete({ where: { id } });

  revalidatePath('/investments');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function getInvestments() {
  const userId = await currentUserId();
  if (!userId) return [];
  const raw = await prisma.investment.findMany({
    where: { userId },
    orderBy: [{ dateAcquired: 'desc' }, { id: 'desc' }],
    include: {
      _count: {
        select: { transactions: true },
      },
    },
  });

  return raw.map((inv) => {
    const invested = inv.investedAmount > 0 ? inv.investedAmount : (inv.amount > 0 ? inv.amount : 0);
    const current = inv.currentValue > 0 ? inv.currentValue : (inv.amount > 0 ? inv.amount : invested);
    const gainLoss = current - invested;
    const gainLossPercentage = invested > 0 ? (gainLoss / invested) * 100 : 0;
    return {
      ...inv,
      investedAmount: invested,
      currentValue: current,
      gainLoss,
      gainLossPercentage,
    };
  });
}

export async function getInvestmentById(id: number) {
  const userId = await currentUserId();
  if (!userId) return null;

  const investment = await prisma.investment.findFirst({
    where: { id, userId },
    include: {
      transactions: {
        include: { account: true, category: true },
        orderBy: { date: 'desc' },
      },
    },
  });
  if (!investment) return null;

  const investedAmount = investment.investedAmount > 0 ? investment.investedAmount : investment.amount;
  const currentValue = investment.currentValue > 0 ? investment.currentValue : (investment.amount > 0 ? investment.amount : investedAmount);
  const gainLoss = currentValue - investedAmount;

  return {
    ...investment,
    investedAmount,
    currentValue,
    gainLoss,
    gainLossPercentage: investedAmount > 0 ? (gainLoss / investedAmount) * 100 : 0,
  };
}

export async function getPortfolioTotals() {
  const userId = await currentUserId();
  if (!userId) return { assetValue: 0, purchaseValue: 0, investmentValue: 0, investedAmount: 0 };
  const [assets, investments] = await Promise.all([
    prisma.asset.findMany({ where: { userId } }),
    prisma.investment.findMany({ where: { userId } }),
  ]);

  let totalAssetValue = 0;
  let totalPurchaseValue = 0;
  for (const a of assets) {
    const pVal = a.purchaseValue > 0 ? a.purchaseValue : a.value;
    const cVal = a.currentValue > 0 ? a.currentValue : (a.value > 0 ? a.value : pVal);
    totalPurchaseValue += pVal;
    totalAssetValue += cVal;
  }

  let totalInvestmentValue = 0;
  let totalInvestedAmount = 0;
  for (const inv of investments) {
    const iAmt = inv.investedAmount > 0 ? inv.investedAmount : inv.amount;
    const cVal = inv.currentValue > 0 ? inv.currentValue : (inv.amount > 0 ? inv.amount : iAmt);
    totalInvestedAmount += iAmt;
    totalInvestmentValue += cVal;
  }

  return {
    assetValue: totalAssetValue,
    purchaseValue: totalPurchaseValue,
    investmentValue: totalInvestmentValue,
    investedAmount: totalInvestedAmount,
  };
}
