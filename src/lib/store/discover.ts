import { create } from 'zustand';
import type { PexelsImage as UnsplashImage } from '@/lib/pexels';

export interface CanvasImage extends UnsplashImage {
  // Canvas positioning
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  scale: number;
  targetScale: number;
  opacity: number;
  targetOpacity: number;
  rotation: number;
  vx: number;
  vy: number;
  selected: boolean;
  // For physics
  radius: number;
  spawned: number; // timestamp
}

interface DiscoverState {
  query: string;
  images: CanvasImage[];
  selectedIds: Set<string>;
  loading: boolean;
  error: string | null;
  apiKeyMissing: boolean;

  setQuery: (q: string) => void;
  setLoading: (l: boolean) => void;
  setError: (e: string | null) => void;
  setApiKeyMissing: (v: boolean) => void;
  addImages: (images: UnsplashImage[], centerX: number, centerY: number) => void;
  clearImages: () => void;
  toggleSelect: (id: string) => void;
  clearSelection: () => void;
  updateImagePosition: (id: string, x: number, y: number) => void;
  getSelectedImages: () => CanvasImage[];
}

export const useDiscoverStore = create<DiscoverState>((set, get) => ({
  query: '',
  images: [],
  selectedIds: new Set(),
  loading: false,
  error: null,
  apiKeyMissing: false,

  setQuery: (query) => set({ query }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setApiKeyMissing: (apiKeyMissing) => set({ apiKeyMissing }),

  addImages: (newImages, centerX, centerY) => {
    const existing = get().images;
    const existingIds = new Set(existing.map((i) => i.id));
    const now = Date.now();

    const filteredNew = newImages.filter((img) => !existingIds.has(img.id));

    // Pre-calculate positions: row-based layout with uniform gaps
    const GAP = 14;
    const ROW_HEIGHT = 120; // matches IMG_DISPLAY_SIZE
    const MAX_ROW_WIDTH = 900;
    const positions: { x: number; y: number }[] = [];
    let cursorX = 0;
    let cursorY = 0;
    const rowImages: { w: number; idx: number }[][] = [[]];

    // First pass: assign images to rows based on their width
    for (let idx = 0; idx < filteredNew.length; idx++) {
      const img = filteredNew[idx];
      const aspect = img.width / img.height;
      const imgW = ROW_HEIGHT * aspect;
      if (cursorX + imgW > MAX_ROW_WIDTH && rowImages[rowImages.length - 1].length > 0) {
        rowImages.push([]);
        cursorX = 0;
      }
      rowImages[rowImages.length - 1].push({ w: imgW, idx });
      cursorX += imgW + GAP;
    }

    // Second pass: center each row and compute positions
    let yOffset = 0;
    for (const row of rowImages) {
      const totalW = row.reduce((sum, r) => sum + r.w, 0) + (row.length - 1) * GAP;
      let xOffset = -totalW / 2;
      for (const item of row) {
        positions[item.idx] = {
          x: centerX + xOffset + item.w / 2,
          y: centerY + yOffset,
        };
        xOffset += item.w + GAP;
      }
      yOffset += ROW_HEIGHT + GAP;
    }
    // Center vertically
    const totalHeight = rowImages.length * ROW_HEIGHT + (rowImages.length - 1) * GAP;
    for (const pos of positions) {
      pos.y -= totalHeight / 2;
    }

    const canvasImages: CanvasImage[] = filteredNew
      .map((img, i) => {
        const targetX = positions[i].x;
        const targetY = positions[i].y;
        const baseScale = 1;

        return {
          ...img,
          x: centerX, // start at center
          y: centerY,
          targetX,
          targetY,
          scale: 0.1, // start tiny
          targetScale: baseScale,
          opacity: 0,
          targetOpacity: 1,
          rotation: 0,
          vx: 0,
          vy: 0,
          selected: false,
          radius: 60 * baseScale,
          spawned: now + i * 40, // stagger spawn
        };
      });

    set({ images: [...existing, ...canvasImages] });
  },

  clearImages: () => set({ images: [], selectedIds: new Set() }),

  toggleSelect: (id) => {
    const selectedIds = new Set(get().selectedIds);
    const images = get().images.map((img) => {
      if (img.id === id) {
        const nowSelected = !img.selected;
        if (nowSelected) selectedIds.add(id);
        else selectedIds.delete(id);
        return { ...img, selected: nowSelected };
      }
      return img;
    });
    set({ images, selectedIds });
  },

  clearSelection: () => {
    const images = get().images.map((img) => ({ ...img, selected: false }));
    set({ images, selectedIds: new Set() });
  },

  updateImagePosition: (id, x, y) => {
    const images = get().images.map((img) =>
      img.id === id ? { ...img, x, y, targetX: x, targetY: y } : img
    );
    set({ images });
  },

  getSelectedImages: () => {
    return get().images.filter((img) => img.selected);
  },
}));
