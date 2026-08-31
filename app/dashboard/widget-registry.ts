export type WidgetPreference = {
  widgetKey: string;
  label: string;
  category: string;
  isEnabled: boolean;
  displayOrder: number;
};

export const DEFAULT_WIDGET_REGISTRY: { widgetKey: string; label: string; category: string }[] = [
  { widgetKey: 'total_balance', label: 'Total Balance Summary', category: 'Overview' },
  { widgetKey: 'net_worth', label: 'Net Worth Breakdown', category: 'Overview' },
  { widgetKey: 'assets', label: 'Asset Value Summary', category: 'Wealth' },
  { widgetKey: 'income_expense', label: 'Monthly Income vs Expenses', category: 'Overview' },
  { widgetKey: 'savings_rate', label: 'Savings Rate & Amount', category: 'Analytics' },
  { widgetKey: 'transaction_growth', label: 'Month-over-Month Transaction Growth', category: 'Analytics' },
  { widgetKey: 'expense_categories', label: 'Top 5 Expense Categories', category: 'Charts' },
  { widgetKey: 'income_categories', label: 'Top 5 Income Categories', category: 'Charts' },
  { widgetKey: 'goals', label: 'Financial Goals Progress', category: 'Planning' },
  { widgetKey: 'recurring_transactions', label: 'Upcoming Recurring Commitments', category: 'Planning' },
  { widgetKey: 'loans', label: 'Outstanding Loans & Liabilities', category: 'Liabilities' },
  { widgetKey: 'insurance', label: 'Insurance Policy Renewals', category: 'Protection' },
  { widgetKey: 'investments', label: 'Investment Portfolio Returns', category: 'Wealth' },
];
