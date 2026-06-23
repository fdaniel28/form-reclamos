import { AdminShell } from "@/components/admin/admin-shell";
import { ChangePasswordForm } from "@/components/admin/change-password-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export default async function ProfilePage() {
  const session = await requireSession("AUDITOR", { allowPendingPassword: true });

  const admin = await prisma.adminUser.findUnique({
    where: { id: session.user.adminId },
    select: { mustChangePassword: true }
  });
  const forced = admin?.mustChangePassword ?? false;

  return (
    <AdminShell>
      <section className="mx-auto max-w-4xl px-4 py-6 space-y-6">
        {forced ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Debes definir tu propia contraseña antes de continuar. Elige una contraseña segura que no hayas usado antes.
          </div>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Mi perfil</CardTitle>
            <CardDescription>{session.user.email} · {session.user.role}</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cambiar contraseña</CardTitle>
            <CardDescription>
              Solo puedes cambiar tu propia contraseña. Mínimo 8 caracteres.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm forced={forced} />
          </CardContent>
        </Card>
      </section>
    </AdminShell>
  );
}
