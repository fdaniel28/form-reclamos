"use client";

import type { AdminRole, AdminUser } from "@prisma/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  userId: string;
  role: AdminRole;
  active: boolean;
  onUpdated: (user: AdminUser) => void;
  onPasswordReset: (email: string, tempPassword: string) => void;
  userEmail: string;
}

export function UserActions({ userId, role, active, onUpdated, onPasswordReset, userEmail }: Props) {
  const [loading, setLoading] = useState(false);

  async function patch(payload: { role?: AdminRole; active?: boolean; resetPassword?: true }) {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, ...payload })
      });
      if (response.ok) {
        const data = await response.json();
        onUpdated(data.user as AdminUser);
        if (data.tempPassword) {
          onPasswordReset(userEmail, data.tempPassword);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        className="h-9 rounded-md border bg-background px-2 text-sm"
        value={role}
        disabled={loading}
        onChange={(event) => patch({ role: event.target.value as AdminRole })}
      >
        <option value="ADMIN">ADMIN</option>
        <option value="REVISOR">REVISOR</option>
        <option value="AUDITOR">AUDITOR</option>
      </select>
      <Button variant="outline" size="sm" disabled={loading} onClick={() => patch({ active: !active })}>
        {active ? "Desactivar" : "Activar"}
      </Button>
      <Button variant="outline" size="sm" disabled={loading} onClick={() => patch({ resetPassword: true })}>
        Restablecer contraseña
      </Button>
    </div>
  );
}
