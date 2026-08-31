import { getAssetById } from '@/app/actions/portfolio';
import { requireVerifiedUser } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { NavSlide } from '@/components/sidenav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Laptop, ShieldCheck, ArrowDownRight, Wrench, Calendar, PlusCircle } from 'lucide-react';
import AssetFormModal from '../asset-form-modal';
import RevalueModal from '../revalue-modal';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AssetDetailPage({ params }: Props) {
  await requireVerifiedUser();
  const { id } = await params;
  const assetId = parseInt(id, 10);

  if (isNaN(assetId)) {
    notFound();
  }

  const asset = await getAssetById(assetId);
  if (!asset) {
    notFound();
  }

  return (
    <div className="flex min-h-screen bg-background">
      <NavSlide />

      <main className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-x-hidden pb-24 lg:pb-6 pt-16 lg:pt-6">
        {/* Navigation & Header */}
        <div className="flex items-center gap-2 mb-2">
          <Link href="/assets">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Back to Assets
            </Button>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold">{asset.name}</h1>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {asset.type}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {asset.acquired
                ? `Acquired on ${format(new Date(asset.acquired), 'MMMM d, yyyy')}`
                : 'Acquisition date not recorded'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <RevalueModal
              assetId={asset.id}
              assetName={asset.name}
              currentValue={asset.currentValue}
              purchaseValue={asset.purchaseValue}
            />
            <AssetFormModal asset={asset} />
          </div>
        </div>

        {/* Valuation Metrics Grid */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 xl:grid-cols-4">
          <Card className="rounded-2xl shadow-xs border-blue-100 dark:border-blue-950/60 bg-blue-50/30 dark:bg-blue-950/20">
            <CardHeader className="pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center justify-between">
                <span>Current Value</span>
                <Laptop className="h-4 w-4 text-blue-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-blue-700 dark:text-blue-300">
                ₹{asset.currentValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Estimated market worth</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-xs">
            <CardHeader className="pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center justify-between">
                <span>Purchase Value</span>
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                ₹{asset.purchaseValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Initial acquisition cost</p>
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
                {asset.depreciation > 0 ? `-₹${asset.depreciation.toLocaleString('en-IN')}` : '₹0.00'}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {asset.depreciationPercentage > 0
                  ? `Lost ${asset.depreciationPercentage.toFixed(1)}% of value`
                  : 'Zero depreciation'}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-xs">
            <CardHeader className="pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center justify-between">
                <span>Maintenance Spent</span>
                <Wrench className="h-4 w-4 text-amber-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                ₹{asset.totalMaintenanceSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Repairs &amp; accessories</p>
            </CardContent>
          </Card>
        </div>

        {/* Linked Transaction History */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold">Asset Transactions &amp; Service History</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                All financial events linked directly to {asset.name}.
              </p>
            </div>
            <Link href="/transactions">
              <Button size="sm" variant="outline" className="text-xs">
                <PlusCircle className="mr-1.5 h-3.5 w-3.5" /> Log Event
              </Button>
            </Link>
          </div>

          <div className="rounded-2xl border bg-card shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="min-w-[600px]">
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="font-bold">Date</TableHead>
                    <TableHead className="font-bold">Event Type</TableHead>
                    <TableHead className="font-bold">Notes / Description</TableHead>
                    <TableHead className="font-bold">Account</TableHead>
                    <TableHead className="text-right font-bold">Amount</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {asset.transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                        No transactions linked to this asset yet. You can log purchases, repairs, or upgrades from the Transactions page.
                      </TableCell>
                    </TableRow>
                  ) : (
                    asset.transactions.map((tx) => (
                      <TableRow key={tx.id} className="hover:bg-muted/40 transition-colors">
                        <TableCell className="font-medium text-xs sm:text-sm whitespace-nowrap">
                          {format(new Date(tx.date), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                            {tx.subType || (tx.amount > 0 ? 'Income' : 'Expense')}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {tx.notes || 'Asset Event'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {tx.account?.name || 'Unassigned'}
                        </TableCell>
                        <TableCell className="text-right font-bold text-sm whitespace-nowrap text-slate-900 dark:text-slate-100">
                          -₹{Math.abs(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}