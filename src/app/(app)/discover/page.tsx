'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const DiscoveryCanvas = dynamic(
  () => import('@/components/canvas/discovery-canvas'),
  { ssr: false }
);

export default function DiscoverPage() {
  const [query, setQuery] = useState('');

  return (
    <div className="flex flex-col h-full -m-6">
      {/* Canvas area */}
      <div className="flex-1 relative bg-bg-primary">
        <DiscoveryCanvas />

        {/* Empty state overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center space-y-3">
            <p className="text-text-tertiary text-lg">
              Search for inspiration to fill your canvas
            </p>
            <p className="text-text-tertiary text-sm">
              Try &quot;minimal architecture&quot; or &quot;warm color palettes&quot;
            </p>
          </div>
        </div>
      </div>

      {/* Search bar at bottom */}
      <div className="p-4 border-t border-border bg-bg-secondary">
        <div className="max-w-2xl mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
          <Input
            placeholder="Search for design inspiration..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
    </div>
  );
}
