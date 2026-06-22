"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/error-state";

export default function AppError({
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
    <ErrorState
      title="No fue posible cargar esta pagina"
      description="Ocurrio un problema inesperado. Puede intentar nuevamente o volver al formulario publico."
      actionLabel="Intentar de nuevo"
      onAction={reset}
    />
  );
}
