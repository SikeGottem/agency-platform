'use client';

import { useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Sparkles, Plus, Save, X } from 'lucide-react';
import { useDiscoverStore } from '@/lib/store/discover';
import { createClient } from '@/lib/supabase/client';
import type { UnsplashSearchResponse } from '@/lib/unsplash';

const DiscoveryCanvas = dynamic(
  () => import('@/components/canvas/discovery-canvas'),
  { ssr: false }
);

export default function DiscoverPage() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');
  const [savingBoard, setSavingBoard] = useState(false);
  const [boardName, setBoardName] = useState('');
  const [showBoardDialog, setShowBoardDialog] = useState(false);
  const canvasCenterRef = useRef({ x: 400, y: 300 });

  const {
    images,
    selectedIds,
    loading,
    error,
    apiKeyMissing,
    setQuery,
    setLoading,
    setError,
    setApiKeyMissing,
    addImages,
    clearImages,
    toggleSelect,
    clearSelection,
    getSelectedImages,
  } = useDiscoverStore();

  const searchImages = useCallback(
    async (query: string, centerX?: number, centerY?: number) => {
      if (!query.trim()) return;
      setLoading(true);
      setError(null);
      setQuery(query);

      try {
        const res = await fetch(`/api/images/search?q=${encodeURIComponent(query)}&per_page=20`);
        const data = await res.json();

        if (!res.ok) {
          if (data.error === 'missing_api_key') {
            setApiKeyMissing(true);
            setError(data.message);
          } else {
            setError(data.message || 'Search failed');
          }
          return;
        }

        const result = data as UnsplashSearchResponse;
        const cx = centerX ?? canvasCenterRef.current.x;
        const cy = centerY ?? canvasCenterRef.current.y;
        addImages(result.images, cx, cy);
      } catch {
        setError('Failed to search. Check your connection.');
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, setQuery, setApiKeyMissing, addImages]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      searchImages(inputValue);
    }
  };

  const handleMoreLikeThis = useCallback(() => {
    const selected = getSelectedImages();
    if (selected.length === 0) return;
    const img = selected[0];
    // Search by tags or description
    const searchTerm = img.tags.length > 0 ? img.tags.join(' ') : img.description || '';
    if (searchTerm) {
      searchImages(searchTerm, img.x, img.y);
    }
  }, [getSelectedImages, searchImages]);

  const handleSaveToBoard = async () => {
    if (!boardName.trim()) return;
    const selected = getSelectedImages();
    if (selected.length === 0) return;

    setSavingBoard(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('You must be logged in to save boards');
        return;
      }

      // Create board
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: board, error: boardErr } = await (supabase as any)
        .from('boards')
        .insert({
          user_id: user.id,
          title: boardName.trim(),
          thumbnail_url: selected[0].thumbnailUrl,
        })
        .select('id')
        .single();

      if (boardErr || !board) {
        setError('Failed to create board');
        return;
      }

      // Insert board images
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const boardImages = selected.map((img: any, i: number) => ({
        board_id: (board as any).id,
        image_url: img.url,
        thumbnail_url: img.thumbnailUrl,
        source: 'unsplash',
        source_id: img.id,
        position_x: i % 4,
        position_y: Math.floor(i / 4),
        scale: 1,
        width: img.width,
        height: img.height,
      }));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('board_images').insert(boardImages);

      setShowBoardDialog(false);
      setBoardName('');
      clearSelection();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.push(`/board/${(board as any).id}`);
    } catch {
      setError('Failed to save board');
    } finally {
      setSavingBoard(false);
    }
  };

  const hasSelection = selectedIds.size > 0;
  const hasImages = images.length > 0;

  return (
    <div className="flex flex-col h-full -m-6">
      {/* Canvas area */}
      <div className="flex-1 relative bg-bg-primary">
        <DiscoveryCanvas />

        {/* Empty state overlay — only when no images */}
        {!hasImages && !loading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center space-y-3">
              {apiKeyMissing ? (
                <>
                  <p className="text-yellow-400 text-lg font-medium">⚠️ Unsplash API Key Missing</p>
                  <p className="text-text-tertiary text-sm max-w-md">
                    Add <code className="bg-bg-tertiary px-1.5 py-0.5 rounded text-xs">UNSPLASH_ACCESS_KEY</code> to
                    your .env.local file.
                    <br />
                    Get one free at{' '}
                    <span className="text-accent">unsplash.com/developers</span>
                  </p>
                </>
              ) : (
                <>
                  <p className="text-text-tertiary text-lg">Search for inspiration to fill your canvas</p>
                  <p className="text-text-tertiary text-sm">
                    Try &quot;minimal architecture&quot; or &quot;warm color palettes&quot;
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-bg-secondary/90 backdrop-blur-sm px-4 py-2 rounded-full border border-border flex items-center gap-2 z-10">
            <Loader2 className="h-4 w-4 animate-spin text-accent" />
            <span className="text-sm text-text-secondary">Searching...</span>
          </div>
        )}

        {/* Error toast */}
        {error && !apiKeyMissing && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-lg z-10">
            <span className="text-sm text-red-400">{error}</span>
          </div>
        )}

        {/* Selection toolbar */}
        {hasSelection && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-bg-secondary/95 backdrop-blur-sm border border-border rounded-xl px-4 py-3 flex items-center gap-3 z-10 shadow-lg">
            <span className="text-sm text-text-secondary">{selectedIds.size} selected</span>
            <div className="w-px h-5 bg-border" />
            <Button size="sm" variant="ghost" onClick={handleMoreLikeThis}>
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              More like this
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setBoardName('');
                setShowBoardDialog(true);
              }}
            >
              <Save className="h-3.5 w-3.5 mr-1.5" />
              Save to Board
            </Button>
            <Button size="sm" variant="ghost" onClick={clearSelection}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {/* Save to board dialog */}
        {showBoardDialog && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
            <div className="bg-bg-secondary border border-border rounded-xl p-6 w-80 space-y-4">
              <h3 className="font-semibold">Save to New Board</h3>
              <Input
                placeholder="Board name..."
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveToBoard()}
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={() => setShowBoardDialog(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveToBoard} disabled={savingBoard || !boardName.trim()}>
                  {savingBoard ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create & Save'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search bar at bottom */}
      <form onSubmit={handleSearch} className="p-4 border-t border-border bg-bg-secondary">
        <div className="max-w-2xl mx-auto relative flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
            <Input
              placeholder="Search for design inspiration..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="pl-10"
              disabled={loading}
            />
          </div>
          {hasImages && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                clearImages();
                setInputValue('');
              }}
              className="text-text-tertiary"
            >
              Clear
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
