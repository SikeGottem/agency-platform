"use client";

import { Download, FileCheck, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Deliverable } from "./deliverables-section";

interface DownloadSectionProps {
  deliverables: Deliverable[];
  projectStatus: string;
}

export function DownloadSection({ deliverables, projectStatus }: DownloadSectionProps) {
  if (projectStatus !== "reviewed" || deliverables.length === 0) return null;

  return (
    <div className="rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50/80 to-white p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
          <PackageCheck className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-emerald-900">
            Project Complete
          </h2>
          <p className="text-xs text-emerald-600">
            Your deliverables are ready to download
          </p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {deliverables.map((d) => (
          <div
            key={d.id}
            className="flex items-center justify-between rounded-lg border border-emerald-100 bg-white p-3"
          >
            <div className="flex items-center gap-3">
              <FileCheck className="h-4 w-4 text-emerald-500" />
              <div>
                <p className="text-sm font-medium text-stone-800">{d.title}</p>
                <p className="text-[10px] text-stone-400">
                  v{d.version} · {d.file_type.split("/")[1]?.toUpperCase()}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <a href={d.file_url} download target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4" />
              </a>
            </Button>
          </div>
        ))}
      </div>

      {deliverables.length > 1 && (
        <Button
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          onClick={() => {
            // Download all files sequentially
            deliverables.forEach((d, i) => {
              setTimeout(() => {
                const a = document.createElement("a");
                a.href = d.file_url;
                a.download = d.title;
                a.target = "_blank";
                a.click();
              }, i * 300);
            });
          }}
        >
          <Download className="h-4 w-4 mr-2" />
          Download All ({deliverables.length} files)
        </Button>
      )}
    </div>
  );
}
