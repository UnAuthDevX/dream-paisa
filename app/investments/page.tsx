import { getInvestments } from '@/app/actions/portfolio';
import { requireVerifiedUser } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import InvestmentFormModal from './investment-form-modal';
import { NavSlide } from '@/components/sidenav';

export default async function InvestmentsPage() {
  await requireVerifiedUser();
  const investments = await getInvestments();

  return (
    <div className="flex min-h-screen bg-background">
      <NavSlide />

      <main className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-x-hidden pb-24 lg:pb-6 pt-16 lg:pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Investments</h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">Keep your long-term goals visible.</p>
          </div>
          <InvestmentFormModal />
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {investments.length ? (
            investments.map((investment) => (
              <Card key={investment.id}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>{investment.name}</CardTitle>
                    <CardDescription>
                      {investment.type}{investment.quantity !== null ? ` · ${investment.quantity} units` : ''}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <InvestmentFormModal investment={investment} />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">₹{investment.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {investment.dateAcquired
                      ? `Purchased ${new Date(investment.dateAcquired).toLocaleDateString('en-IN')}`
                      : 'Purchase date not set'}
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full rounded-lg border bg-muted/50 p-8 text-center text-muted-foreground">
              No investments yet. Add an investment to track your portfolio.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
