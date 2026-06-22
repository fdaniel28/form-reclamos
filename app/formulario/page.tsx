"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, ImagePlus, ShieldCheck, Upload, X } from "lucide-react";
import Image from "next/image";
import { DragEvent, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  fullName: z.string().trim().min(3, "Ingrese su nombre completo.").max(180),
  clientCode: z.string().trim().min(3, "Ingrese el número o código de cliente.").max(80),
  phone: z.string().trim().max(30).optional(),
  email: z.union([
    z.string().trim().email("Correo electrónico inválido."),
    z.literal("")
  ]).optional(),
  photos: z
    .custom<FileList>()
    .refine((files) => files && files.length >= 1, "Adjunte al menos una fotografía.")
    .refine((files) => files && files.length <= 5, "Puede adjuntar un máximo de 5 fotografías.")
    .refine(
      (files) =>
        files &&
        Array.from(files).every((file) =>
          ["image/jpeg", "image/png", "image/webp"].includes(file.type)
        ),
      "Solo se permiten imágenes JPG, JPEG, PNG o WEBP."
    )
    .refine(
      (files) => files && Array.from(files).every((file) => file.size <= 5 * 1024 * 1024),
      "Cada archivo debe pesar 5 MB o menos."
    ),
  website: z.string().max(0).optional()
});

type FormValues = z.infer<typeof schema>;

type Preview = { file: File; url: string };

function Header() {
  return (
    <header className="border-b bg-white shadow-sm">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-5">
        <Image src="/logo.png" width={120} height={48} alt="CREE" priority style={{ height: "auto" }} />
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Comisión Reguladora de Energía Eléctrica
          </p>
          <h1 className="text-xl font-semibold tracking-normal">Recepción de Reclamos</h1>
        </div>
      </div>
    </header>
  );
}

