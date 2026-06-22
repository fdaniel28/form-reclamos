import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { RecordsFilters } from "@/components/admin/records-filters";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import { audit } from "@/lib/audit/audit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function AdminPage({
  searchParams
}: {
  searchParams: { q?: string; from?: string; to?: string }
}) {
  const session = await requireSession("AUDITOR");
  const q = searchParams.q?.trim();
  const from = searchParams.from;
  const to = searchParams.to;
  const qNum = q && /^\d+$/.test(q) ? parseInt(q, 10) : undefined;

  const clients = await prisma.client.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { fullName: { contains: q, mode: "insensitive" } },
              { clientCode: { contains: q, mode: "insensitive" } },
              ...(qNum !== undefined ? [{ complaintNumber: { equals: qNum } }] : [])
            ]
          }
        : {}),
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(`${to}T23:59:59.999Z`) } : {})
            }
          }
        : {})
    },
    include: { _count: { select: { photos: true } } },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  if (q) {
    await audit("CLIENT_QUERY", { actorId: session.user.adminId, metadata: { q } });
  }

  return (
    <AdminShell>
      <section className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Registros recibidos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RecordsFilters initialQ={q} initialFrom={from} initialTo={to} />

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-28">No. de Queja</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Correo</TableHead>
                    <TableHead>Fotos</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-mono font-medium">
                        #{client.complaintNumber}
                      </TableCell>
                      <TableCell>{client.fullName}</TableCell>
                      <TableCell>{client.clientCode}</TableCell>
                      <TableCell className="text-muted-foreground">{client.phone ?? "—"}</TableCell>
                      <TableCell className="max-w-[180px] truncate text-muted-foreground" title={client.email ?? ""}>
                        {client.email ?? "—"}
                      </TableCell>
                      <TableCell>{client._count.photos}</TableCell>
                      <TableCell>{client.createdAt.toLocaleString("es-HN")}</TableCell>
                      <TableCell>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/clients/${client.id}`}>Detalle</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {clients.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                        No se encontraron registros.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </section>
    </AdminShell>
  );
}
