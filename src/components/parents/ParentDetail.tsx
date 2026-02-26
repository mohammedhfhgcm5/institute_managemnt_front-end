import { useParent } from '@/hooks/api/useParents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';

interface ParentDetailProps {
  parentId: number;
}

export function ParentDetail({ parentId }: ParentDetailProps) {
  const { data: parent, isLoading, isError, refetch } = useParent(parentId);

  if (isLoading) return <LoadingSpinner />;
  if (isError || !parent) return <ErrorMessage onRetry={() => refetch()} />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{parent.firstName} {parent.lastName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-muted-foreground">الهاتف</p><p className="font-medium">{parent.phone}</p></div>
          {parent.email && <div><p className="text-muted-foreground">البريد</p><p className="font-medium">{parent.email}</p></div>}
          {parent.address && <div className="col-span-2"><p className="text-muted-foreground">العنوان</p><p className="font-medium">{parent.address}</p></div>}
        </div>
      </CardContent>
    </Card>
  );
}
