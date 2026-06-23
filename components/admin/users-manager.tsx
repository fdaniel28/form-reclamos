"use client";

import type { AdminRole, AdminUser } from "@prisma/client";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreateUserForm } from "@/components/admin/create-user-form";
import { TempPasswordModal } from "@/components/admin/temp-password-modal";
import { UserActions } from "@/components/admin/user-actions";

interface Props {
  initialUsers: AdminUser[];
}

interface Created {
  email: string;
  tempPassword: string;
}

export function UsersManager({ initialUsers }: Props) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [created, setCreated] = useState<Created | null>(null);

  function handleUserCreated(user: AdminUser, tempPassword: string) {
    setUsers((prev) => [user, ...prev]);
    setCreated({ email: user.email, tempPassword });
  }

  function handleUserUpdated(updated: AdminUser) {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  }

  return (
    <>
      {created ? (
        <TempPasswordModal
          email={created.email}
          tempPassword={created.tempPassword}
          onClose={() => setCreated(null)}
        />
      ) : null}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Crear usuario administrativo</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateUserForm onCreated={handleUserCreated} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios administrativos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Correo</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Último ingreso</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.name ?? "-"}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Badge>{user.active ? "Activo" : "Inactivo"}</Badge>
                  </TableCell>
                  <TableCell>
                    {user.lastLoginAt?.toLocaleString("es-HN", { timeZone: "America/Tegucigalpa" }) ?? "-"}
                  </TableCell>
                  <TableCell>
                    <UserActions
                      userId={user.id}
                      userEmail={user.email}
                      role={user.role as AdminRole}
                      active={user.active}
                      onUpdated={handleUserUpdated}
                      onPasswordReset={(email, tempPassword) => setCreated({ email, tempPassword })}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
