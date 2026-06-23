import argon2 from "argon2";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

const schema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string().min(8).max(200)
});

export async function PATCH(request: Request) {
  const session = await requireApiSession("AUDITOR");
  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Solicitud inválida." }, { status: 400 });
  }

  const user = await prisma.adminUser.findUnique({ where: { id: session.user.adminId } });
  if (!user?.passwordHash) {
    return NextResponse.json(
      { message: "Tu cuenta no tiene contraseña local. Usa tu proveedor de identidad para autenticarte." },
      { status: 400 }
    );
  }

  const valid = await argon2.verify(user.passwordHash, parsed.data.currentPassword);
  if (!valid) {
    return NextResponse.json({ message: "La contraseña actual es incorrecta." }, { status: 400 });
  }

  if (parsed.data.currentPassword === parsed.data.newPassword) {
    return NextResponse.json({ message: "La nueva contraseña debe ser diferente a la actual." }, { status: 400 });
  }

  const newHash = await argon2.hash(parsed.data.newPassword, { type: argon2.argon2id });
  await prisma.adminUser.update({
    where: { id: session.user.adminId },
    data: { passwordHash: newHash, mustChangePassword: false }
  });

  return NextResponse.json({ message: "Contraseña actualizada correctamente." });
}
