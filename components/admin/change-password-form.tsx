"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ChangePasswordForm({ forced = false }: { forced?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    const form = new FormData(event.currentTarget);
    const currentPassword = form.get("currentPassword") as string;
    const newPassword = form.get("newPassword") as string;
    const confirmPassword = form.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      setMessage({ text: "La nueva contraseña y la confirmación no coinciden.", ok: false });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await response.json();
      if (response.ok) {
        setMessage({ text: data.message, ok: true });
        (event.target as HTMLFormElement).reset();
        if (forced) {
          router.push("/admin");
        }
      } else {
        setMessage({ text: data.message, ok: false });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="grid gap-4 max-w-sm" onSubmit={submit}>
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Contraseña actual</Label>
        <Input id="currentPassword" name="currentPassword" type="password" required autoComplete="current-password" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="newPassword">Nueva contraseña</Label>
        <Input id="newPassword" name="newPassword" type="password" required minLength={8} maxLength={200} autoComplete="new-password" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} maxLength={200} autoComplete="new-password" />
      </div>
      <div>
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : forced ? "Definir contraseña y continuar" : "Cambiar contraseña"}
        </Button>
        {message ? (
          <p className={`mt-2 text-sm ${message.ok ? "text-green-600" : "text-destructive"}`}>
            {message.text}
          </p>
        ) : null}
      </div>
    </form>
  );
}
