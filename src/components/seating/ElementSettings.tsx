import { VenueElement, ELEMENT_PRESETS } from "./types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Trash2 } from "lucide-react";

interface ElementSettingsProps {
  element: VenueElement;
  onUpdate: (id: string, updates: Partial<VenueElement>) => void;
  onDelete: (id: string) => void;
}

const ElementSettings = ({ element, onUpdate, onDelete }: ElementSettingsProps) => {
  const isTable = element.type === "round-table" || element.type === "rect-table";

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-foreground">
          {ELEMENT_PRESETS[element.type].icon} {ELEMENT_PRESETS[element.type].label}
        </h3>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(element.id)}>
          <Trash2 size={16} />
        </Button>
      </div>

      <div className="space-y-2">
        <Label className="font-body text-sm">שם</Label>
        <Input
          value={element.label}
          onChange={(e) => onUpdate(element.id, { label: e.target.value })}
          className="h-9"
        />
      </div>

      {isTable && (
        <div className="space-y-2">
          <Label className="font-body text-sm">כמות מקומות: {element.capacity}</Label>
          <Slider
            value={[element.capacity ?? 8]}
            onValueChange={([v]) => onUpdate(element.id, { capacity: v })}
            min={2}
            max={20}
            step={1}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="font-body text-xs text-muted-foreground">רוחב</Label>
          <Input
            type="number"
            value={element.width}
            onChange={(e) => onUpdate(element.id, { width: Number(e.target.value) })}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="font-body text-xs text-muted-foreground">גובה</Label>
          <Input
            type="number"
            value={element.height}
            onChange={(e) => onUpdate(element.id, { height: Number(e.target.value) })}
            className="h-8 text-sm"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="font-body text-sm">סיבוב: {element.rotation ?? 0}°</Label>
        <Slider
          value={[element.rotation ?? 0]}
          onValueChange={([v]) => onUpdate(element.id, { rotation: v })}
          min={0}
          max={360}
          step={5}
        />
      </div>
    </div>
  );
};

export default ElementSettings;
