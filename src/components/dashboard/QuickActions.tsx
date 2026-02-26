import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  UserPlus,
  ClipboardCheck,
  CreditCard,
  FileText,
  Bell,
  BookPlus,
} from 'lucide-react';

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    { title: 'إضافة طالب', icon: UserPlus, href: '/students', color: 'text-blue-600' },
    { title: 'تسجيل حضور', icon: ClipboardCheck, href: '/attendance', color: 'text-green-600' },
    { title: 'إضافة دفعة', icon: CreditCard, href: '/payments', color: 'text-yellow-600' },
    { title: 'إنشاء تقرير', icon: FileText, href: '/reports', color: 'text-purple-600' },
    { title: 'إرسال إشعار', icon: Bell, href: '/notifications', color: 'text-orange-600' },
    { title: 'إضافة مادة', icon: BookPlus, href: '/courses', color: 'text-indigo-600' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>إجراءات سريعة</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {actions.map((action) => (
            <Button
              key={action.title}
              variant="outline"
              className="flex h-auto flex-col gap-2 p-4"
              onClick={() => navigate(action.href)}
            >
              <action.icon className={`h-6 w-6 ${action.color}`} />
              <span className="text-xs">{action.title}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
