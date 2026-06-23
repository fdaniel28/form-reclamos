import Link from "next/link";
import { ReactNode } from "react";
import { SignOutButton } from "@/components/admin/sign-out-button";
import { requireSession } from "@/lib/auth/session";

export async function AdminShell({ children }: { children: ReactNode }) {
  const session = await requireSession("AUDITOR", { allowPendingPassword: true });
  return (
    <main className="min-h-screen bg-muted/40">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-lg font-semibold">
              CREE Admin
            </Link>
            <nav className="flex gap-4 text-sm text-muted-foreground">
              {session.user.role !== "AUDITOR" && <Link href="/admin">Registros</Link>}
              {session.user.role === "ADMIN" && <Link href="/admin/users">Usuarios</Link>}
              {session.user.role === "ADMIN" && <Link href="/admin/audit">Auditoría</Link>}
              {session.user.role === "AUDITOR" && <Link href="/admin/audit">Auditoría</Link>}
              {session.user.role === "ADMIN" && <Link href="/admin/settings">Configuración</Link>}
            </nav>
          </div>
          <div className="text-right text-sm">
            <Link href="/admin/profile" className="font-medium hover:underline">
              {session.user.email}
            </Link>
            <p className="text-muted-foreground">{session.user.role}</p>
            <SignOutButton />
          </div>
        </div>
      </header>
      {children}
    </main>
  );
}
