'use server';

import prisma from '@/lib/db';
import { getCurrentDatabaseUser } from '@/lib/account-lifecycle';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export type GoalWithMetrics = {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  category: string;
  monthlyTarget: number | null;
  status: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  remainingAmount: number;
  progressPercentage: number;
  monthsRemaining: number;
  requiredMonthlySavings: number;
};

const goalSchema = z.object({
  name: z.string().min(1, 'Goal name is required'),
  targetAmount: z.coerce.number().positive('Target amount must be positive'),
  currentAmount: z.coerce.number().min(0, 'Current amount cannot be negative').default(0),
  targetDate: z.string().min(1, 'Target date is required'),
  category: z.string().min(1, 'Category is required'),
  monthlyTarget: z.coerce.number().min(0).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function getGoals() {
  const user = await getCurrentDatabaseUser();
  if (!user) {
    return {
      goals: [],
      totalTargetAmount: 0,
      totalCurrentAmount: 0,
      completedGoalsCount: 0,
    };
  }

  const raw = await prisma.goal.findMany({
    where: { userId: user.id },
    orderBy: { targetDate: 'asc' },
  });

  const now = new Date();

  const goals: GoalWithMetrics[] = raw.map((g) => {
    const remainingAmount = Math.max(0, g.targetAmount - g.currentAmount);
    const progressPercentage = g.targetAmount > 0 ? Math.min(100, (g.currentAmount / g.targetAmount) * 100) : 100;

    const tDate = new Date(g.targetDate);
    const yearDiff = tDate.getFullYear() - now.getFullYear();
    const monthDiff = tDate.getMonth() - now.getMonth();
    const monthsRemaining = Math.max(1, yearDiff * 12 + monthDiff);

    const requiredMonthlySavings = g.monthlyTarget ?? (remainingAmount > 0 ? remainingAmount / monthsRemaining : 0);

    return {
      ...g,
      remainingAmount,
      progressPercentage,
      monthsRemaining,
      requiredMonthlySavings,
    };
  });

  const totalTargetAmount = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const totalCurrentAmount = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const completedGoalsCount = goals.filter((g) => g.progressPercentage >= 100 || g.status === 'COMPLETED').length;

  return {
    goals,
    totalTargetAmount,
    totalCurrentAmount,
    completedGoalsCount,
  };
}

export async function createGoal(formData: FormData) {
  const user = await getCurrentDatabaseUser();
  if (!user) return { error: 'Unauthorized' };

  const rawData = {
    name: formData.get('name'),
    targetAmount: formData.get('targetAmount'),
    currentAmount: formData.get('currentAmount') || 0,
    targetDate: formData.get('targetDate'),
    category: formData.get('category'),
    monthlyTarget: formData.get('monthlyTarget'),
    notes: formData.get('notes'),
  };

  const parsed = goalSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid input' };
  }

  const targetDate = new Date(parsed.data.targetDate);
  const status = parsed.data.currentAmount >= parsed.data.targetAmount ? 'COMPLETED' : 'IN_PROGRESS';

  const goal = await prisma.goal.create({
    data: {
      userId: user.id,
      name: parsed.data.name,
      targetAmount: parsed.data.targetAmount,
      currentAmount: parsed.data.currentAmount,
      targetDate,
      category: parsed.data.category,
      monthlyTarget: parsed.data.monthlyTarget || null,
      status,
      notes: parsed.data.notes || null,
    },
  });

  revalidatePath('/goals');
  revalidatePath('/dashboard');
  return { success: true, goal };
}

export async function updateGoal(id: number, formData: FormData) {
  const user = await getCurrentDatabaseUser();
  if (!user) return { error: 'Unauthorized' };

  const rawData = {
    name: formData.get('name'),
    targetAmount: formData.get('targetAmount'),
    currentAmount: formData.get('currentAmount'),
    targetDate: formData.get('targetDate'),
    category: formData.get('category'),
    monthlyTarget: formData.get('monthlyTarget'),
    notes: formData.get('notes'),
  };

  const parsed = goalSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid input' };
  }

  const existing = await prisma.goal.findFirst({ where: { id, userId: user.id }, select: { id: true } });
  if (!existing) return { error: 'Goal not found' };

  const targetDate = new Date(parsed.data.targetDate);
  const status = parsed.data.currentAmount >= parsed.data.targetAmount ? 'COMPLETED' : 'IN_PROGRESS';

  const goal = await prisma.goal.update({
    where: { id },
    data: {
      name: parsed.data.name,
      targetAmount: parsed.data.targetAmount,
      currentAmount: parsed.data.currentAmount,
      targetDate,
      category: parsed.data.category,
      monthlyTarget: parsed.data.monthlyTarget || null,
      status,
      notes: parsed.data.notes || null,
    },
  });

  revalidatePath('/goals');
  revalidatePath('/dashboard');
  return { success: true, goal };
}

export async function updateGoalProgress(id: number, currentAmount: number) {
  const user = await getCurrentDatabaseUser();
  if (!user) return { error: 'Unauthorized' };

  const existing = await prisma.goal.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) return { error: 'Goal not found' };

  const status = currentAmount >= existing.targetAmount ? 'COMPLETED' : 'IN_PROGRESS';

  const goal = await prisma.goal.update({
    where: { id },
    data: {
      currentAmount,
      status,
    },
  });

  revalidatePath('/goals');
  revalidatePath('/dashboard');
  return { success: true, goal };
}

export async function deleteGoal(id: number) {
  const user = await getCurrentDatabaseUser();
  if (!user) return { error: 'Unauthorized' };

  await prisma.goal.deleteMany({
    where: { id, userId: user.id },
  });

  revalidatePath('/goals');
  revalidatePath('/dashboard');
  return { success: true };
}
