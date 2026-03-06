import { useAttendanceSummary } from '@/hooks/api/useDashboard';
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
import { formatNumber, formatPercentage } from '@/utils/formatters';

const getTopAbsenteeName = (item: Record<string, unknown>, index: number): string => {
  const studentName = item.studentName;
  if (typeof studentName === 'string' && studentName.trim()) return studentName;

  const fullName = item.fullName;
  if (typeof fullName === 'string' && fullName.trim()) return fullName;

  const firstName = typeof item.firstName === 'string' ? item.firstName.trim() : '';
  const lastName = typeof item.lastName === 'string' ? item.lastName.trim() : '';
  const combined = `${firstName} ${lastName}`.trim();
  if (combined) return combined;

  return `Student ${index + 1}`;
};

const getTopAbsenceCount = (item: Record<string, unknown>): number => {
  const absentCount = item.absentCount;
  if (typeof absentCount === 'number' && Number.isFinite(absentCount)) {
    return absentCount;
  }

  const totalAbsences = item.totalAbsences;
  if (typeof totalAbsences === 'number' && Number.isFinite(totalAbsences)) {
    return totalAbsences;
  }

  return 0;
};

export function AttendanceChart() {
  const { data, isLoading } = useAttendanceSummary();

  if (isLoading) return <LoadingSpinner />;
  if (!data) return null;

  const chartData = [
    {
      name: 'Attendance',
      present: data.present,
      late: data.late,
      excused: data.excused,
      absent: data.absent,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Summary</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <div>
            <p className="text-muted-foreground">Total Records</p>
            <p className="text-lg font-semibold">{formatNumber(data.total)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Present</p>
            <p className="text-lg font-semibold">{formatNumber(data.present)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Absent</p>
            <p className="text-lg font-semibold">{formatNumber(data.absent)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Attendance Rate</p>
            <p className="text-lg font-semibold">
              {formatPercentage(data.attendanceRate)}
            </p>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="present" name="Present" fill="#22c55e" />
              <Bar dataKey="late" name="Late" fill="#eab308" />
              <Bar dataKey="excused" name="Excused" fill="#3b82f6" />
              <Bar dataKey="absent" name="Absent" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Top Absentees</p>
          {data.topAbsentees.length === 0 ? (
            <p className="text-sm text-muted-foreground">No absentee records found.</p>
          ) : (
            <div className="space-y-2">
              {data.topAbsentees.slice(0, 5).map((item, index) => (
                <div
                  key={`${getTopAbsenteeName(item, index)}-${index}`}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <span className="text-sm">{getTopAbsenteeName(item, index)}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatNumber(getTopAbsenceCount(item))} absences
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
