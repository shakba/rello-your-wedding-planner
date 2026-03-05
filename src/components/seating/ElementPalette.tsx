import { ELEMENT_PRESETS, VenueElementType } from "./types";

interface ElementPaletteProps {
  onAdd: (type: VenueElementType) => void;
}

const ElementPalette = ({ onAdd }: ElementPaletteProps) => {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <h3 className="mb-3 font-display text-lg font-bold text-foreground">אלמנטים</h3>
      <div className="grid grid-cols-2 gap-2">
        {(Object.entries(ELEMENT_PRESETS) as [VenueElementType, typeof ELEMENT_PRESETS[VenueElementType]][]).map(
          ([type, preset]) => (
            <button
              key={type}
              onClick={() => onAdd(type)}
              className="flex flex-col items-center gap-1 rounded-xl border border-border bg-secondary/50 p-3 text-sm font-body text-foreground transition-colors hover:bg-primary/10 hover:border-primary/30"
            >
              <span className="text-xl">{preset.icon}</span>
              <span className="text-xs">{preset.label}</span>
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default ElementPalette;
