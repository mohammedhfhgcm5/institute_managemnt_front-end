import { useParent } from '@/hooks/api/useParents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { useLocale } from '@/hooks/useLocale';

interface ParentDetailProps {
  parentId: number;
}

export function ParentDetail({ parentId }: ParentDetailProps) {
  const { text } = useLocale();
  const { data: parent, isLoading, isError, refetch } = useParent(parentId);

  if (isLoading) return <LoadingSpinner />;
  if (isError || !parent) return <ErrorMessage onRetry={() => refetch()} />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{parent.firstName} {parent.lastName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div><p className="text-muted-foreground">{text('الهاتف', 'Phone')}</p><p className="font-medium">{parent.phone}</p></div>
          {parent.email && <div><p className="text-muted-foreground">{text('البريد', 'Email')}</p><p className="font-medium">{parent.email}</p></div>}
          {parent.address && <div className="col-span-2"><p className="text-muted-foreground">{text('العنوان', 'Address')}</p><p className="font-medium">{parent.address}</p></div>}
        </div>
      </CardContent>
    </Card>
  );
}
