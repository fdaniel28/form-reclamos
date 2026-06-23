"use client";

import type { AdminRole, AdminUser } from "@prisma/client";
import { UserPlus } from "lucide-react";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  onCreated: (user: AdminUser, tempPassword: string) => void;
}

export function CreateUserForm({ onCreated }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    // Guardar referencia antes del primer await — event.currentTarget se vuelve null en async
    const formEl = event.currentTarget;
    const form = new FormData(formEl);

    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: (form.get("email") as string).trim(),
        name: form.get("name"),
        role: form.get("role") as AdminRole,
        active: form.get("active") === "on"
      })
    });

    setLoading(false);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.message ?? "No fue posible crear el usuario.");
      return;
    }

    const data = await response.json();
    formEl.reset();
    onCreated(data.user as AdminUser, data.tempPassword as string);
  }

  return (
    <form className="grid gap-4 md:grid-cols-[1fr_1fr_160px_120px]" onSubmit={submit}>
      <div className="space-y-2">
        <Label htmlFor="email">Correo institucional</Label>
        <Input id="email" name="email" type="email" required maxLength={254} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" name="name" maxLength={180} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Rol</Label>
        <select id="role" name="role" className="h-10 w-full rounded-md border bg-background px-3 text-sm" defaultValue="REVISOR">
          <option value="ADMIN">ADMIN</option>
          <option value="REVISOR">REVISOR</option>
          <option value="AUDITOR">AUDITOR</option>
        </select>
      </div>
      <div className="flex items-end">
        <label className="flex h-10 items-center gap-2 text-sm">
          <input name="active" type="checkbox" defaultChecked />
          Activo
        </label>
      </div>
      <div className="md:col-span-4">
        <Button type="submit" disabled={loading}>
          <UserPlus className="h-4 w-4" />
          {loading ? "Creando..." : "Crear usuario"}
        </Button>
        {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
      </div>
    </form>
  );
}
