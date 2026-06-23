"use client";

import { Check, Copy, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  email: string;
  tempPassword: string;
  onClose: () => void;
}

export function TempPasswordModal({ email, tempPassword, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* panel */}
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-2xl p-6 space-y-5 mx-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">Usuario creado</h2>
            <p className="text-sm text-muted-foreground mt-0.5 break-all">{email}</p>
          </div>
          <button
            onClick={onClose}
            className="mt-0.5 rounded p-1 text-muted-foreground hover:bg-muted"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Copia esta contraseña temporal y compártela con el usuario por un canal seguro. No volverá a mostrarse.
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
            Contraseña temporal
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg border bg-muted px-4 py-3 text-sm font-mono tracking-widest select-all">
              {tempPassword}
            </code>
            <Button type="button" size="sm" variant="outline" onClick={copy} className="shrink-0">
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copiada" : "Copiar"}
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Al ingresar por primera vez, el sistema le pedirá al usuario que defina su propia contraseña antes de continuar.
        </p>

        <div className="flex justify-end">
          <Button onClick={onClose}>Entendido</Button>
        </div>
      </div>
    </div>
  );
}
