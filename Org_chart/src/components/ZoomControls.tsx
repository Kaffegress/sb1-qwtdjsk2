import { ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  minZoom: number;
  maxZoom: number;
}

export function ZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
  minZoom,
  maxZoom,
}: ZoomControlsProps) {
  const zoomPercentage = Math.round(zoom * 100);

  return (
    <div className="absolute bottom-6 right-6 z-10 bg-white rounded-lg shadow-lg border border-slate-200 p-2 flex flex-col gap-2">
      <button
        onClick={onZoomIn}
        disabled={zoom >= maxZoom}
        className="p-2 hover:bg-slate-100 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed group relative"
        title="Zoom In (+)"
      >
        <ZoomIn className="w-5 h-5 text-slate-700" />
      </button>

      <div className="px-2 py-1 text-center">
        <span className="text-xs font-medium text-slate-600">{zoomPercentage}%</span>
      </div>

      <button
        onClick={onZoomOut}
        disabled={zoom <= minZoom}
        className="p-2 hover:bg-slate-100 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed group relative"
        title="Zoom Out (-)"
      >
        <ZoomOut className="w-5 h-5 text-slate-700" />
      </button>

      <div className="h-px bg-slate-200 my-1" />

      <button
        onClick={onReset}
        className="p-2 hover:bg-slate-100 rounded transition-colors group relative"
        title="Reset View (0)"
      >
        <Maximize2 className="w-5 h-5 text-slate-700" />
      </button>

      <div className="absolute -left-48 top-0 bg-slate-800 text-white text-xs px-3 py-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="space-y-1">
          <div>+/- : Zoom</div>
          <div>0 : Reset</div>
          <div>Arrows : Pan</div>
          <div>Wheel : Zoom</div>
          <div>Drag : Pan</div>
        </div>
      </div>
    </div>
  );
}
