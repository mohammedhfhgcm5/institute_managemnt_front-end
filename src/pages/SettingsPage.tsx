import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/hooks/useLocale';
import { Moon, Sun, Globe, Palette } from 'lucide-react';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { text, isArabic, direction } = useLocale();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{text('الإعدادات', 'Settings')}</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              {text('المظهر', 'Appearance')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Label className="text-base">{text('الوضع الداكن', 'Dark mode')}</Label>
                <p className="text-sm text-muted-foreground">
                  {text(
                    'تبديل بين الوضع الفاتح والداكن',
                    'Toggle between light and dark mode'
                  )}
                </p>
              </div>
              <Button variant="outline" size="icon" onClick={toggleTheme}>
                {theme === 'light' ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </Button>
            </div>
            <Separator />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Label className="text-base">{text('الوضع الحالي', 'Current mode')}</Label>
                <p className="text-sm text-muted-foreground">
                  {theme === 'light' ? text('فاتح', 'Light') : text('داكن', 'Dark')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {text('اللغة والمنطقة', 'Language & Region')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Label className="text-base">{text('اللغة', 'Language')}</Label>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? text('العربية', 'Arabic') : text('الإنجليزية', 'English')}
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Label className="text-base">{text('اتجاه النص', 'Text direction')}</Label>
                <p className="text-sm text-muted-foreground">
                  {direction === 'rtl'
                    ? text('من اليمين إلى اليسار (RTL)', 'Right to left (RTL)')
                    : text('من اليسار إلى اليمين (LTR)', 'Left to right (LTR)')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{text('معلومات النظام', 'System information')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 md:grid-cols-4">
              <div>
                <p className="text-muted-foreground">{text('الإصدار', 'Version')}</p>
                <p className="font-medium">1.0.0</p>
              </div>
              <div>
                <p className="text-muted-foreground">{text('البيئة', 'Environment')}</p>
                <p className="font-medium">{text('إنتاج', 'Production')}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{text('المستخدم الحالي', 'Current user')}</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{text('الصلاحية', 'Role')}</p>
                <p className="font-medium">{user?.role}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
