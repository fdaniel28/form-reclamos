"use client";

import { Eye } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function PhotoLink({ photoId }: { photoId: string }) {
  const [loading, setLoading] = useState(false);

  async function openPhoto() {
    setLoading(true);
    try {
      window.open(`/api/admin/photos?id=${encodeURIComponent(photoId)}`, "_blank", "noopener,noreferrer");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={openPhoto} disabled={loading}>
      <Eye className="h-4 w-4" />
      {loading ? "Generando" : "Ver"}
    </Button>
  );
}
