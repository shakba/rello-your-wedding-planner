import { useRef, useState, useCallback } from "react";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VenueElement } from "./types";
import CanvasElement from "./CanvasElement";

interface SeatingCanvasProps {
  elements: VenueElement[];
  selectedId: string | null;
  onSelectElement: (id: string | null) => void;
  onMoveElement: (id: string, x: number, y: number) => void;
  getAssignedCount: (elementId: string) => number;
}

const CANVAS_W = 1600;
const CANVAS_H = 1000;

const SeatingCanvas = ({ elements, selectedId, onSelectElement, onMoveElement, getAssignedCount }: SeatingCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.7);

  const zoomIn = () => setScale((s) => Math.min(s + 0.1, 2));
  const zoomOut = () => setScale((s) => Math.max(s - 0.1, 0.3));
  const fitView = () => setScale(0.7);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onSelectElement(null);
    },
    [onSelectElement]
  );

  return (
    <div className="relative flex-1 overflow-hidden rounded-2xl border border-border bg-secondary/30">
      {/* Zoom controls */}
      <div className="absolute top-3 left-3 z-30 flex items-center gap-1 rounded-xl border border-border bg-card/90 p-1 backdrop-blur-sm">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={zoomOut}><ZoomOut size={16} /></Button>
        <span className="min-w-[3rem] text-center text-xs font-body text-muted-foreground">{Math.round(scale * 100)}%</span>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={zoomIn}><ZoomIn size={16} /></Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={fitView}><Maximize2 size={16} /></Button>
      </div>

      {/* Canvas area */}
      <div ref={containerRef} className="h-full w-full overflow-auto p-4">
        <div
          onClick={handleCanvasClick}
          className="relative border border-dashed border-border/60 bg-card/50 rounded-xl"
          style={{
            width: CANVAS_W * scale,
            height: CANVAS_H * scale,
            backgroundImage: `radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)`,
            backgroundSize: `${20 * scale}px ${20 * scale}px`,
          }}
        >
          <div style={{ transform: `scale(${scale})`, transformOrigin: "top right", width: CANVAS_W, height: CANVAS_H, position: "relative" }}>
            {elements.map((el) => (
              <CanvasElement
                key={el.id}
                element={el}
                selected={selectedId === el.id}
                scale={scale}
                onSelect={onSelectElement}
                onMove={onMoveElement}
                assignedCount={getAssignedCount(el.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatingCanvas;
