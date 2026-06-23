import ExcelJS from "exceljs";
import { requireApiSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { photoPublicUrl } from "@/lib/minio/client";

export const runtime = "nodejs";

const MAX_PHOTOS = 5;

export async function GET(request: Request) {
  const session = await requireApiSession("AUDITOR");
  if (!session) {
    return new Response("No autorizado.", { status: 401 });
  }

  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() || undefined;
  const from = url.searchParams.get("from") || undefined;
  const to = url.searchParams.get("to") || undefined;
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
    include: {
      _count: { select: { photos: true } },
      photos: { orderBy: { createdAt: "asc" }, take: MAX_PHOTOS }
    },
    orderBy: { complaintNumber: "asc" }
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "CREE";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Reclamos");

  sheet.columns = [
    { header: "No. de Queja",      key: "complaintNumber", width: 14 },
    { header: "Nombre completo",   key: "fullName",        width: 38 },
    { header: "Código de cliente", key: "clientCode",      width: 20 },
    { header: "Teléfono",          key: "phone",           width: 18 },
    { header: "Correo",            key: "email",           width: 30 },
    { header: "Fotos adjuntas",    key: "photoCount",      width: 14 },
    { header: "Fecha de registro", key: "createdAt",       width: 24 },
    { header: "Foto 1",            key: "foto1",           width: 18 },
    { header: "Foto 2",            key: "foto2",           width: 18 },
    { header: "Foto 3",            key: "foto3",           width: 18 },
    { header: "Foto 4",            key: "foto4",           width: 18 },
    { header: "Foto 5",            key: "foto5",           width: 18 },
  ];

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1A4E7A" } };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
  headerRow.height = 20;

  for (const [rowIndex, client] of clients.entries()) {
    const excelRow = sheet.addRow({
      complaintNumber: client.complaintNumber,
      fullName:        client.fullName,
      clientCode:      client.clientCode,
      phone:           client.phone ?? "",
      email:           client.email ?? "",
      photoCount:      client._count.photos,
      createdAt:       client.createdAt.toLocaleString("es-HN", { timeZone: "America/Tegucigalpa" })
    });

    if (rowIndex % 2 === 1) {
      excelRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0F4F8" } };
    }
    excelRow.alignment = { vertical: "middle" };

    for (let i = 0; i < client.photos.length; i++) {
      const photoUrl = photoPublicUrl(client.photos[i].id);
      const cell = excelRow.getCell(8 + i);
      cell.value = { text: `Foto ${i + 1}`, hyperlink: photoUrl };
      cell.font = { color: { argb: "FF0563C1" }, underline: true };
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const date = new Date().toISOString().slice(0, 10);

  return new Response(buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="reclamos-${date}.xlsx"`
    }
  });
}
