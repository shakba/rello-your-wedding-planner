export type VenueElementType = "round-table" | "rect-table" | "chuppah" | "dance-floor" | "food-station" | "bar" | "dj" | "entrance";

export interface VenueElement {
  id: string;
  type: VenueElementType;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  capacity?: number;
  rotation?: number;
  tableId?: string; // linked seating_tables row
}

export interface AssignedGuest {
  guestId: string;
  fullName: string;
  rsvpStatus: string | null;
  tableId: string;
}

export const ELEMENT_PRESETS: Record<VenueElementType, { label: string; icon: string; width: number; height: number; capacity?: number }> = {
  "round-table": { label: "שולחן עגול", icon: "⭕", width: 90, height: 90, capacity: 10 },
  "rect-table": { label: "שולחן מלבני", icon: "▬", width: 120, height: 60, capacity: 8 },
  "chuppah": { label: "חופה", icon: "⛪", width: 100, height: 100 },
  "dance-floor": { label: "רחבת ריקודים", icon: "💃", width: 180, height: 180 },
  "food-station": { label: "דוכן אוכל", icon: "🍽️", width: 100, height: 60 },
  "bar": { label: "בר", icon: "🍸", width: 120, height: 50 },
  "dj": { label: "DJ", icon: "🎵", width: 80, height: 60 },
  "entrance": { label: "כניסה", icon: "🚪", width: 80, height: 40 },
};
