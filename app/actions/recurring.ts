'use server';

import prisma from '@/lib/db';
import { getCurrentDatabaseUser } from '@/lib/account-lifecycle';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export type RecurringWithDetails = {
  id: number;
  name: string;
  amount: number;
  type: string;
  frequency: string;
  accountId: number;
  accountName: string;
  categoryId: string | null;
  categoryName: string | null;
  startDate: Date;
  nextOccurrence: Date;
  endDate: Date | null;
  isActive: boolean;
  notes: string | null;
  monthlyAmount: number;
  yearlyAmount: number;
  lastPaymentDate: Date | null;
};

const recurringSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  type: z.string().min(1, 'Type is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  accountId: z.coerce.number().positive('Account is required'),
  categoryId: z.string().optional().nullable(),
  startDate: z.string().optional(),
  endDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

function calculateNormalizedAmounts(amount: number, frequency: string) {
  let monthlyAmount = amount;
  let yearlyAmount = amount * 12;

  if (frequency === 'DAILY') {
    monthlyAmount = amount * 30;
    yearlyAmount = amount * 365;
  } else if (frequency === 'WEEKLY') {
    monthlyAmount = amount * 4.33;
    yearlyAmount = amount * 52;
  } else if (frequency === 'QUARTERLY') {
    monthlyAmount = amount / 3;
    yearlyAmount = amount * 4;
  } else if (frequency === 'YEARLY') {
    monthlyAmount = amount / 12;
    yearlyAmount = amount;
  }

  return { monthlyAmount, yearlyAmount };
}

function advanceOccurrence(date: Date, frequency: string) {
  const next = new Date(date);
  if (frequency === 'DAILY') next.setDate(next.getDate() + 1);
  else if (frequency === 'WEEKLY') next.setDate(next.getDate() + 7);
  else if (frequency === 'MONTHLY' || frequency === 'QUARTERLY') {
    const months = frequency === 'MONTHLY' ? 1 : 3;
    const day = next.getDate();
    next.setDate(1);
    next.setMonth(next.getMonth() + months);
    const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
    next.setDate(Math.min(day, lastDay));
  } else if (frequency === 'YEARLY') next.setFullYear(next.getFullYear() + 1);
  return next;
}

export async function getRecurringTransactions() {
  const user = await getCurrentDatabaseUser();
  if (!user) {
    return {
      recurring: [],
      monthlyCommitment: 0,
      yearlyCommitment: 0,
      activeCount: 0,
    };
  }

  // A visit to the dashboard/recurring page reconciles due active schedules.
  // The unique recurrence/date constraint keeps this idempotent across refreshes.
  await processDueRecurringTransactions();

  const raw = await prisma.recurringTransaction.findMany({
    where: { userId: user.id },
    include: {
      account: true,
      category: true,
      transactions: { orderBy: { date: 'desc' }, take: 1, select: { date: true } },
    },
    orderBy: { nextOccurrence: 'asc' },
  });

  // Repair legacy/stale schedules: once a payment exists for the displayed
  // payout date, the next payout must be the following cycle—not that same day.
  await Promise.all(raw.map(async (item) => {
    const lastPayment = item.transactions[0]?.date;
    if (!lastPayment || item.nextOccurrence > lastPayment) return;
    let nextOccurrence = new Date(item.nextOccurrence);
    while (nextOccurrence <= lastPayment) nextOccurrence = advanceOccurrence(nextOccurrence, item.frequency);
    item.nextOccurrence = nextOccurrence;
    await prisma.recurringTransaction.update({ where: { id: item.id }, data: { nextOccurrence } });
  }));

  const recurring: RecurringWithDetails[] = raw.map((r) => {
    const { monthlyAmount, yearlyAmount } = calculateNormalizedAmounts(r.amount, r.frequency);
    return {
      id: r.id,
      name: r.name,
      amount: r.amount,
      type: r.type,
      frequency: r.frequency,
      accountId: r.accountId,
      accountName: r.account.name,
      categoryId: r.categoryId,
      categoryName: r.category?.name || null,
      startDate: r.startDate,
      nextOccurrence: r.nextOccurrence,
      endDate: r.endDate,
      isActive: r.isActive,
      notes: r.notes,
      monthlyAmount,
      yearlyAmount,
      lastPaymentDate: r.transactions[0]?.date ?? null,
    };
  });

  const activeItems = recurring.filter((r) => r.isActive);
  const monthlyCommitment = activeItems.reduce((acc, r) => acc + (r.type === 'EXPENSE' ? r.monthlyAmount : 0), 0);
  const yearlyCommitment = activeItems.reduce((acc, r) => acc + (r.type === 'EXPENSE' ? r.yearlyAmount : 0), 0);

  return {
    recurring,
    monthlyCommitment,
    yearlyCommitment,
    activeCount: activeItems.length,
  };
}

export async function createRecurringTransaction(formData: FormData) {
  const user = await getCurrentDatabaseUser();
  if (!user) return { error: 'Unauthorized' };

  const rawData = {
    name: formData.get('name'),
    amount: formData.get('amount'),
    type: formData.get('type'),
    frequency: formData.get('frequency'),
    accountId: formData.get('accountId'),
    categoryId: formData.get('categoryId'),
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate'),
    notes: formData.get('notes'),
  };

  const parsed = recurringSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid input' };
  }

  const startDate = parsed.data.startDate ? new Date(parsed.data.startDate) : new Date();
  const account = await prisma.account.findFirst({ where: { id: parsed.data.accountId, userId: user.id }, select: { id: true } });
  if (!account) return { error: 'Account not found' };

  const item = await prisma.recurringTransaction.create({
    data: {
      userId: user.id,
      name: parsed.data.name,
      amount: parsed.data.amount,
      type: parsed.data.type,
      frequency: parsed.data.frequency,
      accountId: parsed.data.accountId,
      categoryId: parsed.data.categoryId || null,
      startDate,
      nextOccurrence: startDate,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
      isActive: true,
      notes: parsed.data.notes || null,
    },
  });

  revalidatePath('/recurring');
  revalidatePath('/dashboard');
  return { success: true, item };
}

