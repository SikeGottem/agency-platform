// Lightweight color extraction using canvas sampling
// No external deps — works in browser

export interface ColorPalette {
  colors: string[];
  dominant: string;
}

export async function extractColors(imageUrl: string, numColors = 5): Promise<ColorPalette> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const size = 50; // sample at small size for speed
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ colors: ['#333333'], dominant: '#333333' });
          return;
        }

        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;

        // Simple k-means-ish: bucket colors
        const buckets = new Map<string, { r: number; g: number; b: number; count: number }>();
        for (let i = 0; i < data.length; i += 4) {
          // Quantize to reduce palette
          const r = Math.round(data[i] / 32) * 32;
          const g = Math.round(data[i + 1] / 32) * 32;
          const b = Math.round(data[i + 2] / 32) * 32;
          const key = `${r},${g},${b}`;
          const existing = buckets.get(key);
          if (existing) {
            existing.r += data[i];
            existing.g += data[i + 1];
            existing.b += data[i + 2];
            existing.count++;
          } else {
            buckets.set(key, { r: data[i], g: data[i + 1], b: data[i + 2], count: 1 });
          }
        }

        // Sort by frequency, take top N
        const sorted = Array.from(buckets.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, numColors)
          .map((b) => {
            const r = Math.round(b.r / b.count);
            const g = Math.round(b.g / b.count);
            const bl = Math.round(b.b / b.count);
            return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bl.toString(16).padStart(2, '0')}`;
          });

        resolve({
          colors: sorted,
          dominant: sorted[0] || '#333333',
        });
      } catch {
        resolve({ colors: ['#333333'], dominant: '#333333' });
      }
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
}
