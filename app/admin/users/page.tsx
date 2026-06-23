import { AdminShell } from "@/components/admin/admin-shell";
import { UsersManager } from "@/components/admin/users-manager";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export default async function UsersPage() {
  await requireSession("ADMIN");
  const users = await prisma.adminUser.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <AdminShell>
      <section className="mx-auto max-w-7xl px-4 py-6">
        <UsersManager initialUsers={users} />
      </section>
    </AdminShell>
  );
}
