"use client";

import { useState, useEffect } from "react";
import { Palette, Eye, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export interface Deliverable {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string; // "image/png", "application/pdf", etc.
  version: number;
  round: number;
  created_at: string;
}

interface DeliverablesSectionProps {
  projectId: string;
  designerName: string;
}

export function DeliverablesSection({ projectId, designerName }: DeliverablesSectionProps) {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingItem, setViewingItem] = useState<Deliverable | null>(null);

  useEffect(() => {
    async function fetchDeliverables() {
      try {
        const res = await fetch(`/api/client/projects/${projectId}/deliverables`);
        if (res.ok) {
          const data = await res.json();
          setDeliverables(data.deliverables ?? []);
        }
      } catch {
        // silent fail — empty state shown
      } finally {
        setLoading(false);
      }
    }
    fetchDeliverables();
  }, [projectId]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-stone-200/60 bg-white p-6">
        <div className="flex items-center gap-2 text-stone-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading concepts...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-stone-200/60 bg-white p-6">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-stone-900 mb-4 flex items-center gap-2">
          <Palette className="h-5 w-5 text-[#E05252]" />
          Concepts & Deliverables
        </h2>

        {deliverables.length === 0 ? (
          <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50/50 p-10 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
              <Palette className="h-6 w-6 text-amber-400" />
            </div>
            <p className="text-sm font-medium text-stone-600 mb-1">
              {designerName} is working on your project
            </p>
            <p className="text-xs text-stone-400">
              Concepts will appear here once shared with you.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {deliverables.map((d) => (
              <div
                key={d.id}
                className="group relative rounded-xl border border-stone-200 bg-stone-50 overflow-hidden hover:border-stone-300 transition-colors"
              >
                {/* Thumbnail */}
                {d.file_type.startsWith("image/") ? (
                  <div className="aspect-[4/3] relative">
                    <Image
                      src={d.file_url}
                      alt={d.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="aspect-[4/3] flex items-center justify-center bg-stone-100">
                    <span className="text-xs font-medium text-stone-400 uppercase">
                      {d.file_type.split("/")[1] || "File"}
                    </span>
                  </div>
                )}

                {/* Info */}
                <div className="p-3">
                  <p className="text-sm font-medium text-stone-800 truncate">{d.title}</p>
                  {d.description && (
                    <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">{d.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-stone-400">
                    <span>v{d.version}</span>
                    <span>·</span>
                    <span>Round {d.round}</span>
                  </div>
                </div>

                {/* View overlay */}
                <button
                  onClick={() => setViewingItem(d)}
                  className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors"
                >
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-sm">
                    <Eye className="h-3.5 w-3.5" />
                    View full size
                  </span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {viewingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setViewingItem(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full bg-white rounded-2xl overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-stone-100">
              <div>
                <h3 className="font-medium text-stone-900">{viewingItem.title}</h3>
                <p className="text-xs text-stone-500">
                  Version {viewingItem.version} · Round {viewingItem.round}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setViewingItem(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 flex items-center justify-center max-h-[75vh] overflow-auto">
              {viewingItem.file_type.startsWith("image/") ? (
                <Image
                  src={viewingItem.file_url}
                  alt={viewingItem.title}
                  width={1200}
                  height={800}
                  className="max-w-full h-auto object-contain"
                />
              ) : (
                <iframe
                  src={viewingItem.file_url}
                  className="w-full h-[70vh]"
                  title={viewingItem.title}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
