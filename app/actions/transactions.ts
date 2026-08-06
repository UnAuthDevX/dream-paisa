'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getActiveDatabaseUser } from '@/lib/account-lifecycle';

const transactionSchema = z.object({
  accountId: z.coerce.number().int().positive(),
  categoryId: z.coerce.number().int().positive().optional().nullable(),
  amount: z.coerce.number().finite().refine((amount) => amount !== 0, 'Amount cannot be zero.'),
  notes: z.string().trim().max(500).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

async function getOrCreateCurrentUserId() {
  const dbUser = await getActiveDatabaseUser();
  if (!dbUser) return null;
  return dbUser.id;
}

export async function getCategories() {
  return await prisma.category.findMany({
    orderBy: { type: 'asc' }
  });
}

export async function getTransactions() {
  const userId = await getOrCreateCurrentUserId();
  if (!userId) return [];

  return await prisma.transaction.findMany({
    where: {
      account: {
        userId,
      }
    },
    include: {
      account: true,
      category: true,
    },
    orderBy: {
      date: 'desc'
    },
    take: 50,
  });
}

export async function createTransaction(formData: FormData) {
  const userId = await getOrCreateCurrentUserId();
  if (!userId) return { error: 'You must sign in with a verified email to create a transaction.' };

  const parsed = transactionSchema.safeParse({
    accountId: formData.get('accountId'),
    categoryId: formData.get('categoryId') || undefined,
    amount: formData.get('amount'),
    notes: formData.get('notes'),
    date: formData.get('date'),
  });

  if (!parsed.success) {
    return { error: 'Invalid input' };
  }

  // Verify account belongs to user
  const account = await prisma.account.findFirst({
    where: { id: parsed.data.accountId, userId }
  });

  if (!account) {
    return { error: 'Account not found or unauthorized' };
  }

  const amount = parsed.data.amount;
  const dateObj = parsed.data.date ? new Date(`${parsed.data.date}T00:00:00`) : new Date();
  if (Number.isNaN(dateObj.getTime())) return { error: 'Please provide a valid transaction date.' };

  // Create transaction and update account balance in a transaction
  await prisma.$transaction(async (tx) => {
    await tx.transaction.create({
      data: {
        accountId: account.id,
        categoryId: parsed.data.categoryId,
        amount,
        notes: parsed.data.notes,
        date: dateObj,
      }
    });

    // Determine if income or expense by amount (or category type)
    // For simplicity, we assume positive amount = income/credit, negative = expense/debit
    await tx.account.update({
      where: { id: account.id },
      data: {
        balance: {
          increment: amount,
        }
      }
    });
  });

  revalidatePath('/transactions');
  revalidatePath('/dashboard');
  revalidatePath('/accounts');

  return { success: true, transaction: { amount, notes: parsed.data.notes ?? '' } };
}

export async function getDashboardInsights() {
  const userId = await getOrCreateCurrentUserId();
  if (!userId) return { totalBalance: 0, monthlyIncome: 0, monthlyExpenses: 0, categoryChartData: [] };

  // Get all accounts balance
  const accounts = await prisma.account.findMany({
    where: { userId }
  });
  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  // Group transactions by category for this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const transactions = await prisma.transaction.findMany({
    where: {
      account: { userId },
      date: { gte: startOfMonth }
    },
    include: { category: true }
  });

  let income = 0;
  let expenses = 0;
  const expensesByCategory: Record<string, number> = {};

  transactions.forEach(t => {
    if (t.amount > 0) {
      income += t.amount;
    } else {
      expenses += Math.abs(t.amount);
      const catName = t.category?.name || 'Uncategorized';
      expensesByCategory[catName] = (expensesByCategory[catName] || 0) + Math.abs(t.amount);
    }
  });

  const categoryChartData = Object.keys(expensesByCategory).map(key => ({
    name: key,
    value: expensesByCategory[key]
  }));

  return {
    totalBalance,
    monthlyIncome: income,
    monthlyExpenses: expenses,
    categoryChartData
  };
}
