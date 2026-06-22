import ExcelJS from "exceljs";
import { requireApiSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await requireApiSession("AUDITOR");
  if (!session) {
    return new Response("No autorizado.", { status: 401 });
  }

  const q = new URL(request.url).searchParams.get("q")?.trim() || undefined;
  const qNum = q && /^\d+$/.test(q) ? parseInt(q, 10) : undefined;

  const clients = await prisma.client.findMany({
    where: q
      ? {
          OR: [
            { fullName: { contains: q, mode: "insensitive" } },
            { clientCode: { contains: q, mode: "insensitive" } },
            ...(qNum !== undefined ? [{ complaintNumber: { equals: qNum } }] : [])
          ]
        }
      : undefined,
    include: { _count: { select: { photos: true } } },
    orderBy: { complaintNumber: "asc" }
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "CREE";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Reclamos");

  sheet.columns = [
    { header: "No. de Queja", key: "complaintNumber", width: 14 },
    { header: "Nombre completo", key: "fullName", width: 42 },
    { header: "Código de cliente", key: "clientCode", width: 22 },
    { header: "Fotos adjuntas", key: "photoCount", width: 16 },
    { header: "Fecha de registro", key: "createdAt", width: 24 }
  ];

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1A4E7A" }
  };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
  headerRow.height = 20;

  for (const client of clients) {
    sheet.addRow({
      complaintNumber: client.complaintNumber,
      fullName: client.fullName,
      clientCode: client.clientCode,
      photoCount: client._count.photos,
      createdAt: client.createdAt.toLocaleString("es-HN", { timeZone: "America/Tegucigalpa" })
    });
  }

  sheet.eachRow((row: ExcelJS.Row, rowNumber: number) => {
    if (rowNumber === 1) return;
    row.alignment = { vertical: "middle" };
    if (rowNumber % 2 === 0) {
      row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0F4F8" } };
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const date = new Date().toISOString().slice(0, 10);

  return new Response(buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="reclamos-${date}.xlsx"`
    }
  });
}
