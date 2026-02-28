'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Group, Rect, Image as KonvaImage, Ring } from 'react-konva';
import type Konva from 'konva';
import { useDiscoverStore, type CanvasImage } from '@/lib/store/discover';

const LERP = 0.08;
const COLLISION_STRENGTH = 0.5;
const DAMPING = 0.92;
const IMG_DISPLAY_SIZE = 120;

// Hook to load an HTML image
function useImage(src: string): HTMLImageElement | null {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!src) return;
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => setImage(img);
    return () => {
      img.onload = null;
    };
  }, [src]);
  return image;
}

// Individual image node
function CanvasImageNode({ data }: { data: CanvasImage }) {
  const image = useImage(data.smallUrl || data.thumbnailUrl);
  const toggleSelect = useDiscoverStore((s) => s.toggleSelect);
  const updatePosition = useDiscoverStore((s) => s.updateImagePosition);
  const groupRef = useRef<Konva.Group>(null);

  const size = IMG_DISPLAY_SIZE * data.scale;
  const aspectRatio = data.width / data.height;
  const displayW = aspectRatio >= 1 ? size : size * aspectRatio;
  const displayH = aspectRatio >= 1 ? size / aspectRatio : size;

  return (
    <Group
      ref={groupRef}
      x={data.x}
      y={data.y}
      opacity={data.opacity}
      rotation={data.rotation}
      draggable
      onDragEnd={(e) => {
        updatePosition(data.id, e.target.x(), e.target.y());
      }}
      onClick={() => toggleSelect(data.id)}
      onTap={() => toggleSelect(data.id)}
    >
      {/* Selection glow */}
      {data.selected && (
        <Rect
          x={-displayW / 2 - 4}
          y={-displayH / 2 - 4}
          width={displayW + 8}
          height={displayH + 8}
          cornerRadius={8}
          fill="transparent"
          stroke="#6366f1"
          strokeWidth={2.5}
          shadowColor="#6366f1"
          shadowBlur={16}
          shadowOpacity={0.6}
        />
      )}
      {/* Color placeholder while loading */}
      <Rect
        x={-displayW / 2}
        y={-displayH / 2}
        width={displayW}
        height={displayH}
        cornerRadius={6}
        fill={data.color}
      />
      {/* Actual image */}
      {image && (
        <KonvaImage
          image={image}
          x={-displayW / 2}
          y={-displayH / 2}
          width={displayW}
          height={displayH}
          cornerRadius={6}
        />
      )}
      {/* Hover cursor hint */}
      <Rect
        x={-displayW / 2}
        y={-displayH / 2}
        width={displayW}
        height={displayH}
        cornerRadius={6}
        fill="transparent"
        onMouseEnter={(e) => {
          const stage = e.target.getStage();
          if (stage) stage.container().style.cursor = 'pointer';
        }}
        onMouseLeave={(e) => {
          const stage = e.target.getStage();
          if (stage) stage.container().style.cursor = 'default';
        }}
      />
    </Group>
  );
}

export default function DiscoveryCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const animRef = useRef<number>(0);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  const images = useDiscoverStore((s) => s.images);

  // Resize handler
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Physics loop
  useEffect(() => {
    const store = useDiscoverStore;
    let running = true;

    const tick = () => {
      if (!running) return;
      const state = store.getState();
      const imgs = state.images;
      if (imgs.length === 0) {
        animRef.current = requestAnimationFrame(tick);
        return;
      }

      const now = Date.now();
      let changed = false;
      const updated = imgs.map((img) => {
        // Stagger: don't animate until spawned
        if (now < img.spawned) return img;

        let { x, y, vx, vy, scale, opacity } = img;
        const { targetX, targetY, targetScale, targetOpacity } = img;

        // Lerp to target
        const dx = targetX - x;
        const dy = targetY - y;
        vx += dx * LERP;
        vy += dy * LERP;

        // Damping
        vx *= DAMPING;
        vy *= DAMPING;

        x += vx;
        y += vy;
        scale += (targetScale - scale) * 0.1;
        opacity += (targetOpacity - opacity) * 0.1;

        if (
          Math.abs(dx) > 0.1 ||
          Math.abs(dy) > 0.1 ||
          Math.abs(targetScale - scale) > 0.001 ||
          Math.abs(targetOpacity - opacity) > 0.001
        ) {
          changed = true;
        }

        return { ...img, x, y, vx, vy, scale, opacity };
      });

      // Soft collision
      for (let i = 0; i < updated.length; i++) {
        for (let j = i + 1; j < updated.length; j++) {
          const a = updated[i];
          const b = updated[j];
          const ddx = a.x - b.x;
          const ddy = a.y - b.y;
          const dist = Math.sqrt(ddx * ddx + ddy * ddy);
          const minDist = a.radius + b.radius;
          if (dist < minDist && dist > 0) {
            const overlap = (minDist - dist) * COLLISION_STRENGTH;
            const nx = ddx / dist;
            const ny = ddy / dist;
            updated[i] = {
              ...updated[i],
              targetX: updated[i].targetX + nx * overlap,
              targetY: updated[i].targetY + ny * overlap,
            };
            updated[j] = {
              ...updated[j],
              targetX: updated[j].targetX - nx * overlap,
              targetY: updated[j].targetY - ny * overlap,
            };
            changed = true;
          }
        }
      }

      if (changed) {
        store.setState({ images: updated });
      }

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  // Pan and zoom
  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const scaleBy = 1.05;
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    const clampedScale = Math.max(0.2, Math.min(3, newScale));

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    stage.scale({ x: clampedScale, y: clampedScale });
    stage.position({
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    });
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full">
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        draggable
        onWheel={handleWheel}
      >
        <Layer>
          <Rect
            width={dimensions.width * 5}
            height={dimensions.height * 5}
            x={-dimensions.width * 2}
            y={-dimensions.height * 2}
            fill="#0a0a0a"
          />
          {images.map((img) => (
            <CanvasImageNode key={img.id} data={img} />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
