import { getAccounts } from '@/app/actions/accounts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Wallet } from 'lucide-react';
import AccountFormModal from './account-form-modal';
import { requireVerifiedUser } from '@/lib/auth';

export default async function AccountsPage() {
  await requireVerifiedUser();
  const accounts = await getAccounts();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Accounts</h1>
        <AccountFormModal />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.length === 0 ? (
          <div className="col-span-full p-8 text-center border rounded-lg bg-muted/50">
            <h3 className="text-lg font-medium">No accounts found</h3>
            <p className="text-muted-foreground mt-2">Create an account to start tracking your finances.</p>
          </div>
        ) : (
          accounts.map((account) => (
            <Card key={account.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">{account.name}</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{account.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                <CardDescription className="mt-1">Current Balance</CardDescription>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
