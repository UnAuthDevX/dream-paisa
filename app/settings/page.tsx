import { requireVerifiedUser } from '@/lib/auth';
import { getCurrentDatabaseUser } from '@/lib/account-lifecycle';
import SettingsPanel from './settings-panel';

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ delete?: string; recover?: string; password?: string }> }) {
  const authUser = await requireVerifiedUser();
  const user = await getCurrentDatabaseUser();
  const params = await searchParams;
  if (!user) return null;
  return <main className="container mx-auto p-4"><SettingsPanel name={user.name ?? authUser.user_metadata?.full_name ?? ''} email={user.email} deleted={!!user.deletedAt} purgeAfter={user.purgeAfter?.toLocaleDateString('en-IN') ?? null} deletionConfirmation={params.delete === 'confirm'} recoveryConfirmation={params.recover === 'confirm'} passwordReset={params.password === 'reset'} /></main>;
}
