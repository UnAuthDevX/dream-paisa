'use server';

import { Prisma } from "@prisma/client";
import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getActiveDatabaseUser } from '@/lib/account-lifecycle';

const transactionSchema = z.object({
  accountId: z.coerce.number().int().positive(),
  categoryId: z.string().optional().nullable(),
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
    where: { isActive: true },
    orderBy: [{ type: 'asc' }, { name: 'asc' }]
  });
}

async function revertInvestmentEffect(tx: any, userId: number, categoryId: string | null | undefined, amount: number, notes: string | null | undefined) {
  if (!categoryId) return;
  const category = await tx.category.findUnique({ where: { id: categoryId } });
  if (!category || category.name !== 'Investments') return;

  const investmentName = notes?.trim() || 'Investments';
  const isExpense = amount < 0;
  const absoluteAmount = Math.abs(amount);

  const existingInvestment = await tx.investment.findFirst({
    where: {
      userId,
      name: {
        equals: investmentName,
        mode: 'insensitive'
      }
    }
  });

  if (existingInvestment) {
    let newAmount = existingInvestment.amount;
    if (isExpense) {
      newAmount = Math.max(0, newAmount - absoluteAmount);
    } else {
      newAmount += absoluteAmount;
    }

    await tx.investment.update({
      where: { id: existingInvestment.id },
      data: { amount: newAmount }
    });
  }
}

async function applyInvestmentEffect(tx: any, userId: number, categoryId: string | null | undefined, amount: number, notes: string | null | undefined, date: Date) {
  if (!categoryId) return;
  const category = await tx.category.findUnique({ where: { id: categoryId } });
  if (!category || category.name !== 'Investments') return;

  const investmentName = notes?.trim() || 'Investments';
  const isExpense = amount < 0;
  const absoluteAmount = Math.abs(amount);

  const existingInvestment = await tx.investment.findFirst({
    where: {
      userId,
      name: {
        equals: investmentName,
        mode: 'insensitive'
      }
    }
  });

  if (existingInvestment) {
    let newAmount = existingInvestment.amount;
    if (isExpense) {
      newAmount += absoluteAmount;
    } else {
      newAmount = Math.max(0, newAmount - absoluteAmount);
    }

    await tx.investment.update({
      where: { id: existingInvestment.id },
      data: {
        amount: newAmount,
        dateAcquired: date
      }
    });
  } else {
    await tx.investment.create({
      data: {
        userId,
        name: investmentName,
        type: 'General',
        amount: isExpense ? absoluteAmount : 0,
        dateAcquired: date
      }
    });
  }
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

  await prisma.$transaction(async (tx) => {
    await tx.transaction.create({
      data: {
        accountId: account.id,
        categoryId: parsed.data.categoryId ?? null,
        amount,
        notes: parsed.data.notes,
        date: dateObj,
      }
    });

    await tx.account.update({
      where: { id: account.id },
      data: {
        balance: {
          increment: amount,
        }
      }
    });

    await applyInvestmentEffect(tx, userId, parsed.data.categoryId, amount, parsed.data.notes, dateObj);
  });

  revalidatePath('/transactions');
  revalidatePath('/dashboard');
  revalidatePath('/accounts');
  revalidatePath('/investments');

  return { success: true, transaction: { amount, notes: parsed.data.notes ?? '' } };
}

export async function updateTransaction(id: number, formData: FormData) {
  const userId = await getOrCreateCurrentUserId();
  if (!userId) return { error: 'You must sign in to update a transaction.' };

  const parsed = transactionSchema.safeParse({
    accountId: formData.get('accountId'),
    categoryId: formData.get('categoryId') || undefined,
    amount: formData.get('amount'),
    notes: formData.get('notes'),
    date: formData.get('date'),
  });

  if (!parsed.success) return { error: 'Invalid input.' };

  const existing = await prisma.transaction.findFirst({
    where: { id, account: { userId } },
    include: { account: true },
  });
  if (!existing) return { error: 'Transaction not found or unauthorized.' };

  const newAccount = await prisma.account.findFirst({
    where: { id: parsed.data.accountId, userId },
  });
  if (!newAccount) return { error: 'Account not found or unauthorized.' };

  const newAmount = parsed.data.amount;
  const oldAmount = existing.amount;
  const dateObj = parsed.data.date ? new Date(`${parsed.data.date}T00:00:00`) : new Date();
  if (Number.isNaN(dateObj.getTime())) return { error: 'Please provide a valid transaction date.' };

  await prisma.$transaction(async (tx) => {
    await revertInvestmentEffect(tx, userId, existing.categoryId, existing.amount, existing.notes);

    await tx.transaction.update({
      where: { id },
      data: {
        accountId: newAccount.id,
        categoryId: parsed.data.categoryId ?? null,
        amount: newAmount,
        notes: parsed.data.notes,
        date: dateObj,
      },
    });

    if (existing.accountId) {
      await tx.account.update({
        where: { id: existing.accountId },
        data: { balance: { decrement: oldAmount } },
      });
    }

    await tx.account.update({
      where: { id: newAccount.id },
      data: { balance: { increment: newAmount } },
    });

    await applyInvestmentEffect(tx, userId, parsed.data.categoryId, newAmount, parsed.data.notes, dateObj);
  });

  revalidatePath('/transactions');
  revalidatePath('/dashboard');
  revalidatePath('/accounts');
  revalidatePath('/investments');

  return { success: true, transaction: { amount: newAmount, notes: parsed.data.notes ?? '' } };
}

