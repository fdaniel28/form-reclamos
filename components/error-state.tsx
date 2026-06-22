"use client";

import Link from "next/link";
import { AlertTriangle, Home, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ErrorStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  showHomeLink?: boolean;
};

export function ErrorState({
  title,
  description,
  actionLabel,
  onAction,
  showHomeLink = true
}: ErrorStateProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
      <Card className="w-full max-w-lg">
        <CardHeader className="items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          {onAction && actionLabel ? (
            <Button type="button" onClick={onAction}>
              <RefreshCcw className="h-4 w-4" aria-hidden="true" />
              {actionLabel}
            </Button>
          ) : null}
          {showHomeLink ? (
            <Button asChild variant="outline">
              <Link href="/formulario">
                <Home className="h-4 w-4" aria-hidden="true" />
                Ir al formulario
              </Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}
