import { useRef, useState, useCallback } from "react";
import { VenueElement, ELEMENT_PRESETS } from "./types";
import { cn } from "@/lib/utils";

interface CanvasElementProps {
  element: VenueElement;
  selected: boolean;
  scale: number;
  onSelect: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  assignedCount?: number;
}

const CanvasElement = ({ element, selected, scale, onSelect, onMove, assignedCount = 0 }: CanvasElementProps) => {
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const isTable = element.type === "round-table" || element.type === "rect-table";
  const preset = ELEMENT_PRESETS[element.type];

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect(element.id);
      setDragging(true);
      dragOffset.current = {
        x: e.clientX / scale - element.x,
        y: e.clientY / scale - element.y,
      };

      const handleMouseMove = (ev: MouseEvent) => {
        const newX = Math.max(0, ev.clientX / scale - dragOffset.current.x);
        const newY = Math.max(0, ev.clientY / scale - dragOffset.current.y);
        onMove(element.id, Math.round(newX), Math.round(newY));
      };

      const handleMouseUp = () => {
        setDragging(false);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [element.id, element.x, element.y, scale, onSelect, onMove]
  );

  const capacityFill = isTable && element.capacity ? assignedCount / element.capacity : 0;

  return (
    <div
      onMouseDown={handleMouseDown}
      className={cn(
        "absolute flex flex-col items-center justify-center cursor-grab select-none transition-shadow",
        element.type === "round-table" && "rounded-full",
        element.type === "rect-table" && "rounded-xl",
        element.type === "dance-floor" && "rounded-2xl",
        element.type === "chuppah" && "rounded-2xl",
        !isTable && element.type !== "dance-floor" && element.type !== "chuppah" && "rounded-lg",
        selected ? "ring-2 ring-primary shadow-elevated z-20" : "z-10",
        dragging && "cursor-grabbing opacity-80",
        isTable ? "border-2 border-border bg-card" : "border border-dashed border-muted-foreground/40 bg-secondary/80"
      )}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
      }}
    >
      <span className="text-lg leading-none">{preset.icon}</span>
      <span className="mt-0.5 text-[10px] font-body font-semibold text-foreground leading-tight text-center px-1 truncate max-w-full">
        {element.label}
      </span>
      {isTable && element.capacity && (
        <div className="mt-0.5 flex items-center gap-0.5">
          <div className="h-1.5 w-10 rounded-full bg-secondary overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                capacityFill >= 1 ? "bg-destructive" : capacityFill >= 0.7 ? "bg-accent" : "bg-sage"
              )}
              style={{ width: `${Math.min(capacityFill * 100, 100)}%` }}
            />
          </div>
          <span className="text-[9px] font-body text-muted-foreground">
            {assignedCount}/{element.capacity}
          </span>
        </div>
      )}
    </div>
  );
};

export default CanvasElement;
