'use client';

import { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';

export default function DiscoveryCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

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

  return (
    <div ref={containerRef} className="w-full h-full">
      <Stage width={dimensions.width} height={dimensions.height}>
        <Layer>
          <Rect
            width={dimensions.width}
            height={dimensions.height}
            fill="#0a0a0a"
          />
          <Text
            text="Discovery Canvas"
            x={dimensions.width / 2 - 60}
            y={20}
            fontSize={14}
            fill="#666666"
          />
        </Layer>
      </Stage>
    </div>
  );
}
