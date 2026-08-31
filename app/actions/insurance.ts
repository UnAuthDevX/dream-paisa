'use server';

import prisma from '@/lib/db';
import { getCurrentDatabaseUser } from '@/lib/account-lifecycle';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export type InsuranceWithMetrics = {
  id: number;
  name: string;
  type: string;
  provider: string;
  policyNumber: string | null;
  coverageAmount: number;
  premiumAmount: number;
  premiumFrequency: string;
  startDate: Date;
  renewalDate: Date;
  expiryDate: Date | null;
  nominee: string | null;
  status: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  transactionCount: number;
  annualizedPremium: number;
  daysUntilRenewal: number;
};

const insuranceSchema = z.object({
  name: z.string().min(1, 'Policy name is required'),
  type: z.string().min(1, 'Insurance type is required'),
  provider: z.string().min(1, 'Provider is required'),
  policyNumber: z.string().optional().nullable(),
  coverageAmount: z.coerce.number().min(0, 'Coverage amount cannot be negative'),
  premiumAmount: z.coerce.number().positive('Premium amount must be positive'),
  premiumFrequency: z.string().min(1, 'Premium frequency is required'),
  startDate: z.string().optional(),
  renewalDate: z.string().min(1, 'Renewal date is required'),
  expiryDate: z.string().optional().nullable(),
  nominee: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function getInsurances() {
  const user = await getCurrentDatabaseUser();
  if (!user) {
    return {
      insurances: [],
      totalCoverage: 0,
      totalAnnualPremium: 0,
      activePoliciesCount: 0,
      upcomingRenewalsCount: 0,
    };
  }

  const raw = await prisma.insurance.findMany({
    where: { userId: user.id },
    include: {
      _count: {
        select: { transactions: true },
      },
    },
    orderBy: { renewalDate: 'asc' },
  });

  const now = new Date();

  const insurances: InsuranceWithMetrics[] = raw.map((i) => {
    let annualized = i.premiumAmount;
    if (i.premiumFrequency === 'MONTHLY') annualized = i.premiumAmount * 12;
    else if (i.premiumFrequency === 'QUARTERLY') annualized = i.premiumAmount * 4;

    const diffMs = new Date(i.renewalDate).getTime() - now.getTime();
    const daysUntilRenewal = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return {
      ...i,
      transactionCount: i._count.transactions,
      annualizedPremium: annualized,
      daysUntilRenewal,
    };
  });

  const totalCoverage = insurances.reduce((acc, i) => acc + (i.status === 'ACTIVE' ? i.coverageAmount : 0), 0);
  const totalAnnualPremium = insurances.reduce((acc, i) => acc + (i.status === 'ACTIVE' ? i.annualizedPremium : 0), 0);
  const activePoliciesCount = insurances.filter((i) => i.status === 'ACTIVE').length;
  const upcomingRenewalsCount = insurances.filter((i) => i.status === 'ACTIVE' && i.daysUntilRenewal <= 30 && i.daysUntilRenewal >= 0).length;

  return {
    insurances,
    totalCoverage,
    totalAnnualPremium,
    activePoliciesCount,
    upcomingRenewalsCount,
  };
}

export async function getInsuranceById(id: number) {
  const user = await getCurrentDatabaseUser();
  if (!user) return null;

  const policy = await prisma.insurance.findFirst({
    where: { id, userId: user.id },
    include: {
      _count: { select: { transactions: true } },
      transactions: {
        include: { account: true },
        orderBy: { date: 'desc' },
      },
    },
  });

  if (!policy) return null;

  const now = new Date();
  const diffMs = new Date(policy.renewalDate).getTime() - now.getTime();
  const daysUntilRenewal = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  let annualized = policy.premiumAmount;
  if (policy.premiumFrequency === 'MONTHLY') annualized = policy.premiumAmount * 12;
  else if (policy.premiumFrequency === 'QUARTERLY') annualized = policy.premiumAmount * 4;

  return {
    ...policy,
    transactionCount: policy._count.transactions,
    annualizedPremium: annualized,
    daysUntilRenewal,
  };
}

export async function createInsurance(formData: FormData) {
  const user = await getCurrentDatabaseUser();
  if (!user) return { error: 'Unauthorized' };

  const rawData = {
    name: formData.get('name'),
    type: formData.get('type'),
    provider: formData.get('provider'),
    policyNumber: formData.get('policyNumber'),
    coverageAmount: formData.get('coverageAmount'),
    premiumAmount: formData.get('premiumAmount'),
    premiumFrequency: formData.get('premiumFrequency'),
    startDate: formData.get('startDate'),
    renewalDate: formData.get('renewalDate'),
    expiryDate: formData.get('expiryDate'),
    nominee: formData.get('nominee'),
    notes: formData.get('notes'),
  };

  const parsed = insuranceSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid input' };
  }

  const startDate = parsed.data.startDate ? new Date(parsed.data.startDate) : new Date();
  const renewalDate = new Date(parsed.data.renewalDate);
  const expiryDate = parsed.data.expiryDate ? new Date(parsed.data.expiryDate) : null;

  const policy = await prisma.insurance.create({
    data: {
      userId: user.id,
      name: parsed.data.name,
      type: parsed.data.type,
      provider: parsed.data.provider,
      policyNumber: parsed.data.policyNumber || null,
      coverageAmount: parsed.data.coverageAmount,
      premiumAmount: parsed.data.premiumAmount,
      premiumFrequency: parsed.data.premiumFrequency,
      startDate,
      renewalDate,
      expiryDate,
      nominee: parsed.data.nominee || null,
      status: 'ACTIVE',
      notes: parsed.data.notes || null,
    },
  });

  revalidatePath('/insurance');
  revalidatePath('/dashboard');
  return { success: true, policy };
}

export async function updateInsurance(id: number, formData: FormData) {
  const user = await getCurrentDatabaseUser();
  if (!user) return { error: 'Unauthorized' };

  const existing = await prisma.insurance.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) return { error: 'Insurance policy not found' };

  const rawData = {
    name: formData.get('name'),
    type: formData.get('type'),
    provider: formData.get('provider'),
    policyNumber: formData.get('policyNumber'),
    coverageAmount: formData.get('coverageAmount'),
    premiumAmount: formData.get('premiumAmount'),
    premiumFrequency: formData.get('premiumFrequency'),
    startDate: formData.get('startDate'),
    renewalDate: formData.get('renewalDate'),
    expiryDate: formData.get('expiryDate'),
    nominee: formData.get('nominee'),
    notes: formData.get('notes'),
  };

  const parsed = insuranceSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid input' };
  }

  const policy = await prisma.insurance.update({
    where: { id },
    data: {
      name: parsed.data.name,
      type: parsed.data.type,
      provider: parsed.data.provider,
      policyNumber: parsed.data.policyNumber || null,
      coverageAmount: parsed.data.coverageAmount,
      premiumAmount: parsed.data.premiumAmount,
      premiumFrequency: parsed.data.premiumFrequency,
      renewalDate: new Date(parsed.data.renewalDate),
      expiryDate: parsed.data.expiryDate ? new Date(parsed.data.expiryDate) : null,
      nominee: parsed.data.nominee || null,
      notes: parsed.data.notes || null,
    },
  });

  revalidatePath('/insurance');
  revalidatePath(`/insurance/${id}`);
  revalidatePath('/dashboard');
  return { success: true, policy };
}

