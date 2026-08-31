'use server';

import { Prisma } from "@prisma/client";
import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getActiveDatabaseUser } from '@/lib/account-lifecycle';
import { localDayRange } from '@/lib/date';

const transactionSchema = z.object({
  accountId: z.coerce.number().int().positive(),
  categoryId: z.string().optional().nullable(),
  amount: z.coerce.number().finite().refine((amount) => amount !== 0, 'Amount cannot be zero.'),
  notes: z.string().trim().max(500).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  txType: z.enum(['Expense', 'Income', 'Asset', 'Investment']).optional(),
  assetMode: z.enum(['new', 'existing']).optional(),
  assetId: z.coerce.number().int().positive().optional().nullable(),
  newAssetName: z.string().trim().max(100).optional(),
  newAssetCategory: z.string().trim().max(50).optional(),
  assetSubType: z.enum(['PURCHASE', 'REPAIR', 'MAINTENANCE', 'ACCESSORIES']).optional(),
  investmentMode: z.enum(['new', 'existing']).optional(),
  investmentId: z.coerce.number().int().positive().optional().nullable(),
  newInvestmentName: z.string().trim().max(100).optional(),
  newInvestmentType: z.string().trim().max(50).optional(),
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

export async function createTransaction(formData: FormData) {
  const userId = await getOrCreateCurrentUserId();
  if (!userId) return { error: 'You must sign in with a verified email to create a transaction.' };

  const parsed = transactionSchema.safeParse({
    accountId: formData.get('accountId'),
    categoryId: formData.get('categoryId') || undefined,
    amount: formData.get('amount'),
    notes: formData.get('notes'),
    date: formData.get('date'),
    txType: formData.get('txType') || 'Expense',
    assetMode: formData.get('assetMode') || undefined,
    assetId: formData.get('assetId') || undefined,
    newAssetName: formData.get('newAssetName') || undefined,
    newAssetCategory: formData.get('newAssetCategory') || undefined,
    assetSubType: formData.get('assetSubType') || undefined,
    investmentMode: formData.get('investmentMode') || undefined,
    investmentId: formData.get('investmentId') || undefined,
    newInvestmentName: formData.get('newInvestmentName') || undefined,
    newInvestmentType: formData.get('newInvestmentType') || undefined,
  });

  if (!parsed.success) {
    return { error: 'Invalid input. Please check all required fields.' };
  }

  // Verify account belongs to user
  const account = await prisma.account.findFirst({
    where: { id: parsed.data.accountId, userId }
  });

  if (!account) {
    return { error: 'Account not found or unauthorized' };
  }

  const rawAmount = Math.abs(parsed.data.amount);
  const dateObj = parsed.data.date ? new Date(`${parsed.data.date}T00:00:00`) : new Date();
  if (Number.isNaN(dateObj.getTime())) return { error: 'Please provide a valid transaction date.' };

  const txType = parsed.data.txType || (parsed.data.amount > 0 ? 'Income' : 'Expense');
  const finalAmount = txType === 'Income' ? rawAmount : -rawAmount;
  let linkedAssetId: number | null = null;
  let linkedInvestmentId: number | null = null;
  let transactionTypeStr = txType.toUpperCase();
  let subTypeStr: string | null = null;

  await prisma.$transaction(async (tx) => {
    // 1. Handle Asset Flow
    if (txType === 'Asset') {
      transactionTypeStr = 'ASSET';
      subTypeStr = parsed.data.assetSubType || 'PURCHASE';

      if (parsed.data.assetMode === 'new') {
        const assetName = parsed.data.newAssetName || parsed.data.notes || 'New Asset';
        const assetCategory = parsed.data.newAssetCategory || 'Other';
        const createdAsset = await tx.asset.create({
          data: {
            userId,
            name: assetName,
            type: assetCategory,
            purchaseValue: rawAmount,
            currentValue: rawAmount,
            value: rawAmount,
            acquired: dateObj,
          },
        });
        linkedAssetId = createdAsset.id;
      } else if (parsed.data.assetId) {
        linkedAssetId = parsed.data.assetId;
        if (subTypeStr === 'PURCHASE') {
          await tx.asset.update({
            where: { id: parsed.data.assetId },
            data: {
              purchaseValue: { increment: rawAmount },
              currentValue: { increment: rawAmount },
              value: { increment: rawAmount },
            },
          });
        }
      }
    }

    // 2. Handle Investment Flow
    if (txType === 'Investment') {
      transactionTypeStr = 'INVESTMENT';
      subTypeStr = 'BUY';

      if (parsed.data.investmentMode === 'new') {
        const invName = parsed.data.newInvestmentName || parsed.data.notes || 'New Investment';
        const invType = parsed.data.newInvestmentType || 'General';
        const createdInvestment = await tx.investment.create({
          data: {
            userId,
            name: invName,
            type: invType,
            investedAmount: rawAmount,
            currentValue: rawAmount,
            amount: rawAmount,
            dateAcquired: dateObj,
          },
        });
        linkedInvestmentId = createdInvestment.id;
      } else if (parsed.data.investmentId) {
        linkedInvestmentId = parsed.data.investmentId;
        await tx.investment.update({
          where: { id: parsed.data.investmentId },
          data: {
            investedAmount: { increment: rawAmount },
            currentValue: { increment: rawAmount },
            amount: { increment: rawAmount },
          },
        });
      }
    }

    // 3. Create Transaction Record
    await tx.transaction.create({
      data: {
        accountId: account.id,
        categoryId: parsed.data.categoryId ?? null,
        amount: finalAmount,
        notes: parsed.data.notes,
        date: dateObj,
        transactionType: transactionTypeStr,
        subType: subTypeStr,
        assetId: linkedAssetId,
        investmentId: linkedInvestmentId,
      },
    });

    // 4. Update Bank Account Balance
    await tx.account.update({
      where: { id: account.id },
      data: {
        balance: {
          increment: finalAmount,
        },
      },
    });
  });

  revalidatePath('/transactions');
  revalidatePath('/dashboard');
  revalidatePath('/accounts');
  revalidatePath('/assets');
  if (linkedAssetId) revalidatePath(`/assets/${linkedAssetId}`);
  revalidatePath('/investments');

  return { success: true, transaction: { amount: finalAmount, notes: parsed.data.notes ?? '' } };
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
  });

  revalidatePath('/transactions');
  revalidatePath('/dashboard');
  revalidatePath('/accounts');
  revalidatePath('/assets');
  if (existing.assetId) revalidatePath(`/assets/${existing.assetId}`);
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
  revalidatePath('/assets');
  if (existing.assetId) revalidatePath(`/assets/${existing.assetId}`);
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
      incomeCategoryChartData: [],
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
  const incomeByCategory: Record<string, number> = {};

  transactions.forEach(t => {
    if (t.transactionType === 'TRANSFER') return;
    if (t.amount > 0) {
      income += t.amount;
      const catName = t.category?.name || 'Uncategorized';
      incomeByCategory[catName] = (incomeByCategory[catName] || 0) + t.amount;
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
  const incomeCategoryChartData = Object.keys(incomeByCategory).map(key => ({
    name: key,
    value: incomeByCategory[key]
  }));

  return {
    totalBalance,
    monthlyIncome: income,
    monthlyExpenses: expenses,
    categoryChartData,
    incomeCategoryChartData,
    selectedMonth: month,
    selectedYear: year,
    selectedMode: mode as 'monthly' | 'yearly',
  };
}

export async function getRecentTransactions(limit = 5, options: AnalysisOptions = {}) {
  const userId = await getOrCreateCurrentUserId();
  if (!userId) return [];

  const now = new Date();
  const year = options.year ?? now.getFullYear();
  const month = options.month ?? now.getMonth() + 1;
  const mode = options.mode ?? 'monthly';
  const startDate = mode === 'yearly' ? new Date(year, 0, 1) : new Date(year, month - 1, 1);
  const endDate = mode === 'yearly' ? new Date(year, 11, 31, 23, 59, 59, 999) : new Date(year, month, 0, 23, 59, 59, 999);

  return await prisma.transaction.findMany({
    where: {
      account: { userId },
      date: { gte: startDate, lte: endDate },
    },
    take: limit,
    orderBy: { date: 'desc' },
    include: {
      account: true,
      category: true,
      asset: true,
      investment: true,
      loan: true,
      recurringTransaction: true,
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
  recurringId?: string;
  loanId?: string;
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
  if (filters.recurringId) where.recurringTransactionId = Number(filters.recurringId);
  if (filters.loanId) where.loanId = Number(filters.loanId);

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
    const { start, end } = localDayRange(filters.date);

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
      asset: true,
      investment: true,
      loan: true,
      recurringTransaction: true,
    },
  });

  return { transactions };
}

export async function getTransactionAnalytics(options: AnalysisOptions = {}) {
  const userId = await getOrCreateCurrentUserId();
  if (!userId) {
    return {
      growth: {
        currentMonthCount: 0,
        previousMonthCount: 0,
        absoluteChange: 0,
        percentageChange: 0,
        displayGrowthString: '0 transactions',
      },
      savingsRate: {
        income: 0,
        expense: 0,
        savings: 0,
        savingsRate: 0,
        previousSavingsRate: 0,
        savingsRateChange: 0,
      },
    };
  }

  const now = new Date();
  const year = options.year ?? now.getFullYear();
  const month = options.month ?? now.getMonth() + 1;
  const mode = options.mode ?? 'monthly';
  const startCurrentMonth = mode === 'yearly' ? new Date(year, 0, 1, 0, 0, 0, 0) : new Date(year, month - 1, 1, 0, 0, 0, 0);
  const endCurrentMonth = mode === 'yearly' ? new Date(year, 11, 31, 23, 59, 59, 999) : new Date(year, month, 0, 23, 59, 59, 999);
  const startPrevMonth = mode === 'yearly' ? new Date(year - 1, 0, 1, 0, 0, 0, 0) : new Date(year, month - 2, 1, 0, 0, 0, 0);
  const endPrevMonth = mode === 'yearly' ? new Date(year - 1, 11, 31, 23, 59, 59, 999) : new Date(year, month - 1, 0, 23, 59, 59, 999);

  // Fetch Current & Previous Month Transactions for user's accounts
  const userAccounts = await prisma.account.findMany({
    where: { userId },
    select: { id: true },
  });
  const accountIds = userAccounts.map((a) => a.id);

  const [currentTxs, prevTxs] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        accountId: { in: accountIds },
        date: { gte: startCurrentMonth, lte: endCurrentMonth },
      },
    }),
    prisma.transaction.findMany({
      where: {
        accountId: { in: accountIds },
        date: { gte: startPrevMonth, lte: endPrevMonth },
      },
    }),
  ]);

  // 1. Transaction Growth Analytics
  const currentMonthCount = currentTxs.length;
  const previousMonthCount = prevTxs.length;
  const absoluteChange = currentMonthCount - previousMonthCount;

  let percentageChange = 0;
  let displayGrowthString = '';

  if (previousMonthCount === 0) {
    percentageChange = 100;
    displayGrowthString = absoluteChange > 0 ? `+${absoluteChange} transactions (New activity)` : '0 transactions';
  } else {
    percentageChange = (absoluteChange / previousMonthCount) * 100;
    const sign = absoluteChange >= 0 ? '+' : '';
    displayGrowthString = `${sign}${absoluteChange} transactions (${sign}${percentageChange.toFixed(1)}% vs last month)`;
  }

  // 2. Savings Rate Analytics
  // Exclude TRANSFER type
  const currIncome = currentTxs
    .filter((t) => t.transactionType !== 'TRANSFER' && t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);

  // For expenses, exclude TRANSFER and loan principal repayments (which are liability reductions, not pure expenses)
  const currExpense = currentTxs
    .filter((t) => t.transactionType !== 'TRANSFER' && t.amount < 0)
    .reduce((acc, t) => {
      // If EMI payment with principal component, only count interest component as pure expense
      if (t.transactionType === 'LOAN' && t.subType === 'EMI' && t.principalComponent !== null && t.principalComponent !== undefined) {
        return acc + (t.interestComponent ?? 0);
      }
      return acc + Math.abs(t.amount);
    }, 0);

  const currSavings = currIncome - currExpense;
  const savingsRate = currIncome > 0 ? (currSavings / currIncome) * 100 : 0;

  // Previous month savings rate
  const prevIncome = prevTxs
    .filter((t) => t.transactionType !== 'TRANSFER' && t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);

  const prevExpense = prevTxs
    .filter((t) => t.transactionType !== 'TRANSFER' && t.amount < 0)
    .reduce((acc, t) => {
      if (t.transactionType === 'LOAN' && t.subType === 'EMI' && t.principalComponent !== null && t.principalComponent !== undefined) {
        return acc + (t.interestComponent ?? 0);
      }
      return acc + Math.abs(t.amount);
    }, 0);

  const prevSavings = prevIncome - prevExpense;
  const previousSavingsRate = prevIncome > 0 ? (prevSavings / prevIncome) * 100 : 0;
  const savingsRateChange = savingsRate - previousSavingsRate;

  return {
    growth: {
      currentMonthCount,
      previousMonthCount,
      absoluteChange,
      percentageChange,
      displayGrowthString,
    },
    savingsRate: {
      income: currIncome,
      expense: currExpense,
      savings: currSavings,
      savingsRate,
      previousSavingsRate,
      savingsRateChange,
    },
  };
}
