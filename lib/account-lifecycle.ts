import 'server-only';

import prisma from '@/lib/db';
import { getVerifiedUser } from '@/lib/auth';

export async function getCurrentDatabaseUser() {
  const user = await getVerifiedUser();
  if (!user?.email) return null;
  return prisma.user.upsert({
    where: { email: user.email },
    update: { name: user.user_metadata?.full_name },
    create: { email: user.email, name: user.user_metadata?.full_name },
  });
}

export async function getActiveDatabaseUser() {
  const user = await getCurrentDatabaseUser();
  return user && !user.deletedAt ? user : null;
}
