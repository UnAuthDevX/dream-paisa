'use server';

import prisma from '@/lib/db';
import { getCurrentDatabaseUser } from '@/lib/account-lifecycle';
import { revalidatePath } from 'next/cache';
import { DEFAULT_WIDGET_REGISTRY, type WidgetPreference } from '@/app/dashboard/widget-registry';

export async function getDashboardPreferences(): Promise<WidgetPreference[]> {
  const user = await getCurrentDatabaseUser();
  if (!user) {
    return DEFAULT_WIDGET_REGISTRY.map((w, idx) => ({
      ...w,
      isEnabled: true,
      displayOrder: idx + 1,
    }));
  }

  const dbPrefs = await prisma.userDashboardPreference.findMany({
    where: { userId: user.id },
    orderBy: { displayOrder: 'asc' },
  });

  const prefsMap = new Map(dbPrefs.map((p) => [p.widgetKey, p]));

  const result: WidgetPreference[] = DEFAULT_WIDGET_REGISTRY.map((def, idx) => {
    const existing = prefsMap.get(def.widgetKey);
    return {
      widgetKey: def.widgetKey,
      label: def.label,
      category: def.category,
      isEnabled: existing ? existing.isEnabled : true,
      displayOrder: existing ? existing.displayOrder : idx + 1,
    };
  });

  result.sort((a, b) => a.displayOrder - b.displayOrder);
  return result;
}

export async function updateWidgetPreference(widgetKey: string, isEnabled: boolean) {
  const user = await getCurrentDatabaseUser();
  if (!user) return { error: 'Unauthorized' };

  const existing = await prisma.userDashboardPreference.findUnique({
    where: {
      user_widget_key: {
        userId: user.id,
        widgetKey,
      },
    },
  });

  if (existing) {
    await prisma.userDashboardPreference.update({
      where: { id: existing.id },
      data: { isEnabled },
    });
  } else {
    const registryIndex = DEFAULT_WIDGET_REGISTRY.findIndex((w) => w.widgetKey === widgetKey);
    await prisma.userDashboardPreference.create({
      data: {
        userId: user.id,
        widgetKey,
        isEnabled,
        displayOrder: registryIndex >= 0 ? registryIndex + 1 : 99,
      },
    });
  }

  revalidatePath('/dashboard');
  revalidatePath('/settings');
  return { success: true };
}

export async function reorderDashboardWidgets(orderedWidgetKeys: string[]) {
  const user = await getCurrentDatabaseUser();
  if (!user) return { error: 'Unauthorized' };

  for (let i = 0; i < orderedWidgetKeys.length; i++) {
    const key = orderedWidgetKeys[i];
    await prisma.userDashboardPreference.upsert({
      where: {
        user_widget_key: {
          userId: user.id,
          widgetKey: key,
        },
      },
      update: {
        displayOrder: i + 1,
      },
      create: {
        userId: user.id,
        widgetKey: key,
        isEnabled: true,
        displayOrder: i + 1,
      },
    });
  }

  revalidatePath('/dashboard');
  revalidatePath('/settings');
  return { success: true };
}

export async function restoreDefaultDashboardPreferences() {
  const user = await getCurrentDatabaseUser();
  if (!user) return { error: 'Unauthorized' };

  await prisma.userDashboardPreference.deleteMany({
    where: { userId: user.id },
  });

  revalidatePath('/dashboard');
  revalidatePath('/settings');
  return { success: true };
}
