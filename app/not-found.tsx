import { ErrorState } from "@/components/error-state";

export default function NotFound() {
  return (
    <ErrorState
      title="Pagina no encontrada"
      description="La direccion solicitada no existe o ya no esta disponible."
      showHomeLink
    />
  );
}
