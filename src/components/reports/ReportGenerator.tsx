import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ReportGenerator() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>مولد التقارير</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-center py-8">
          استخدم صفحة التقارير لإنشاء تقرير جديد
        </p>
      </CardContent>
    </Card>
  );
}