export async function updateRecurringTransaction(id: number, formData: FormData) {
  const user = await getCurrentDatabaseUser();
  if (!user) return { error: 'Unauthorized' };

  const rawData = {
    name: formData.get('name'),
    amount: formData.get('amount'),
    type: formData.get('type'),
    frequency: formData.get('frequency'),
    accountId: formData.get('accountId'),
    categoryId: formData.get('categoryId'),
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate'),
    notes: formData.get('notes'),
  };

  const parsed = recurringSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid input' };
  }

  const existing = await prisma.recurringTransaction.findFirst({ where: { id, userId: user.id }, select: { id: true } });
  if (!existing) return { error: 'Recurring transaction not found' };
  const account = await prisma.account.findFirst({ where: { id: parsed.data.accountId, userId: user.id }, select: { id: true } });
  if (!account) return { error: 'Account not found' };

  const item = await prisma.recurringTransaction.update({
    where: { id },
    data: {
      name: parsed.data.name,
      amount: parsed.data.amount,
      type: parsed.data.type,
      frequency: parsed.data.frequency,
      accountId: parsed.data.accountId,
      categoryId: parsed.data.categoryId || null,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
      notes: parsed.data.notes || null,
    },
  });

  revalidatePath('/recurring');
  revalidatePath('/dashboard');
  return { success: true, item };
}

export async function toggleRecurringActive(id: number) {
  const user = await getCurrentDatabaseUser();
  if (!user) return { error: 'Unauthorized' };

  const existing = await prisma.recurringTransaction.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) return { error: 'Not found' };

  const updated = await prisma.recurringTransaction.update({
    where: { id },
    data: { isActive: !existing.isActive },
  });

  revalidatePath('/recurring');
  revalidatePath('/dashboard');
  return { success: true, isActive: updated.isActive };
}

