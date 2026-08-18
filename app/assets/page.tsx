import { getAssets } from '@/app/actions/portfolio';
import { requireVerifiedUser } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AssetFormModal from './asset-form-modal';
import { NavSlide } from '@/components/sidenav';

export default async function AssetsPage() {
  await requireVerifiedUser();
  const assets = await getAssets();

  return (
    <div className="flex min-h-screen bg-background">
      <NavSlide />

      <main className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-x-hidden pb-24 lg:pb-6 pt-16 lg:pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Assets</h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">Everything you own, in one place.</p>
          </div>
          <AssetFormModal />
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {assets.length ? (
            assets.map((asset) => (
              <Card key={asset.id}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>{asset.name}</CardTitle>
                    <CardDescription>{asset.type}</CardDescription>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <AssetFormModal asset={asset} />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">₹{asset.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {asset.acquired
                      ? `Acquired ${new Date(asset.acquired).toLocaleDateString('en-IN')}`
                      : 'Acquisition date not set'}
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full rounded-lg border bg-muted/50 p-8 text-center text-muted-foreground">
              No assets yet. Add property, vehicles, or valuables to see your net worth.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
