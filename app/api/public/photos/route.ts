import { Readable } from "node:stream";
import { env } from "@/lib/env";
import { minioClient, photoPublicToken } from "@/lib/minio/client";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

const MIME_MAP: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const token = searchParams.get("token");

  if (!id || !token) {
    return new Response("Solicitud inválida.", { status: 400 });
  }

  const expected = photoPublicToken(id);
  if (token !== expected) {
    return new Response("Token inválido.", { status: 403 });
  }

  const photo = await prisma.clientPhoto.findUnique({ where: { id } });
  if (!photo) {
    return new Response("No encontrado.", { status: 404 });
  }

  const ext = photo.objectKey.split(".").pop()?.toLowerCase() ?? "";
  const contentType = MIME_MAP[ext] ?? "application/octet-stream";

  const stream = await minioClient.getObject(env.minio.bucket, photo.objectKey);
  const webStream = Readable.toWeb(stream) as ReadableStream;

  return new Response(webStream, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Disposition": "inline",
    },
  });
}
