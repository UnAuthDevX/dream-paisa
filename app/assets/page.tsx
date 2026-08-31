import { getAssets } from '@/app/actions/portfolio';
import { requireVerifiedUser } from '@/lib/auth';

export const metadata = { title: 'Assets', description: 'Track the current value and depreciation of your personal assets.' };
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AssetFormModal from './asset-form-modal';
import { NavSlide } from '@/components/sidenav';
import Link from 'next/link';
import { Laptop, ArrowDownRight, ArrowRight, ShieldCheck, History } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function AssetsPage() {
  await requireVerifiedUser();
  const { assets, totalPurchaseValue, totalCurrentValue, totalDepreciation } = await getAssets();

  return (
    <div className="flex min-h-screen bg-background">
      <NavSlide />

      <main className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-x-hidden pb-24 lg:pb-6 pt-16 lg:pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Assets &amp; Possessions</h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
              Track physical wealth, monitor depreciation, and view linked service history.
            </p>
          </div>
          <AssetFormModal />
        </div>

        {/* Overview Metric Summary */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
          <Card className="rounded-2xl shadow-xs border-blue-100 dark:border-blue-950/60 bg-blue-50/30 dark:bg-blue-950/20">
            <CardHeader className="pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center justify-between">
                <span>Total Asset Value</span>
                <Laptop className="h-4 w-4 text-blue-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-blue-700 dark:text-blue-300">
                ₹{totalCurrentValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Current estimated market value</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-xs">
            <CardHeader className="pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center justify-between">
                <span>Total Purchase Value</span>
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                ₹{totalPurchaseValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Initial capital acquisition cost</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-xs">
            <CardHeader className="pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center justify-between">
                <span>Depreciation</span>
                <ArrowDownRight className="h-4 w-4 text-rose-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400">
                ₹{totalDepreciation.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {totalPurchaseValue > 0
                  ? `${((totalDepreciation / totalPurchaseValue) * 100).toFixed(1)}% total value reduction`
                  : '0% depreciation'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Asset Cards Grid */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {assets.length ? (
            assets.map((asset) => (
              <Card key={asset.id} className="rounded-2xl shadow-xs hover:border-blue-300 dark:hover:border-blue-800 transition-all flex flex-col justify-between">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-base sm:text-lg font-bold">{asset.name}</CardTitle>
                    <span className="inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                      {asset.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <AssetFormModal asset={asset} />
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-muted/40 rounded-xl">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Current Value</p>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        ₹{asset.currentValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Purchase Price</p>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                        ₹{asset.purchaseValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
                    <div>
                      {asset.depreciation > 0 ? (
                        <span className="text-rose-600 dark:text-rose-400 font-medium">
                          -₹{asset.depreciation.toLocaleString('en-IN')} ({asset.depreciationPercentage.toFixed(0)}%)
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">Retained 100% value</span>
                      )}
                    </div>
                    {asset.transactionCount ? (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                        <History className="h-3 w-3" /> {asset.transactionCount} events
                      </span>
                    ) : null}
                  </div>

                  <Link href={`/assets/${asset.id}`} className="block w-full">
                    <Button variant="outline" size="sm" className="w-full text-xs flex items-center justify-center gap-1.5 rounded-xl">
                      View Asset History <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full rounded-2xl border bg-muted/30 p-12 text-center text-muted-foreground space-y-3">
              <Laptop className="h-10 w-10 mx-auto text-muted-foreground/60" />
              <div>
                <p className="font-semibold text-base text-foreground">No assets added yet</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                  Add valuable possessions like laptops, vehicles, gold, or property to track real-time depreciation and linked maintenance expenses.
                </p>
              </div>
              <div className="pt-2">
                <AssetFormModal />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
