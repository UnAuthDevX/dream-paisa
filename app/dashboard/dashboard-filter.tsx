'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from 'lucide-react';

const MONTHS = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const YEARS = ['2024', '2025', '2026', '2027', '2028', '2029', '2030'];

export default function DashboardFilter({
  currentMonth,
  currentYear,
  currentMode,
}: {
  currentMonth: number;
  currentYear: number;
  currentMode: 'monthly' | 'yearly';
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    params.set(key, value);
    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3 bg-card p-3 rounded-xl border shadow-xs">
      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mr-1">
        <Calendar className="h-4 w-4 text-blue-600" />
        <span>Analysis Period:</span>
      </div>

      {/* Mode Selector */}
      <div className="inline-flex rounded-lg border bg-muted/50 p-1">
        <button
          type="button"
          onClick={() => updateFilter('mode', 'monthly')}
          className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
            currentMode === 'monthly'
              ? 'bg-background text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => updateFilter('mode', 'yearly')}
          className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
            currentMode === 'yearly'
              ? 'bg-background text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Yearly
        </button>
      </div>

      {/* Month Dropdown (Visible only in Monthly mode) */}
      {currentMode === 'monthly' && (
        <Select value={currentMonth.toString()} onValueChange={(val) => val && updateFilter('month', val)}>
          <SelectTrigger className="w-[130px] h-9 text-xs font-medium">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Year Dropdown */}
      <Select value={currentYear.toString()} onValueChange={(val) => val && updateFilter('year', val)}>
        <SelectTrigger className="w-[100px] h-9 text-xs font-medium">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {YEARS.map((y) => (
            <SelectItem key={y} value={y}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
