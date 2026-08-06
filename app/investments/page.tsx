import { getInvestments } from '@/app/actions/portfolio';
import { requireVerifiedUser } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import InvestmentFormModal from './investment-form-modal';

export default async function InvestmentsPage() {
  await requireVerifiedUser(); const investments = await getInvestments();
  return <div className="container mx-auto space-y-6 p-4"><div className="flex items-center justify-between"><div><h1 className="text-3xl font-bold">Investments</h1><p className="text-muted-foreground">Keep your long-term goals visible.</p></div><InvestmentFormModal /></div><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{investments.length ? investments.map((investment) => <Card key={investment.id}><CardHeader><CardTitle>{investment.name}</CardTitle><CardDescription>{investment.type}{investment.quantity !== null ? ` · ${investment.quantity} units` : ''}</CardDescription></CardHeader><CardContent><p className="text-2xl font-bold">₹{investment.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p><p className="mt-1 text-sm text-muted-foreground">{investment.dateAcquired ? `Purchased ${investment.dateAcquired.toLocaleDateString('en-IN')}` : 'Purchase date not set'}</p></CardContent></Card>) : <div className="col-span-full rounded-lg border bg-muted/50 p-8 text-center text-muted-foreground">No investments yet. Add an investment to track your portfolio.</div>}</div></div>;
}
