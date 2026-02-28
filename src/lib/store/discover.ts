import { create } from 'zustand';
import type { UnsplashImage } from '@/lib/unsplash';

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

    const canvasImages: CanvasImage[] = newImages
      .filter((img) => !existingIds.has(img.id))
      .map((img, i) => {
        // Burst layout: spread in a circle from center
        const angle = (i / newImages.length) * Math.PI * 2 + Math.random() * 0.3;
        const distance = 150 + Math.random() * 200;
        const targetX = centerX + Math.cos(angle) * distance;
        const targetY = centerY + Math.sin(angle) * distance;
        // Subtle size variation based on index (first results = slightly larger)
        const baseScale = 0.8 + (1 - i / newImages.length) * 0.3;

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
          rotation: (Math.random() - 0.5) * 6,
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
