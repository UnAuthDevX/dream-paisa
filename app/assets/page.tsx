import { getAssets } from '@/app/actions/portfolio';
import { requireVerifiedUser } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AssetFormModal from './asset-form-modal';

export default async function AssetsPage() {
  await requireVerifiedUser();
  const assets = await getAssets();
  return <div className="container mx-auto space-y-6 p-4"><div className="flex items-center justify-between"><div><h1 className="text-3xl font-bold">Assets</h1><p className="text-muted-foreground">Everything you own, in one place.</p></div><AssetFormModal /></div>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{assets.length ? assets.map((asset) => <Card key={asset.id}><CardHeader><CardTitle>{asset.name}</CardTitle><CardDescription>{asset.type}</CardDescription></CardHeader><CardContent><p className="text-2xl font-bold">₹{asset.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p><p className="mt-1 text-sm text-muted-foreground">{asset.acquired ? `Acquired ${asset.acquired.toLocaleDateString('en-IN')}` : 'Acquisition date not set'}</p></CardContent></Card>) : <div className="col-span-full rounded-lg border bg-muted/50 p-8 text-center text-muted-foreground">No assets yet. Add property, vehicles, or valuables to see your net worth.</div>}</div>
  </div>;
}
