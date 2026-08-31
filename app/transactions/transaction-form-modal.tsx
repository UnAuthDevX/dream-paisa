'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  LoaderCircle,
  Pencil,
  PlusCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  Laptop,
  TrendingUp,
  Plus,
  Link as LinkIcon,
} from 'lucide-react';
import { createTransaction, updateTransaction } from '@/app/actions/transactions';
import { toLocalDateInputValue } from '@/lib/date';
import { SuccessDialog } from '@/components/success-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Account = { id: number; name: string };
type Category = {
  id: string;
  name: string;
  type: string;
  icon?: string;
  emoji?: string | null;
  color?: string;
  description?: string | null;
};
type ExistingAsset = {
  id: number;
  name: string;
  type: string;
};
type ExistingInvestment = {
  id: number;
  name: string;
  type: string;
};
type ExistingTransaction = {
  id: number;
  accountId: number | null;
  categoryId: string | null;
  amount: number;
  date: Date;
  notes: string | null;
  transactionType?: string | null;
  subType?: string | null;
  assetId?: number | null;
  investmentId?: number | null;
};

interface TransactionFormModalProps {
  accounts: Account[];
  categories: Category[];
  assets?: ExistingAsset[];
  investments?: ExistingInvestment[];
  transaction?: ExistingTransaction;
  defaultOpen?: boolean;
}

const ASSET_CATEGORIES = [
  'Electronics',
  'Vehicle',
  'Real Estate',
  'Gold & Jewelry',
  'Gadgets & Appliances',
  'Furniture',
  'Collectibles',
  'Other',
];

const INVESTMENT_TYPES = [
  'Mutual Funds',
  'Stocks',
  'Sovereign Gold Bond',
  'Fixed Deposit',
  'Crypto',
  'Bonds',
  'Real Estate / REITs',
  'Other',
];

