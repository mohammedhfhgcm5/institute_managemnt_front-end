import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { SearchInput } from './SearchInput';
import { LoadingSpinner } from './LoadingSpinner';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { ErrorMessage } from './ErrorMessage';
import { useLocale } from '@/hooks/useLocale';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  isLoading?: boolean;
  isError?: boolean;
  error?: string;
  onRetry?: () => void;
  onPageChange?: (page: number) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  actions?: React.ReactNode;
  onRowDoubleClick?: (item: T) => void;
}

export function DataTable<T extends { id: number | string }>({
  columns,
  data,
  total = 0,
  page = 1,
  limit = 10,
  totalPages = 1,
  isLoading,
  isError,
  error,
  onRetry,
  onPageChange,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  actions,
  onRowDoubleClick,
}: DataTableProps<T>) {
  const { isArabic, text } = useLocale();

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage message={error} onRetry={onRetry} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {onSearchChange && (
          <SearchInput
            value={searchValue || ''}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            className="w-full sm:max-w-sm"
          />
        )}
        {actions && (
          <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
            {actions}
          </div>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key}>{column.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {text('لا توجد بيانات', 'No data available')}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow
                  key={item.id}
                  onDoubleClick={onRowDoubleClick ? () => onRowDoubleClick(item) : undefined}
                  className={onRowDoubleClick ? 'cursor-pointer' : undefined}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {column.render
                        ? column.render(item)
                        : String((item as Record<string, unknown>)[column.key] ?? '')}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {onPageChange && totalPages > 1 && (
        <div className="flex flex-col gap-3 px-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center text-sm text-muted-foreground sm:text-start">
            {text('عرض', 'Showing')} {(page - 1) * limit + 1} -{' '}
            {Math.min(page * limit, total)} {text('من', 'of')} {total}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1 sm:flex-nowrap sm:justify-end">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(1)}
              disabled={page === 1}
            >
              {isArabic ? (
                <ChevronsRight className="h-4 w-4" />
              ) : (
                <ChevronsLeft className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
            >
              {isArabic ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
            <span className="px-3 text-sm">
              {text('صفحة', 'Page')} {page} {text('من', 'of')} {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
            >
              {isArabic ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(totalPages)}
              disabled={page === totalPages}
            >
              {isArabic ? (
                <ChevronsLeft className="h-4 w-4" />
              ) : (
                <ChevronsRight className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
