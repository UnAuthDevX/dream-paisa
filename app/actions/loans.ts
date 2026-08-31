'use server';

import prisma from '@/lib/db';
import { getCurrentDatabaseUser } from '@/lib/account-lifecycle';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export type LoanWithMetrics = {
  id: number;
  name: string;
  type: string;
  lender: string | null;
  principalAmount: number;
  interestRate: number;
  interestType: string;
  tenureMonths: number;
  startDate: Date;
  endDate: Date | null;
  emiAmount: number;
  remainingPrincipal: number;
  totalInterestPaid: number;
  status: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  transactionCount: number;
  principalPaid: number;
  progressPercentage: number;
};

const loanSchema = z.object({
  name: z.string().min(1, 'Loan name is required'),
  type: z.string().min(1, 'Loan type is required'),
  lender: z.string().optional().nullable(),
  principalAmount: z.coerce.number().positive('Principal amount must be positive'),
  interestRate: z.coerce.number().min(0, 'Interest rate cannot be negative'),
  tenureMonths: z.coerce.number().int().positive('Tenure must be at least 1 month'),
  startDate: z.string().optional(),
  emiAmount: z.coerce.number().min(0, 'EMI amount cannot be negative'),
  notes: z.string().optional().nullable(),
});

export async function getLoans() {
  const user = await getCurrentDatabaseUser();
  if (!user) return { loans: [], totalOutstanding: 0, totalPrincipal: 0, totalInterestPaid: 0, totalMonthlyEMI: 0 };

  const rawLoans = await prisma.loan.findMany({
    where: { userId: user.id },
    include: {
      _count: {
        select: { transactions: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const loans: LoanWithMetrics[] = rawLoans.map((l) => {
    const principalPaid = Math.max(0, l.principalAmount - l.remainingPrincipal);
    const progressPercentage = l.principalAmount > 0 ? (principalPaid / l.principalAmount) * 100 : 100;
    return {
      ...l,
      transactionCount: l._count.transactions,
      principalPaid,
      progressPercentage,
    };
  });

  const totalOutstanding = loans.reduce((acc, l) => acc + (l.status === 'ACTIVE' ? l.remainingPrincipal : 0), 0);
  const totalPrincipal = loans.reduce((acc, l) => acc + l.principalAmount, 0);
  const totalInterestPaid = loans.reduce((acc, l) => acc + l.totalInterestPaid, 0);
  const totalMonthlyEMI = loans.reduce((acc, l) => acc + (l.status === 'ACTIVE' ? l.emiAmount : 0), 0);

  return {
    loans,
    totalOutstanding,
    totalPrincipal,
    totalInterestPaid,
    totalMonthlyEMI,
  };
}

export async function getLoanById(id: number) {
  const user = await getCurrentDatabaseUser();
  if (!user) return null;

  const loan = await prisma.loan.findFirst({
    where: { id, userId: user.id },
    include: {
      transactions: {
        include: {
          account: true,
        },
        orderBy: { date: 'desc' },
      },
    },
  });

  if (!loan) return null;

  const principalPaid = Math.max(0, loan.principalAmount - loan.remainingPrincipal);
  const progressPercentage = loan.principalAmount > 0 ? (principalPaid / loan.principalAmount) * 100 : 100;

  return {
    ...loan,
    principalPaid,
    progressPercentage,
  };
}

export async function createLoan(formData: FormData) {
  const user = await getCurrentDatabaseUser();
  if (!user) return { error: 'Unauthorized' };

  const rawData = {
    name: formData.get('name'),
    type: formData.get('type'),
    lender: formData.get('lender'),
    principalAmount: formData.get('principalAmount'),
    interestRate: formData.get('interestRate'),
    tenureMonths: formData.get('tenureMonths'),
    startDate: formData.get('startDate'),
    emiAmount: formData.get('emiAmount'),
    notes: formData.get('notes'),
  };

  const parsed = loanSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid input' };
  }

  const startDate = parsed.data.startDate ? new Date(parsed.data.startDate) : new Date();
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + parsed.data.tenureMonths);

  const loan = await prisma.loan.create({
    data: {
      userId: user.id,
      name: parsed.data.name,
      type: parsed.data.type,
      lender: parsed.data.lender || null,
      principalAmount: parsed.data.principalAmount,
      interestRate: parsed.data.interestRate,
      tenureMonths: parsed.data.tenureMonths,
      startDate,
      endDate,
      emiAmount: parsed.data.emiAmount,
      remainingPrincipal: parsed.data.principalAmount,
      status: 'ACTIVE',
      notes: parsed.data.notes || null,
    },
  });

  revalidatePath('/loans');
  revalidatePath('/dashboard');
  return { success: true, loan };
}

export async function updateLoan(id: number, formData: FormData) {
  const user = await getCurrentDatabaseUser();
  if (!user) return { error: 'Unauthorized' };

  const existing = await prisma.loan.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) return { error: 'Loan not found' };

  const rawData = {
    name: formData.get('name'),
    type: formData.get('type'),
    lender: formData.get('lender'),
    principalAmount: formData.get('principalAmount'),
    interestRate: formData.get('interestRate'),
    tenureMonths: formData.get('tenureMonths'),
    startDate: formData.get('startDate'),
    emiAmount: formData.get('emiAmount'),
    notes: formData.get('notes'),
  };

  const parsed = loanSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid input' };
  }

  const remainingPrincipal = Math.min(parsed.data.principalAmount, existing.remainingPrincipal);
  const status = remainingPrincipal <= 0 ? 'CLOSED' : 'ACTIVE';

  const loan = await prisma.loan.update({
    where: { id },
    data: {
      name: parsed.data.name,
      type: parsed.data.type,
      lender: parsed.data.lender || null,
      principalAmount: parsed.data.principalAmount,
      interestRate: parsed.data.interestRate,
      tenureMonths: parsed.data.tenureMonths,
      emiAmount: parsed.data.emiAmount,
      remainingPrincipal,
      status,
      notes: parsed.data.notes || null,
    },
  });

  revalidatePath('/loans');
  revalidatePath(`/loans/${id}`);
  revalidatePath('/dashboard');
  return { success: true, loan };
}

export async function deleteLoan(id: number) {
  const user = await getCurrentDatabaseUser();
  if (!user) return { error: 'Unauthorized' };

  await prisma.loan.deleteMany({
    where: { id, userId: user.id },
  });

  revalidatePath('/loans');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function payLoanEMI({
  loanId,
  accountId,
  principalComponent,
  interestComponent,
  date,
  notes,
}: {
  loanId: number;
  accountId: number;
  principalComponent: number;
  interestComponent: number;
  date?: string;
  notes?: string;
}) {
  const user = await getCurrentDatabaseUser();
  if (!user) return { error: 'Unauthorized' };

  const loan = await prisma.loan.findFirst({
    where: { id: loanId, userId: user.id },
  });
  if (!loan) return { error: 'Loan not found' };

  const account = await prisma.account.findFirst({
    where: { id: accountId, userId: user.id },
  });
  if (!account) return { error: 'Account not found' };

  const totalEMI = principalComponent + interestComponent;
  if (totalEMI <= 0) return { error: 'Total EMI amount must be greater than zero' };

  const newRemaining = Math.max(0, loan.remainingPrincipal - principalComponent);
  const newStatus = newRemaining === 0 ? 'CLOSED' : 'ACTIVE';

  await prisma.$transaction(async (tx) => {
    // 1. Record Transaction
    await tx.transaction.create({
      data: {
        accountId,
        loanId,
        transactionType: 'LOAN',
        subType: 'EMI',
        amount: -totalEMI,
        principalComponent,
        interestComponent,
        date: date ? new Date(date) : new Date(),
        notes: notes || `EMI payment for ${loan.name}`,
      },
    });

    // 2. Update Loan State
    await tx.loan.update({
      where: { id: loanId },
      data: {
        remainingPrincipal: newRemaining,
        totalInterestPaid: { increment: interestComponent },
        status: newStatus,
      },
    });

    // 3. Update Account Balance
    await tx.account.update({
      where: { id: accountId },
      data: {
        balance: { decrement: totalEMI },
      },
    });
  });

  revalidatePath('/loans');
  revalidatePath(`/loans/${loanId}`);
  revalidatePath('/transactions');
  revalidatePath('/accounts');
  revalidatePath('/dashboard');

  return { success: true };
}