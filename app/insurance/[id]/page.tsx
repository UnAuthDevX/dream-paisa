import { getInsuranceById } from '@/app/actions/insurance';
import { getAccounts } from '@/app/actions/accounts';
import { requireVerifiedUser } from '@/lib/auth';
import { NavSlide } from '@/components/sidenav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft, Bell, CheckCircle2, History, ShieldCheck, Umbrella, AlertTriangle,
} from 'lucide-react';
import InsuranceFormModal from '../insurance-form-modal';
import PayPremiumModal from '../pay-premium-modal';

type Props = { params: Promise<{ id: string }> };

export default async function InsuranceDetailPage({ params }: Props) {
  await requireVerifiedUser();
  const { id } = await params;
  const policyId = Number(id);

  const [policy, accounts] = await Promise.all([
    getInsuranceById(policyId),
    getAccounts(),
  ]);

  if (!policy) notFound();

  const formatINR = (n: number) =>
    `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const isRenewalSoon = policy.daysUntilRenewal >= 0 && policy.daysUntilRenewal <= 30;

  return (
    <div className="flex min-h-screen bg-background">
      <NavSlide />

      <main className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-x-hidden pb-24 lg:pb-6 pt-16 lg:pt-6">
        {/* Back + Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <Link
              href="/insurance"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Insurance
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold">{policy.name}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200">
                {policy.type}
              </span>
              <span className="text-xs text-muted-foreground">via {policy.provider}</span>
              {policy.policyNumber && (
                <span className="text-xs text-muted-foreground">#{policy.policyNumber}</span>
              )}
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${policy.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-muted text-muted-foreground border border-border'}`}>
                {policy.status}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {policy.status === 'ACTIVE' && accounts.length > 0 && (
              <PayPremiumModal
                insuranceId={policy.id}
                policyName={policy.name}
                defaultPremium={policy.premiumAmount}
                accounts={accounts}
              />
            )}
            <InsuranceFormModal policy={policy} />
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-2xl shadow-xs border-blue-100 dark:border-blue-950/60 bg-blue-50/30 dark:bg-blue-950/20">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-600" /> Coverage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
                ₹{policy.coverageAmount.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Sum assured</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-xs">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Umbrella className="h-3.5 w-3.5 text-purple-600" /> Premium
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                ₹{policy.premiumAmount.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {policy.premiumFrequency.toLowerCase()} · ₹{Math.round(policy.annualizedPremium).toLocaleString('en-IN')}/yr
              </p>
            </CardContent>
          </Card>

          <Card className={`rounded-2xl shadow-xs ${isRenewalSoon ? 'border-amber-200 dark:border-amber-900' : ''}`}>
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                {isRenewalSoon
                  ? <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                  : <Bell className="h-3.5 w-3.5" />}
                Renewal Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-base font-bold ${isRenewalSoon ? 'text-amber-600 dark:text-amber-400' : ''}`}>
                {new Date(policy.renewalDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {policy.daysUntilRenewal >= 0 ? `${policy.daysUntilRenewal} days left` : 'Expired'}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-xs">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <History className="h-3.5 w-3.5" /> Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{policy.transactions.length}</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Premium payments recorded</p>
            </CardContent>
          </Card>
        </div>

        {/* Policy Details */}
        {(policy.nominee || policy.notes) && (
          <Card className="rounded-2xl shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">Policy Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {policy.nominee && (
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-24 shrink-0">Nominee</span>
                  <span className="font-medium">{policy.nominee}</span>
                </div>
              )}
              {policy.startDate && (
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-24 shrink-0">Start Date</span>
                  <span className="font-medium">
                    {new Date(policy.startDate).toLocaleDateString('en-IN')}
                  </span>
                </div>
              )}
              {policy.notes && (
                <div className="flex gap-2 pt-1 border-t border-border/40">
                  <span className="text-muted-foreground w-24 shrink-0">Notes</span>
                  <span className="text-muted-foreground">{policy.notes}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Payment History */}
        <Card className="rounded-2xl shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              Premium Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {policy.transactions.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground space-y-2">
                <ShieldCheck className="h-8 w-8 mx-auto text-muted-foreground/50" />
                <p className="text-sm">No premium payments recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {policy.transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors gap-1"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {tx.notes || `Premium payment — ${policy.name}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.date).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                        {' · '}{tx.account?.name ?? 'Deleted account'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
                          -{formatINR(Math.abs(tx.amount))}
                        </p>
                      </div>
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
