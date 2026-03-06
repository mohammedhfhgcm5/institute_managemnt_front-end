import { useFinancialSummary } from '@/hooks/api/useDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCurrency } from '@/utils/formatters';

export function FinancialChart() {
  const { data, isLoading } = useFinancialSummary();

  if (isLoading) return <LoadingSpinner />;
  if (!data) return null;

  const monthlyData = [
    {
      label: `${data.month}/${data.year}`,
      income: data.income,
      expenses: data.expenses,
      net: data.net,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Financial Summary</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
          <div>
            <p className="text-muted-foreground">Income</p>
            <p className="text-lg font-semibold">{formatCurrency(data.income)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Expenses</p>
            <p className="text-lg font-semibold">{formatCurrency(data.expenses)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Net</p>
            <p className="text-lg font-semibold">{formatCurrency(data.net)}</p>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="income"
                name="Income"
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="expenses"
                name="Expenses"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
              />
              <Bar dataKey="net" name="Net" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Expenses by Category</p>
          {data.expensesByCategory.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No expense categories found for this month.
            </p>
          ) : (
            <div className="space-y-2">
              {data.expensesByCategory.map((item) => (
                <div
                  key={item.category}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                >
                  <span className="capitalize">{item.category}</span>
                  <span>{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
