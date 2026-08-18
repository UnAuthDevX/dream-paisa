import { requireVerifiedUser } from '@/lib/auth';
import { getCurrentDatabaseUser } from '@/lib/account-lifecycle';
import SettingsPanel from './settings-panel';
import { NavSlide } from '@/components/sidenav';

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ password?: string }>;
}) {
  const authUser = await requireVerifiedUser();
  const user = await getCurrentDatabaseUser();
  const params = await searchParams;
  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <NavSlide />
      <main className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-x-hidden pb-24 lg:pb-6 pt-16 lg:pt-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
        <SettingsPanel
          name={user.name ?? authUser.user_metadata?.full_name ?? ''}
          email={user.email}
          passwordReset={params.password === 'reset'}
        />
      </main>
    </div>
  );
}
