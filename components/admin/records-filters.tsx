"use client";

import { Download, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  initialQ?: string;
  initialFrom?: string;
  initialTo?: string;
}

export function RecordsFilters({ initialQ = "", initialFrom = "", initialTo = "" }: Props) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return; }
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const qs = params.toString();
      router.push(`/admin${qs ? `?${qs}` : ""}`);
    }, 400);
    return () => clearTimeout(timer);
  }, [q, from, to, router]);

  const hasFilters = q || from || to;
  const exportParams = new URLSearchParams();
  if (q) exportParams.set("q", q);
  if (from) exportParams.set("from", from);
  if (to) exportParams.set("to", to);
  const exportHref = `/api/admin/export${exportParams.toString() ? `?${exportParams.toString()}` : ""}`;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por No. de queja, nombre o código de cliente"
            className="pl-9"
          />
        </div>
        <Button asChild variant="outline">
          <a href={exportHref} download>
            <Download className="h-4 w-4" />
            Exportar Excel
          </a>
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Desde</Label>
          <Input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-44"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Hasta</Label>
          <Input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-44"
          />
        </div>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setQ(""); setFrom(""); setTo(""); }}
            className="text-muted-foreground"
          >
            <X className="h-3 w-3" />
            Limpiar filtros
          </Button>
        )}
      </div>
    </div>
  );
}