export async function deleteInsurance(id: number) {
  const user = await getCurrentDatabaseUser();
  if (!user) return { error: 'Unauthorized' };

  await prisma.insurance.deleteMany({
    where: { id, userId: user.id },
  });

  revalidatePath('/insurance');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function payInsurancePremium({
  insuranceId,
  accountId,
  amount,
  nextRenewalDate,
  date,
  notes,
}: {
  insuranceId: number;
  accountId: number;
  amount: number;
  nextRenewalDate?: string;
  date?: string;
  notes?: string;
}) {
  const user = await getCurrentDatabaseUser();
  if (!user) return { error: 'Unauthorized' };

  const policy = await prisma.insurance.findFirst({
    where: { id: insuranceId, userId: user.id },
  });
  if (!policy) return { error: 'Insurance policy not found' };

  const account = await prisma.account.findFirst({
    where: { id: accountId, userId: user.id },
  });
  if (!account) return { error: 'Account not found' };

  if (amount <= 0) return { error: 'Premium amount must be positive' };

  await prisma.$transaction(async (tx) => {
    // 1. Record Premium Payment Transaction (Expense)
    await tx.transaction.create({
      data: {
        accountId,
        insuranceId,
        transactionType: 'INSURANCE',
        subType: 'PREMIUM',
        amount: -amount,
        date: date ? new Date(date) : new Date(),
        notes: notes || `Insurance premium payment for ${policy.name}`,
      },
    });

    // 2. Advance Renewal Date on Policy if specified
    const updatedRenewal = nextRenewalDate
      ? new Date(nextRenewalDate)
      : new Date(new Date(policy.renewalDate).setFullYear(new Date(policy.renewalDate).getFullYear() + 1));

    await tx.insurance.update({
      where: { id: insuranceId },
      data: {
        renewalDate: updatedRenewal,
        status: 'ACTIVE',
      },
    });

    // 3. Deduct from Account Balance
    await tx.account.update({
      where: { id: accountId },
      data: {
        balance: { decrement: amount },
      },
    });
  });

  revalidatePath('/insurance');
  revalidatePath(`/insurance/${insuranceId}`);
  revalidatePath('/transactions');
  revalidatePath('/accounts');
  revalidatePath('/dashboard');

  return { success: true };
}
