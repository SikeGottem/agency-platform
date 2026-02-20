"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, ImageIcon } from "lucide-react";
import Image from "next/image";

interface Asset {
  id: string;
  storage_path: string;
  file_name: string;
  file_type: string;
  category: string;
}

interface MoodBoardProps {
  projectId: string;
  /** Pre-fetched assets (server-side). If not provided, fetches client-side. */
  assets?: Asset[];
}

export function MoodBoard({ projectId, assets: initialAssets }: MoodBoardProps) {
  const [assets, setAssets] = useState<Asset[]>(initialAssets ?? []);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(!initialAssets);
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  useEffect(() => {
    async function loadAssets() {
      if (!initialAssets) {
        const { data } = await supabase
          .from("assets")
          .select("*")
          .eq("project_id", projectId)
          .order("uploaded_at", { ascending: true });

        if (data) {
          setAssets(data as unknown as Asset[]);
        }
        setLoading(false);
      }
    }

    loadAssets();
  }, [projectId, initialAssets, supabase]);

  useEffect(() => {
    async function signUrls() {
      // Parallelise signed URL generation instead of sequential loop
      const results = await Promise.all(
        assets.map((asset) =>
          supabase.storage
            .from("project-assets")
            .createSignedUrl(asset.storage_path, 3600)
            .then(({ data }) => [asset.id, data?.signedUrl] as const)
        )
      );
      const urls: Record<string, string> = {};
      for (const [id, url] of results) {
        if (url) urls[id] = url;
      }
      setImageUrls(urls);
    }

    if (assets.length > 0) {
      signUrls();
    }
  }, [assets, supabase]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  if (assets.length === 0) {
    return null;
  }

  // Group images for masonry: distribute into columns
  const columnCount = assets.length <= 2 ? assets.length : assets.length <= 4 ? 2 : 3;
  const columns: Asset[][] = Array.from({ length: columnCount }, () => []);
  assets.forEach((asset, i) => {
    columns[i % columnCount].push(asset);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Mood Board
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}
        >
          {columns.map((column, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-3">
              {column.map((asset) => (
                <div
                  key={asset.id}
                  className="group relative overflow-hidden rounded-lg border bg-muted"
                >
                  {imageUrls[asset.id] ? (
                    <Image
                      src={imageUrls[asset.id]}
                      alt={asset.file_name}
                      width={400}
                      height={400}
                      className="h-auto w-full object-cover transition-transform group-hover:scale-105"
                      unoptimized
                    />
                  ) : (
                    <div className="flex aspect-square items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  {/* Overlay with filename on hover */}
                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <p className="truncate text-xs text-white">
                      {asset.file_name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
