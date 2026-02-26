import { useState } from 'react';
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
        {actions && <div className="flex gap-2">{actions}</div>}
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
                  لا توجد بيانات
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
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-muted-foreground">
            عرض {(page - 1) * limit + 1} - {Math.min(page * limit, total)} من {total}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(1)}
              disabled={page === 1}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <span className="px-3 text-sm">
              صفحة {page} من {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(totalPages)}
              disabled={page === totalPages}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
