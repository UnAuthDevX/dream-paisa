'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#94a3b8'];

type DataPoint = { name: string; value: number };

/**
 * Caps chart data at Top 5 categories + aggregates the rest into "Others".
 * This ensures the pie chart is always readable.
 */
function topFiveWithOthers(data: DataPoint[]): DataPoint[] {
  if (data.length <= 5) return data;

  const sorted = [...data].sort((a, b) => b.value - a.value);
  const top5 = sorted.slice(0, 5);
  const others = sorted.slice(5).reduce((sum, d) => sum + d.value, 0);

  if (others > 0) {
    top5.push({ name: 'Others', value: others });
  }

  return top5;
}

export default function DashboardCharts({ data }: { data: DataPoint[] }) {
  const chartData = topFiveWithOthers(data);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={90}
            innerRadius={45}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => `₹${Number(value ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
            contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
          />
          <Legend
            formatter={(value) => <span style={{ fontSize: '11px', fontWeight: 500 }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