export default function TransactionFormModal({
  accounts,
  categories,
  assets = [],
  investments = [],
  transaction,
  defaultOpen = false,
}: TransactionFormModalProps) {
  const isEditing = !!transaction;
  const [open, setOpen] = useState(defaultOpen);
  const [pending, setPending] = useState(false);
  const submissionLock = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ amount: number; notes: string } | null>(null);

  const initialTxType = transaction
    ? transaction.transactionType === 'ASSET'
      ? 'Asset'
      : transaction.transactionType === 'INVESTMENT'
      ? 'Investment'
      : transaction.amount > 0
      ? 'Income'
      : 'Expense'
    : 'Expense';

  const [txType, setTxType] = useState<'Expense' | 'Income' | 'Asset' | 'Investment'>(initialTxType);
  const [assetMode, setAssetMode] = useState<'new' | 'existing'>('new');
  const [selectedAssetId, setSelectedAssetId] = useState<string>(
    transaction?.assetId ? transaction.assetId.toString() : (assets[0]?.id.toString() || '')
  );
  const [assetSubType, setAssetSubType] = useState<'PURCHASE' | 'REPAIR' | 'MAINTENANCE' | 'ACCESSORIES'>('PURCHASE');
  const [newAssetCategory, setNewAssetCategory] = useState<string>('Electronics');

  const [investmentMode, setInvestmentMode] = useState<'new' | 'existing'>('new');
  const [selectedInvestmentId, setSelectedInvestmentId] = useState<string>(
    transaction?.investmentId ? transaction.investmentId.toString() : (investments[0]?.id.toString() || '')
  );
  const [newInvestmentType, setNewInvestmentType] = useState<string>('Mutual Funds');

  const defaultDate = transaction
    ? toLocalDateInputValue(new Date(transaction.date))
    : toLocalDateInputValue();

  const defaultAmount = transaction ? Math.abs(transaction.amount) : '';

  // Filter categories by selected transaction type (Income vs Expense)
  const filteredCategories = categories.filter((cat) =>
    txType === 'Income' ? cat.type.toLowerCase() === 'income' : cat.type.toLowerCase() === 'expense'
  );

  async function handleSubmit(formData: FormData) {
    if (submissionLock.current) return;
    submissionLock.current = true;
    setPending(true);
    setError(null);

    const rawAmountStr = formData.get('amount') as string;
    const rawAmount = Math.abs(parseFloat(rawAmountStr));
    if (isNaN(rawAmount) || rawAmount === 0) {
      setError('Please enter a valid amount.');
      setPending(false);
      submissionLock.current = false;
      return;
    }

    formData.set('txType', txType);

    if (txType === 'Asset') {
      formData.set('assetMode', assetMode);
      if (assetMode === 'new') {
        const name = (formData.get('newAssetName') as string)?.trim();
        if (!name) {
          setError('Please provide a name for the new asset.');
          setPending(false);
          submissionLock.current = false;
          return;
        }
        formData.set('newAssetCategory', newAssetCategory);
        formData.set('assetSubType', 'PURCHASE');
      } else {
        if (!selectedAssetId) {
          setError('Please select an asset to link to.');
          setPending(false);
          submissionLock.current = false;
          return;
        }
        formData.set('assetId', selectedAssetId);
        formData.set('assetSubType', assetSubType);
      }
    } else if (txType === 'Investment') {
      formData.set('investmentMode', investmentMode);
      if (investmentMode === 'new') {
        const name = (formData.get('newInvestmentName') as string)?.trim();
        if (!name) {
          setError('Please provide a name for the investment.');
          setPending(false);
          submissionLock.current = false;
          return;
        }
        formData.set('newInvestmentType', newInvestmentType);
      } else {
        if (!selectedInvestmentId) {
          setError('Please select an investment to link to.');
          setPending(false);
          submissionLock.current = false;
          return;
        }
        formData.set('investmentId', selectedInvestmentId);
      }
    }

    const finalAmount = txType === 'Income' ? rawAmount : -rawAmount;
    formData.set('amount', finalAmount.toString());

    try {
      const result = isEditing
        ? await updateTransaction(transaction!.id, formData)
        : await createTransaction(formData);

      if (result?.error) setError(result.error);
      else if (result?.success && result.transaction) {
        setOpen(false);
        setSuccess(result.transaction);
      } else setError('Unable to save transaction. Please try again.');
    } catch {
      setError('Unable to save transaction. Please try again.');
    } finally {
      setPending(false);
      submissionLock.current = false;
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            isEditing ? (
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Pencil className="h-3.5 w-3.5" />
                <span className="sr-only">Edit transaction</span>
              </Button>
            ) : (
              <Button disabled={accounts.length === 0} className="shadow-sm">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Transaction
              </Button>
            )
          }
        />
        <DialogContent className="sm:max-w-[460px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update transaction details. Account balance will automatically adjust.'
                : 'Log income, expenses, asset purchases, or investments.'}
            </DialogDescription>
          </DialogHeader>

          {/* 4-way Transaction Type Grid */}
          {!isEditing && (
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-muted rounded-xl">
              <button
                type="button"
                onClick={() => setTxType('Expense')}
                className={`flex flex-col items-center justify-center gap-1 py-2 px-1 text-xs font-semibold rounded-lg transition-all ${
                  txType === 'Expense'
                    ? 'bg-destructive text-destructive-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <ArrowDownCircle className="h-4 w-4" /> Expense
              </button>
              <button
                type="button"
                onClick={() => setTxType('Income')}
                className={`flex flex-col items-center justify-center gap-1 py-2 px-1 text-xs font-semibold rounded-lg transition-all ${
                  txType === 'Income'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <ArrowUpCircle className="h-4 w-4" /> Income
              </button>
              <button
                type="button"
                onClick={() => setTxType('Asset')}
                className={`flex flex-col items-center justify-center gap-1 py-2 px-1 text-xs font-semibold rounded-lg transition-all ${
                  txType === 'Asset'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Laptop className="h-4 w-4" /> Asset
              </button>
              <button
                type="button"
                onClick={() => setTxType('Investment')}
                className={`flex flex-col items-center justify-center gap-1 py-2 px-1 text-xs font-semibold rounded-lg transition-all ${
                  txType === 'Investment'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <TrendingUp className="h-4 w-4" /> Investment
              </button>
            </div>
          )}

          <form action={handleSubmit}>
            <div className="grid gap-3.5 py-2">
              {/* Account Selection */}
              <div className="space-y-1.5">
                <Label htmlFor="accountId">
                  {txType === 'Income' ? 'Deposit Into Account' : 'Pay From Account'}
                </Label>
                <Select
                  name="accountId"
                  required
                  defaultValue={transaction?.accountId?.toString() || accounts[0]?.id.toString()}
                  items={accounts.map((account) => ({ label: account.name, value: account.id.toString() }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {(value) => accounts.find((account) => account.id.toString() === value)?.name ?? 'Select account'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id.toString()}>
                        {acc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* ASSET SPECIFIC BRANCH */}
              {txType === 'Asset' && !isEditing && (
                <div className="p-3 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/50 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                      Asset Options
                    </span>
                    <div className="flex gap-1 bg-background/80 p-0.5 rounded-lg border">
                      <button
                        type="button"
                        onClick={() => setAssetMode('new')}
                        className={`text-[11px] font-semibold px-2 py-1 rounded-md transition-all flex items-center gap-1 ${
                          assetMode === 'new' ? 'bg-blue-600 text-white' : 'text-muted-foreground'
                        }`}
                      >
                        <Plus className="h-3 w-3" /> New Asset
                      </button>
                      <button
                        type="button"
                        onClick={() => setAssetMode('existing')}
                        disabled={assets.length === 0}
                        className={`text-[11px] font-semibold px-2 py-1 rounded-md transition-all flex items-center gap-1 ${
                          assetMode === 'existing' ? 'bg-blue-600 text-white' : 'text-muted-foreground'
                        } ${assets.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <LinkIcon className="h-3 w-3" /> Existing ({assets.length})
                      </button>
                    </div>
                  </div>

                  {assetMode === 'new' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <Label htmlFor="newAssetName" className="text-xs">Asset Name</Label>
                        <Input
                          id="newAssetName"
                          name="newAssetName"
                          placeholder="e.g. MacBook Pro, Honda Activa"
                          className="h-8 text-xs"
                          required={assetMode === 'new'}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Category</Label>
                        <select
                          value={newAssetCategory}
                          onChange={(e) => setNewAssetCategory(e.target.value)}
                          className="h-8 w-full rounded-md border bg-background px-2 text-xs"
                        >
                          {ASSET_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <Label className="text-xs">Select Asset</Label>
                        <select
                          value={selectedAssetId}
                          onChange={(e) => setSelectedAssetId(e.target.value)}
                          className="h-8 w-full rounded-md border bg-background px-2 text-xs"
                        >
                          {assets.map((a) => (
                            <option key={a.id} value={a.id.toString()}>
                              {a.name} ({a.type})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Event Type</Label>
                        <select
                          value={assetSubType}
                          onChange={(e) => setAssetSubType(e.target.value as 'PURCHASE' | 'REPAIR' | 'MAINTENANCE' | 'ACCESSORIES')}
                          className="h-8 w-full rounded-md border bg-background px-2 text-xs"
                        >
                          <option value="PURCHASE">🛒 Additional Purchase</option>
                          <option value="REPAIR">🔧 Repair / Service</option>
                          <option value="MAINTENANCE">🛡️ Maintenance / Insurance</option>
                          <option value="ACCESSORIES">🎒 Accessories / Upgrades</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* INVESTMENT SPECIFIC BRANCH */}
              {txType === 'Investment' && !isEditing && (
                <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/50 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                      Investment Options
                    </span>
                    <div className="flex gap-1 bg-background/80 p-0.5 rounded-lg border">
                      <button
                        type="button"
                        onClick={() => setInvestmentMode('new')}
                        className={`text-[11px] font-semibold px-2 py-1 rounded-md transition-all flex items-center gap-1 ${
                          investmentMode === 'new' ? 'bg-indigo-600 text-white' : 'text-muted-foreground'
                        }`}
                      >
                        <Plus className="h-3 w-3" /> New Investment
                      </button>
                      <button
                        type="button"
                        onClick={() => setInvestmentMode('existing')}
                        disabled={investments.length === 0}
                        className={`text-[11px] font-semibold px-2 py-1 rounded-md transition-all flex items-center gap-1 ${
                          investmentMode === 'existing' ? 'bg-indigo-600 text-white' : 'text-muted-foreground'
                        } ${investments.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <LinkIcon className="h-3 w-3" /> Existing ({investments.length})
                      </button>
                    </div>
                  </div>

                  {investmentMode === 'new' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <Label htmlFor="newInvestmentName" className="text-xs">Investment Name</Label>
                        <Input
                          id="newInvestmentName"
                          name="newInvestmentName"
                          placeholder="e.g. Nifty 50 Index, Sovereign Gold"
                          className="h-8 text-xs"
                          required={investmentMode === 'new'}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Asset Class</Label>
                        <select
                          value={newInvestmentType}
                          onChange={(e) => setNewInvestmentType(e.target.value)}
                          className="h-8 w-full rounded-md border bg-background px-2 text-xs"
                        >
                          {INVESTMENT_TYPES.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Label className="text-xs">Select Investment</Label>
                      <select
                        value={selectedInvestmentId}
                        onChange={(e) => setSelectedInvestmentId(e.target.value)}
                        className="h-8 w-full rounded-md border bg-background px-2 text-xs"
                      >
                        {investments.map((inv) => (
                          <option key={inv.id} value={inv.id.toString()}>
                            {inv.name} ({inv.type})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Standard Category Selection (for Expense/Income) */}
              {(txType === 'Expense' || txType === 'Income') && (
                <div className="space-y-1.5">
                  <Label htmlFor="categoryId">Category</Label>
                  <Select
                    name="categoryId"
                    defaultValue={transaction?.categoryId ?? undefined}
                    items={filteredCategories.map((category) => ({ label: category.name, value: category.id }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {(value) => filteredCategories.find((category) => category.id === value)?.name ?? 'Select category'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <div className="flex items-center gap-2">
                            <span className="text-base">{cat.emoji || '🏷️'}</span>
                            <span>{cat.name}</span>
                            {cat.color && (
                              <span
                                className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-semibold"
                                style={{
                                  backgroundColor: `${cat.color}20`,
                                  color: cat.color,
                                }}
                              >
                                {cat.type}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Amount */}
              <div className="space-y-1.5">
                <Label htmlFor="amount">Amount (₹)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground font-semibold">₹</span>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    defaultValue={defaultAmount}
                    className="pl-7 font-medium"
                    required
                  />
                </div>
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" defaultValue={defaultDate} required />
              </div>

              {/* Notes / Description */}
              <div className="space-y-1.5">
                <Label htmlFor="notes">Notes / Memo</Label>
                <Input
                  id="notes"
                  name="notes"
                  placeholder={
                    txType === 'Asset'
                      ? 'e.g. Bought MacBook Pro from Apple Store'
                      : txType === 'Investment'
                      ? 'e.g. Monthly SIP for index fund'
                      : 'e.g. Grocery shopping, Electricity bill'
                  }
                  defaultValue={transaction?.notes ?? ''}
                />
              </div>

              {error && <p className="text-xs text-destructive font-medium">{error}</p>}
            </div>

            <DialogFooter className="mt-2">
              <Button
                type="submit"
                disabled={pending}
                className={
                  txType === 'Income'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto'
                    : txType === 'Asset'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto'
                    : txType === 'Investment'
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto'
                    : 'w-full sm:w-auto'
                }
              >
                {pending ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : isEditing ? (
                  'Update Transaction'
                ) : (
                  `Save ${txType}`
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <SuccessDialog
        open={success !== null}
        onDone={() => setSuccess(null)}
        title={isEditing ? '✅ Transaction Updated!' : '✅ Transaction Logged Successfully!'}
      >
        <p className="font-semibold text-lg">
          ₹{Math.abs(success?.amount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })} · {success?.amount && success.amount > 0 ? 'Income' : 'Expense / Allocation'}
        </p>
        {success?.notes && <p className="text-muted-foreground text-sm">{success.notes}</p>}
      </SuccessDialog>
    </>
  );
}
