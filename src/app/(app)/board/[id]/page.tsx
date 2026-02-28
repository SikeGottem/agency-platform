'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { extractColors, type ColorPalette } from '@/lib/color-extract';

interface BoardImage {
  id: string;
  image_url: string;
  thumbnail_url: string | null;
  width: number;
  height: number;
  source_id: string | null;
}

interface Board {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
}

export default function BoardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const boardId = params.id as string;
  const [board, setBoard] = useState<Board | null>(null);
  const [images, setImages] = useState<BoardImage[]>([]);
  const [palettes, setPalettes] = useState<Map<string, ColorPalette>>(new Map());
  const [loading, setLoading] = useState(true);
  const [combinedPalette, setCombinedPalette] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const boardRes = await (supabase as any).from('boards').select('*').eq('id', boardId).single();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const imagesRes = await (supabase as any).from('board_images').select('*').eq('board_id', boardId).order('created_at');

      if (boardRes.data) setBoard(boardRes.data as Board);
      if (imagesRes.data) setImages(imagesRes.data as BoardImage[]);
      setLoading(false);
    };
    load();
  }, [boardId]);

  // Extract colors from images
  useEffect(() => {
    if (images.length === 0) return;
    const extract = async () => {
      const newPalettes = new Map<string, ColorPalette>();
      const allColors: string[] = [];

      for (const img of images.slice(0, 12)) {
        try {
          const palette = await extractColors(img.thumbnail_url || img.image_url);
          newPalettes.set(img.id, palette);
          allColors.push(...palette.colors);
        } catch {
          // skip
        }
      }

      setPalettes(newPalettes);
      // Deduplicate and pick top colors for combined palette
      const colorCounts = new Map<string, number>();
      allColors.forEach((c) => colorCounts.set(c, (colorCounts.get(c) || 0) + 1));
      const sorted = Array.from(colorCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([c]) => c);
      setCombinedPalette(sorted);
    };
    extract();
  }, [images]);

  const handleDelete = async () => {
    if (!confirm('Delete this board?')) return;
    const supabase = createClient();
    await supabase.from('board_images').delete().eq('board_id', boardId);
    await supabase.from('boards').delete().eq('id', boardId);
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-text-tertiary">Loading board...</div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-text-tertiary">Board not found</p>
        <Button variant="ghost" onClick={() => router.push('/dashboard')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{board.title}</h1>
            <p className="text-text-tertiary text-sm">
              {images.length} images · {new Date(board.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-400 hover:text-red-300">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>

      {/* Design DNA — Color Palette */}
      {combinedPalette.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-text-secondary">Design DNA — Color Palette</h2>
          <div className="flex gap-2">
            {combinedPalette.map((color, i) => (
              <div key={i} className="group relative">
                <div
                  className="w-10 h-10 rounded-lg border border-white/10 shadow-sm transition-transform group-hover:scale-110"
                  style={{ backgroundColor: color }}
                />
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity">
                  {color}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map((img) => (
            <div key={img.id} className="group relative">
              <div className="aspect-[4/3] rounded-lg overflow-hidden bg-bg-tertiary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.thumbnail_url || img.image_url}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              {/* Per-image palette */}
              {palettes.has(img.id) && (
                <div className="flex gap-0.5 mt-1">
                  {palettes.get(img.id)!.colors.slice(0, 5).map((c, i) => (
                    <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-text-tertiary">No images in this board yet</div>
      )}
    </div>
  );
}
