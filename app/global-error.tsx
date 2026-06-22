"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/error-state";
import "./globals.css";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="es">
      <body>
        <ErrorState
          title="La aplicacion encontro un error"
          description="La sesion no pudo continuar correctamente. Intente recargar la aplicacion."
          actionLabel="Recargar"
          onAction={reset}
        />
      </body>
    </html>
  );
}
