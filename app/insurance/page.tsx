import { getInsurances } from '@/app/actions/insurance';
import { getAccounts } from '@/app/actions/accounts';
import { requireVerifiedUser } from '@/lib/auth';

export const metadata = { title: 'Insurance', description: 'Manage insurance policies, premiums, coverage, and renewals.' };
import { NavSlide } from '@/components/sidenav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import InsuranceFormModal from './insurance-form-modal';
import PayPremiumModal from './pay-premium-modal';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  ArrowRight, Bell, CheckCircle2, ShieldCheck, Umbrella, AlertTriangle,
} from 'lucide-react';

export default async function InsurancePage() {
  await requireVerifiedUser();
  const [insData, accounts] = await Promise.all([
    getInsurances(),
    getAccounts(),
  ]);

  const { insurances, totalCoverage, totalAnnualPremium, activePoliciesCount, upcomingRenewalsCount } = insData;

  return (
    <div className="flex min-h-screen bg-background">
      <NavSlide />

      <main className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-x-hidden pb-24 lg:pb-6 pt-16 lg:pt-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Insurance</h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
              Track policies, renewal dates, coverage amounts, and premium payments.
            </p>
          </div>
          <InsuranceFormModal />
        </div>

        {/* Summary Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-2xl shadow-xs border-blue-100 dark:border-blue-950/60 bg-blue-50/30 dark:bg-blue-950/20">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                <span>Total Coverage</span>
                <ShieldCheck className="h-4 w-4 text-blue-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
                ₹{totalCoverage.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Active policy coverage</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-xs">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                <span>Annual Premium</span>
                <Umbrella className="h-4 w-4 text-purple-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                ₹{totalAnnualPremium.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Yearly premium outflow</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-xs">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                <span>Active Policies</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {activePoliciesCount}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Currently active</p>
            </CardContent>
          </Card>

          <Card className={`rounded-2xl shadow-xs ${upcomingRenewalsCount > 0 ? 'border-amber-200 dark:border-amber-900 bg-amber-50/30 dark:bg-amber-950/20' : ''}`}>
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                <span>Due Renewals</span>
                <Bell className={`h-4 w-4 ${upcomingRenewalsCount > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-xl font-bold ${upcomingRenewalsCount > 0 ? 'text-amber-600 dark:text-amber-400' : ''}`}>
                {upcomingRenewalsCount}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Due within 30 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Policy Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {insurances.length ? (
            insurances.map((ins) => (
              <Card key={ins.id} className={`rounded-2xl shadow-xs flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-800 transition-all ${ins.daysUntilRenewal <= 30 && ins.daysUntilRenewal >= 0 && ins.status === 'ACTIVE' ? 'border-amber-200 dark:border-amber-900' : ''}`}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-base font-bold">{ins.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200">
                        {ins.type}
                      </span>
                      <span className="text-[11px] text-muted-foreground">via {ins.provider}</span>
                    </div>
                  </div>
                  <InsuranceFormModal policy={ins} />
                </CardHeader>

                <CardContent className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-muted/40 rounded-xl">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Coverage</p>
                      <p className="text-base font-bold text-blue-600 dark:text-blue-400">
                        ₹{ins.coverageAmount.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Premium</p>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                        ₹{ins.premiumAmount.toLocaleString('en-IN')}
                        <span className="text-[10px] text-muted-foreground ml-1">/{ins.premiumFrequency.toLowerCase()}</span>
                      </p>
                    </div>
                  </div>

                  <div className={`flex items-center gap-2 text-xs rounded-xl p-2 ${ins.daysUntilRenewal <= 30 && ins.daysUntilRenewal >= 0 ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300' : 'bg-muted/30 text-muted-foreground'}`}>
                    {ins.daysUntilRenewal <= 30 && ins.daysUntilRenewal >= 0 ? (
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <Bell className="h-3.5 w-3.5 shrink-0" />
                    )}
                    <span>
                      Renewal: {new Date(ins.renewalDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      {ins.daysUntilRenewal >= 0 ? ` · ${ins.daysUntilRenewal}d left` : ' · Expired'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    {ins.status === 'ACTIVE' && accounts.length > 0 && (
                      <PayPremiumModal
                        insuranceId={ins.id}
                        policyName={ins.name}
                        defaultPremium={ins.premiumAmount}
                        accounts={accounts}
                      />
                    )}
                    <Link href={`/insurance/${ins.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-xs flex items-center justify-center gap-1 rounded-xl">
                        Details <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full rounded-2xl border bg-muted/30 p-12 text-center text-muted-foreground space-y-3">
              <ShieldCheck className="h-10 w-10 mx-auto text-muted-foreground/60" />
              <div>
                <p className="font-semibold text-base text-foreground">No insurance policies added</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                  Track life, health, vehicle and home insurance policies with renewal reminders.
                </p>
              </div>
              <div className="pt-2">
                <InsuranceFormModal />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
