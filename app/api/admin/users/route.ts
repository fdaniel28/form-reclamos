import argon2 from "argon2";
import { AdminRole, Prisma } from "@prisma/client";
import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { audit } from "@/lib/audit/audit";
import { requireApiSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

const patchSchema = z.object({
  id: z.string().uuid(),
  active: z.boolean().optional(),
  role: z.nativeEnum(AdminRole).optional()
});

const createSchema = z.object({
  email: z.string().email().max(254).transform((value) => value.toLowerCase()),
  name: z.string().trim().max(180).optional().nullable(),
  role: z.nativeEnum(AdminRole).default("REVISOR"),
  active: z.boolean().default(true)
});

function generateTempPassword(): string {
  const upper   = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower   = "abcdefghjkmnpqrstuvwxyz";
  const digits  = "23456789";
  const special = "!@#$%&";
  const all = upper + lower + digits + special;

  const bytes = randomBytes(16);
  // garantiza al menos un carácter de cada tipo
  const parts = [
    upper  [bytes[0]  % upper.length],
    lower  [bytes[1]  % lower.length],
    digits [bytes[2]  % digits.length],
    special[bytes[3]  % special.length],
    ...Array.from({ length: 8 }, (_, i) => all[bytes[4 + i] % all.length])
  ];

  // mezcla Fisher-Yates con los bytes ya generados
  for (let i = parts.length - 1; i > 0; i--) {
    const j = bytes[i] % (i + 1);
    [parts[i], parts[j]] = [parts[j], parts[i]];
  }

  return parts.join("");
}

export async function GET() {
  const session = await requireApiSession("ADMIN");
  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }
  const users = await prisma.adminUser.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ users });
}

export async function PATCH(request: Request) {
  const session = await requireApiSession("ADMIN");
  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Solicitud inválida." }, { status: 400 });
  }

  const before = await prisma.adminUser.findUnique({ where: { id: parsed.data.id } });
  if (!before) {
    return NextResponse.json({ message: "No encontrado." }, { status: 404 });
  }

  const user = await prisma.adminUser.update({
    where: { id: parsed.data.id },
    data: {
      active: parsed.data.active,
      role: parsed.data.role
    }
  });

  if (parsed.data.role && parsed.data.role !== before.role) {
    await audit("ROLE_CHANGE", { actorId: session.user.adminId, targetId: user.id, metadata: { from: before.role, to: user.role } });
  }
  if (typeof parsed.data.active === "boolean" && parsed.data.active !== before.active) {
    await audit("USER_STATUS_CHANGE", { actorId: session.user.adminId, targetId: user.id, metadata: { active: user.active } });
  }

  return NextResponse.json({ user });
}

export async function POST(request: Request) {
  const session = await requireApiSession("ADMIN");
  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Solicitud inválida." }, { status: 400 });
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await argon2.hash(tempPassword, { type: argon2.argon2id });

  try {
    const user = await prisma.adminUser.create({
      data: {
        email: parsed.data.email,
        name: parsed.data.name || null,
        role: parsed.data.role,
        active: parsed.data.active,
        passwordHash,
        mustChangePassword: true
      }
    });

    await audit("USER_CREATED", {
      actorId: session.user.adminId,
      targetId: user.id,
      metadata: { role: user.role, active: user.active }
    });

    return NextResponse.json({ user, tempPassword }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ message: "El correo electrónico ya está registrado." }, { status: 409 });
    }
    return NextResponse.json({ message: "No fue posible procesar la solicitud." }, { status: 400 });
  }
}
