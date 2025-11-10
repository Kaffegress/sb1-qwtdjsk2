import { useState, useRef, useCallback, useEffect } from 'react';
import { HierarchyNodeWithAssignments } from '../types';
import { OrgChartNode } from './OrgChartNode';
import { ZoomControls } from './ZoomControls';

interface OrgChartProps {
  nodes: HierarchyNodeWithAssignments[];
  onDropOnNode: (nodeId: string, memberId: string) => void;
  onRemoveMember: (nodeId: string, memberId: string) => void;
}

export function OrgChart({ nodes, onDropOnNode, onRemoveMember }: OrgChartProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const MIN_ZOOM = 0.25;
  const MAX_ZOOM = 2;
  const ZOOM_STEP = 0.1;

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setZoom((prev) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev + delta)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isInteractive =
      target.closest('button') ||
      target.closest('[draggable="true"]') ||
      target.tagName === 'BUTTON' ||
      target.getAttribute('draggable') === 'true';

    if (e.button === 0 && !isInteractive) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    switch (e.key) {
      case '+':
      case '=':
        e.preventDefault();
        handleZoomIn();
        break;
      case '-':
      case '_':
        e.preventDefault();
        handleZoomOut();
        break;
      case '0':
        e.preventDefault();
        handleResetZoom();
        break;
      case 'ArrowUp':
        e.preventDefault();
        setPan((prev) => ({ ...prev, y: prev.y + 50 }));
        break;
      case 'ArrowDown':
        e.preventDefault();
        setPan((prev) => ({ ...prev, y: prev.y - 50 }));
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setPan((prev) => ({ ...prev, x: prev.x + 50 }));
        break;
      case 'ArrowRight':
        e.preventDefault();
        setPan((prev) => ({ ...prev, x: prev.x - 50 }));
        break;
    }
  }, [handleZoomIn, handleZoomOut, handleResetZoom]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const renderNode = (node: HierarchyNodeWithAssignments) => {
    return (
      <div key={node.id} className="flex flex-col items-center">
        <OrgChartNode
          node={node}
          onDropOnNode={onDropOnNode}
          onRemoveMember={onRemoveMember}
        />

        {node.children.length > 0 && (
          <>
            <div className="h-12 w-0.5 bg-slate-300" />
            <div className="flex gap-8 relative">
              {node.children.length > 1 && (
                <div
                  className="absolute top-0 h-0.5 bg-slate-300"
                  style={{
                    left: '50%',
                    right: '50%',
                    transform: `translateX(-50%)`,
                    width: `${(node.children.length - 1) * 200 + 100}px`,
                  }}
                />
              )}
              {node.children.map((child) => renderNode(child))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 relative"
      onMouseDown={handleMouseDown}
    >
      <ZoomControls
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleResetZoom}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
      />

      <div
        ref={contentRef}
        className={`absolute inset-0 flex justify-center items-center ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
        }}
      >
        <div className="flex justify-center min-w-max p-12">
          {nodes.map((node) => renderNode(node))}
        </div>
      </div>
    </div>
  );
}