export default function FormularioPage() {
  const [isError, setIsError] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const photosField = register("photos");

  function updateFromFiles(newFiles: File[]) {
    const combined = [...previews.map((p) => p.file), ...newFiles].slice(0, 5);
    previews.forEach((p) => URL.revokeObjectURL(p.url));
    const next = combined.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setPreviews(next);
    const dt = new DataTransfer();
    combined.forEach((f) => dt.items.add(f));
    setValue("photos", dt.files, { shouldValidate: previews.length > 0 });
  }

  function removeFile(index: number) {
    const next = previews.filter((_, i) => i !== index);
    URL.revokeObjectURL(previews[index].url);
    setPreviews(next);
    const dt = new DataTransfer();
    next.forEach((p) => dt.items.add(p.file));
    setValue("photos", dt.files, { shouldValidate: true });
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      ["image/jpeg", "image/png", "image/webp"].includes(f.type)
    );
    if (files.length) updateFromFiles(files);
  }

  async function onSubmit(values: FormValues) {
    setErrorMsg(null);
    setIsError(false);
    const body = new FormData();
    body.append("fullName", values.fullName);
    body.append("clientCode", values.clientCode);
    body.append("phone", values.phone ?? "");
    body.append("email", values.email ?? "");
    body.append("website", values.website ?? "");
    Array.from(values.photos).forEach((file) => body.append("photos", file));

    const response = await fetch("/api/public/submissions", { method: "POST", body });

    if (!response.ok) {
      setIsError(true);
      setErrorMsg("No fue posible procesar la solicitud. Revise los datos e intente nuevamente.");
      return;
    }

    previews.forEach((p) => URL.revokeObjectURL(p.url));
    setPreviews([]);
    reset();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-muted/40">
        <Header />
        <section className="mx-auto max-w-md px-4 py-20 text-center">
          <CheckCircle2 className="mx-auto mb-5 h-16 w-16 text-green-500" />
          <h2 className="mb-2 text-2xl font-semibold">Solicitud recibida</h2>
          <p className="mb-8 text-muted-foreground">
            Gracias por enviar su reclamo. Nuestro equipo lo revisará a la brevedad.
          </p>
          <Button variant="outline" onClick={() => setSubmitted(false)}>
            Enviar otro reclamo
          </Button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/40">
      <Header />

      <section className="mx-auto grid max-w-5xl gap-6 px-4 py-8 md:grid-cols-[1fr_300px]">
        <Card>
          <CardHeader>
            <CardTitle>Formulario de reclamo</CardTitle>
            <CardDescription>
              Complete los datos y adjunte fotografías claras del caso.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre completo</Label>
                <Input
                  id="fullName"
                  placeholder="Ej. María González López"
                  autoComplete="name"
                  {...register("fullName")}
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive">{errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientCode">Número / Código de cliente</Label>
                <Input
                  id="clientCode"
                  placeholder="Ej. 123456"
                  autoComplete="off"
                  {...register("clientCode")}
                />
                {errors.clientCode && (
                  <p className="text-sm text-destructive">{errors.clientCode.message}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Teléfono <span className="text-muted-foreground">(opcional)</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Ej. +504 9999-9999"
                    autoComplete="tel"
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Correo electrónico <span className="text-muted-foreground">(opcional)</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Ej. correo@ejemplo.com"
                    autoComplete="email"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="hidden" aria-hidden="true">
                <Label htmlFor="website">Sitio web</Label>
                <Input id="website" tabIndex={-1} autoComplete="off" {...register("website")} />
              </div>

              <div className="space-y-3">
                <Label>Fotografías</Label>

                {previews.length < 5 && (
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label="Zona de carga de fotografías"
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={[
                      "cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors",
                      isDragging
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    ].join(" ")}
                  >
                    <ImagePlus className="mx-auto mb-3 h-9 w-9 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      Arrastra tus fotos aquí o haz clic para seleccionar
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      JPG, PNG o WEBP · 5 MB por archivo
                      {previews.length > 0
                        ? ` · Puedes agregar ${5 - previews.length} foto${5 - previews.length === 1 ? "" : "s"} más`
                        : " · máximo 5 fotos"}
                    </p>
                  </div>
                )}

                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  ref={(el) => {
                    photosField.ref(el);
                    fileInputRef.current = el;
                  }}
                  name={photosField.name}
                  onBlur={photosField.onBlur}
                  onChange={(e) => {
                    if (e.target.files?.length) updateFromFiles(Array.from(e.target.files));
                  }}
                />

                {previews.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {previews.map((p, i) => (
                      <div
                        key={p.url}
                        className="group relative aspect-square overflow-hidden rounded-md border bg-muted"
                      >
                        <img
                          src={p.url}
                          alt={p.file.name}
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          aria-label={`Eliminar ${p.file.name}`}
                          className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {errors.photos && (
                  <p className="text-sm text-destructive">{String(errors.photos.message)}</p>
                )}
              </div>

              {isError && errorMsg && (
                <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  <p className="text-sm text-destructive">{errorMsg}</p>
                </div>
              )}

              <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-base">
                <Upload className="h-4 w-4" />
                {isSubmitting ? "Enviando solicitud…" : "Enviar solicitud"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Carga segura
              </CardTitle>
              <CardDescription>
                Las fotografías se validan antes de almacenarse y no se publican en internet.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">¿Cómo presentar su reclamo?</CardTitle>
            </CardHeader>
            <CardContent className="-mt-2 space-y-3 text-sm text-muted-foreground">
              <p className="flex gap-2">
                <span className="font-semibold text-foreground">1.</span>
                Ingrese su nombre completo tal como aparece en su recibo.
              </p>
              <p className="flex gap-2">
                <span className="font-semibold text-foreground">2.</span>
                Indique el número o código de cliente visible en su factura.
              </p>
              <p className="flex gap-2">
                <span className="font-semibold text-foreground">3.</span>
                Adjunte fotografías nítidas de su última factura y la nota de débito o crédito.
              </p>
              <p className="flex gap-2">
                <span className="font-semibold text-foreground">4.</span>
                Presione <span className="font-medium text-foreground">Enviar solicitud</span> y espere la confirmación.
              </p>
            </CardContent>
          </Card>
        </aside>
      </section>
    </main>
  );
}
