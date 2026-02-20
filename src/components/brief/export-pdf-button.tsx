"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";

interface ExportPdfButtonProps {
  projectId: string;
}

export function ExportPdfButton({ projectId }: ExportPdfButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    setIsExporting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/pdf`);
      if (!res.ok) throw new Error("Failed to export");

      const contentType = res.headers.get("Content-Type") ?? "";
      const a = document.createElement("a");

      if (contentType.includes("application/pdf")) {
        const blob = await res.blob();
        a.href = URL.createObjectURL(blob);
        a.download =
          res.headers.get("Content-Disposition")?.split("filename=")[1]?.replace(/"/g, "") ??
          "brief.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
      } else {
        const data = await res.json();
        a.href = data.url;
        a.download = "brief.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch {
      alert("Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isExporting}
    >
      {isExporting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="mr-2 h-4 w-4" />
      )}
      {isExporting ? "Generating..." : "Export PDF"}
    </Button>
  );
}