export async function deleteTransaction(id: number) {
  const userId = await getOrCreateCurrentUserId();
  if (!userId) return { error: 'You must sign in to delete a transaction.' };

  const existing = await prisma.transaction.findFirst({
    where: { id, account: { userId } },
  });
  if (!existing) return { error: 'Transaction not found or unauthorized.' };

  await prisma.$transaction(async (tx) => {
    await revertInvestmentEffect(tx, userId, existing.categoryId, existing.amount, existing.notes);

    await tx.transaction.delete({ where: { id } });
    if (existing.accountId) {
      await tx.account.update({
        where: { id: existing.accountId },
        data: { balance: { decrement: existing.amount } },
      });
    }
  });

  revalidatePath('/transactions');
  revalidatePath('/dashboard');
  revalidatePath('/accounts');
  revalidatePath('/investments');

  return { success: true };
}

export type AnalysisOptions = {
  month?: number;
  year?: number;
  mode?: 'monthly' | 'yearly';
};

export async function getDashboardInsights(options: AnalysisOptions = {}) {
  const userId = await getOrCreateCurrentUserId();
  if (!userId) {
    return {
      totalBalance: 0,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      categoryChartData: [],
      selectedMonth: new Date().getMonth() + 1,
      selectedYear: new Date().getFullYear(),
      selectedMode: 'monthly' as const,
    };
  }

  const accounts = await prisma.account.findMany({
    where: { userId }
  });
  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  const now = new Date();
  const year = options.year ?? now.getFullYear();
  const month = options.month ?? (now.getMonth() + 1);
  const mode = options.mode ?? 'monthly';

  let startDate: Date;
  let endDate: Date;

  if (mode === 'yearly') {
    startDate = new Date(year, 0, 1, 0, 0, 0, 0);
    endDate = new Date(year, 11, 31, 23, 59, 59, 999);
  } else {
    startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
    endDate = new Date(year, month, 0, 23, 59, 59, 999);
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      account: { userId },
      date: {
        gte: startDate,
        lte: endDate,
      }
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
    categoryChartData,
    selectedMonth: month,
    selectedYear: year,
    selectedMode: mode as 'monthly' | 'yearly',
  };
}

export async function getRecentTransactions(limit = 5) {
  const userId = await getOrCreateCurrentUserId();
  if (!userId) return [];

  return await prisma.transaction.findMany({
    where: {
      account: { userId }
    },
    take: limit,
    orderBy: { date: 'desc' },
    include: {
      account: true,
      category: true,
    }
  });
}

type TransactionFilters = {
  search?: string;
  account?: string;
  category?: string;
  type?: string;
  min?: string;
  max?: string;
  date?: string;
  allTime?: string;
  sort?: "newest" | "oldest" | "highest" | "lowest";
};

export async function getTransactions(filters: TransactionFilters = {}) {
  const user = await getActiveDatabaseUser();

  if (!user) {
    return { error: "You must sign in." };
  }

  const where: Prisma.TransactionWhereInput = {
    account: {
      userId: user.id,
    },
  };

  if (filters.search) {
    const amount = Number(filters.search);

    where.OR = [
      {
        notes: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
      ...(Number.isNaN(amount)
        ? []
        : [
            {
              amount,
            },
          ]),
    ];
  }

  if (filters.account) {
    where.accountId = Number(filters.account);
  }

  if (filters.category) {
    where.categoryId = filters.category;
  }

  const amountFilter: Prisma.FloatFilter = {};

  if (filters.type === "income") {
    amountFilter.gt = 0;
  }

  if (filters.type === "expense") {
    amountFilter.lt = 0;
  }

  if (filters.min) {
    const min = Number(filters.min);

    if (filters.type === "expense") {
      amountFilter.lte = -Math.abs(min);
    } else {
      amountFilter.gte = min;
    }
  }

  if (filters.max) {
    const max = Number(filters.max);

    if (filters.type === "expense") {
      amountFilter.gte = -Math.abs(max);
    } else {
      amountFilter.lte = max;
    }
  }

  if (Object.keys(amountFilter).length > 0) {
    where.amount = amountFilter;
  }

  // Date filter: if explicitly provided, use single day date range.
  // Otherwise, default to current calendar month (unless allTime is set).
  if (filters.date) {
    const start = new Date(filters.date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(filters.date);
    end.setHours(23, 59, 59, 999);

    where.date = {
      gte: start,
      lte: end,
    };
  } else if (!filters.search && !filters.account && !filters.category && !filters.type && !filters.min && !filters.max && filters.allTime !== 'true') {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    where.date = {
      gte: startOfMonth,
      lte: endOfMonth,
    };
  }

  const orderBy: Prisma.TransactionOrderByWithRelationInput =
    filters.sort === "oldest"
      ? { date: "asc" }
      : filters.sort === "highest"
      ? { amount: "desc" }
      : filters.sort === "lowest"
      ? { amount: "asc" }
      : { date: "desc" };

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy,
    include: {
      account: true,
      category: true,
    },
  });

  return { transactions };
}