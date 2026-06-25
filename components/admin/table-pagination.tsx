"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

interface Props {
  total: number;
  page: number;
  pageSize: number;
  q?: string;
  from?: string;
  to?: string;
}

export function TablePagination({ total, page, pageSize, q, from, to }: Props) {
  const router = useRouter();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const rangeFrom = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeTo = Math.min(page * pageSize, total);

  function buildUrl(newPage: number, newPageSize: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    params.set("page", String(newPage));
    if (newPageSize !== 10) params.set("pageSize", String(newPageSize));
    return `/admin?${params.toString()}`;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Filas por página:</span>
        <select
          value={pageSize}
          onChange={(e) => router.push(buildUrl(1, parseInt(e.target.value, 10)))}
          className="rounded-md border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {PAGE_SIZE_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          {total === 0
            ? "Sin registros"
            : `${rangeFrom}–${rangeTo} de ${total}`}
        </span>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => router.push(buildUrl(page - 1, pageSize))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => router.push(buildUrl(page + 1, pageSize))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
