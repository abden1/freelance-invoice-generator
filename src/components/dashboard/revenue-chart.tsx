"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface RevenueDataPoint {
  month: string;
  invoiced: number;
  paid: number;
}

interface RevenueChartProps {
  data?: RevenueDataPoint[] | null;
}

const defaultData: RevenueDataPoint[] = [
  { month: "Oct", invoiced: 0, paid: 0 },
  { month: "Nov", invoiced: 0, paid: 0 },
  { month: "Dec", invoiced: 0, paid: 0 },
  { month: "Jan", invoiced: 0, paid: 0 },
  { month: "Feb", invoiced: 0, paid: 0 },
  { month: "Mar", invoiced: 0, paid: 0 },
];

interface TooltipPayload {
  color: string;
  name: string;
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border bg-background p-3 shadow-lg">
      <p className="font-semibold text-sm mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground capitalize">{entry.name}:</span>
          <span className="font-medium">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function RevenueChart({ data }: RevenueChartProps) {
  const chartData = data && data.length > 0 ? data : defaultData;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
        <CardDescription>Invoiced vs. paid over the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorInvoiced" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => (
                <span className="text-sm text-muted-foreground capitalize">{value}</span>
              )}
            />
            <Area
              type="monotone"
              dataKey="invoiced"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#colorInvoiced)"
              name="Invoiced"
            />
            <Area
              type="monotone"
              dataKey="paid"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#colorPaid)"
              name="Paid"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
