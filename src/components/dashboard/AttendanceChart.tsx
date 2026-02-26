import { useAttendanceChart } from '@/hooks/api/useDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export function AttendanceChart() {
  const { data, isLoading } = useAttendanceChart();

  if (isLoading) return <LoadingSpinner />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>إحصائيات الحضور (آخر 30 يوم)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="present"
                name="حاضر"
                stackId="1"
                stroke="#22c55e"
                fill="#22c55e"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="late"
                name="متأخر"
                stackId="1"
                stroke="#eab308"
                fill="#eab308"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="absent"
                name="غائب"
                stackId="1"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