export async function deleteRecurringTransaction(id: number) {
  const user = await getCurrentDatabaseUser();
  if (!user) return { error: 'Unauthorized' };

  await prisma.recurringTransaction.deleteMany({
    where: { id, userId: user.id },
  });

  revalidatePath('/recurring');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function processDueRecurringTransactions() {
  const user = await getCurrentDatabaseUser();
  if (!user) return { processedCount: 0 };
  const now = new Date();
  const dueItems = await prisma.recurringTransaction.findMany({ where: { userId: user.id, isActive: true, nextOccurrence: { lte: now } } });
  let processedCount = 0;

  for (const item of dueItems) {
    let occurrence = new Date(item.nextOccurrence);
    while (occurrence <= now && (!item.endDate || occurrence <= item.endDate)) {
      const amount = item.type === 'INCOME' ? item.amount : -item.amount;
      try {
        await prisma.$transaction(async (tx) => {
          await tx.transaction.create({ data: { accountId: item.accountId, categoryId: item.categoryId, recurringTransactionId: item.id, transactionType: item.type, amount, date: occurrence, notes: `[Recurring] ${item.name}` } });
          await tx.account.update({ where: { id: item.accountId }, data: { balance: { increment: amount } } });
        });
        processedCount++;
      } catch {
        // A simultaneous refresh may have posted this exact occurrence already.
      }
      occurrence = advanceOccurrence(occurrence, item.frequency);
    }
    await prisma.recurringTransaction.update({ where: { id: item.id }, data: { nextOccurrence: occurrence, isActive: !item.endDate || occurrence <= item.endDate } });
  }
  if (processedCount) { revalidatePath('/recurring'); revalidatePath('/transactions'); revalidatePath('/accounts'); revalidatePath('/dashboard'); }
  return { processedCount };
}

export async function markRecurringTransactionPaid(id: number, paymentDate = new Date()) {
  const user = await getCurrentDatabaseUser();
  if (!user) return { error: 'Unauthorized' };
  const item = await prisma.recurringTransaction.findFirst({ where: { id, userId: user.id, isActive: true } });
  if (!item) return { error: 'Recurring transaction not found or paused' };
  if (item.endDate && paymentDate > item.endDate) return { error: 'This schedule has ended' };
  const monthStart = new Date(paymentDate.getFullYear(), paymentDate.getMonth(), 1);
  const monthEnd = new Date(paymentDate.getFullYear(), paymentDate.getMonth() + 1, 0, 23, 59, 59, 999);
  const existingThisMonth = await prisma.transaction.findFirst({ where: { recurringTransactionId: item.id, date: { gte: monthStart, lte: monthEnd } }, select: { id: true } });
  if (existingThisMonth) return { error: 'This recurring payment is already recorded for this month.' };

  // Marking a payment early consumes the upcoming cycle as well. This prevents
  // a second transaction for that same month/cycle when the scheduled date arrives.
  let nextOccurrence = advanceOccurrence(new Date(item.nextOccurrence), item.frequency);
  while (nextOccurrence <= paymentDate) nextOccurrence = advanceOccurrence(nextOccurrence, item.frequency);
  const isActive = !item.endDate || nextOccurrence <= item.endDate;
  const amount = item.type === 'INCOME' ? item.amount : -item.amount;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.transaction.create({ data: { accountId: item.accountId, categoryId: item.categoryId, recurringTransactionId: item.id, transactionType: item.type, amount, date: paymentDate, notes: `[Recurring] ${item.name}` } });
      await tx.account.update({ where: { id: item.accountId }, data: { balance: { increment: amount } } });
      await tx.recurringTransaction.update({ where: { id: item.id }, data: { nextOccurrence, isActive } });
    });
  } catch {
    return { error: 'This payment could not be recorded. It may already be recorded for today.' };
  }
  revalidatePath('/recurring'); revalidatePath('/transactions'); revalidatePath('/accounts'); revalidatePath('/dashboard');
  return { success: true, nextOccurrence };
}

export async function deleteRecurringPayment(transactionId: number) {
  const user = await getCurrentDatabaseUser();
  if (!user) return { error: 'Unauthorized' };
  const transaction = await prisma.transaction.findFirst({ where: { id: transactionId, account: { userId: user.id }, recurringTransactionId: { not: null } } });
  if (!transaction?.recurringTransactionId) return { error: 'Recurring payment not found' };
  await prisma.$transaction(async (tx) => {
    await tx.transaction.delete({ where: { id: transaction.id } });
    if (transaction.accountId) await tx.account.update({ where: { id: transaction.accountId }, data: { balance: { decrement: transaction.amount } } });
  });
  revalidatePath('/recurring'); revalidatePath('/transactions'); revalidatePath('/accounts'); revalidatePath('/dashboard');
  return { success: true };
}
